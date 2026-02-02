"""
Agent 1: The Scout - REAL CDSE DATA INTEGRATION
Fetches Sentinel-1 GRD data from Copernicus Data Space Ecosystem (CDSE)

CDSE API Documentation:
https://documentation.dataspace.copernicus.eu/APIs/OData.html

Supported Products:
- Sentinel-1 GRD (IW mode) - 10m resolution
- VV and VH polarizations
"""
import os
import json
import logging
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import tempfile

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


# ============ CDSE API CONFIGURATION ============

CDSE_AUTH_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
CDSE_CATALOG_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
CDSE_DOWNLOAD_URL = "https://zipper.dataspace.copernicus.eu/odata/v1/Products"

# Sentinel-1 product specifications
S1_PRODUCT_TYPE = "GRD"
S1_SENSOR_MODE = "IW"  # Interferometric Wide Swath
S1_POLARIZATION = "VV VH"  # Dual polarization


@dataclass
class Sentinel1Product:
    """Metadata for a Sentinel-1 product"""
    id: str
    name: str
    sensing_start: datetime
    sensing_end: datetime
    footprint_wkt: str
    size_bytes: int
    polarization: str
    relative_orbit: int
    download_url: str
    quicklook_url: Optional[str] = None
    cloud_cover: float = 0.0  # SAR has no cloud issues but keep for consistency


@dataclass
class ScoutResult:
    """Result from Scout agent search"""
    products: List[Sentinel1Product]
    total_found: int
    search_polygon_wkt: str
    date_range: Tuple[str, str]
    cached: bool = False
    error: Optional[str] = None


class CDSEAuth:
    """Handles CDSE OAuth2 authentication"""
    
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self._token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None
    
    async def get_token(self) -> str:
        """Get valid access token, refreshing if needed"""
        if self._token and self._token_expiry and datetime.utcnow() < self._token_expiry:
            return self._token
        
        return await self._fetch_token()
    
    async def _fetch_token(self) -> str:
        """Fetch new access token from CDSE"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                CDSE_AUTH_URL,
                data={
                    "grant_type": "password",
                    "username": self.username,
                    "password": self.password,
                    "client_id": "cdse-public",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                logger.error(f"CDSE auth failed: {response.text}")
                raise Exception(f"CDSE authentication failed: {response.status_code}")
            
            data = response.json()
            self._token = data["access_token"]
            # Token expires in ~10 minutes, refresh at 8 minutes
            self._token_expiry = datetime.utcnow() + timedelta(minutes=8)
            
            logger.info("CDSE authentication successful")
            return self._token


class ScoutAgent:
    """
    The Scout Agent - Discovers and retrieves Sentinel-1 data from CDSE
    
    Features:
    - Query CDSE catalog for Sentinel-1 GRD products
    - Filter by polygon, date range, polarization
    - Download products to local cache
    - Support for historical data analysis
    """
    
    def __init__(self):
        self.auth: Optional[CDSEAuth] = None
        self.cache_dir = Path(tempfile.gettempdir()) / "aerisq_cache"
        self.cache_dir.mkdir(exist_ok=True)
        
        # Initialize auth if credentials available
        if settings.CDSE_USERNAME and settings.CDSE_PASSWORD:
            self.auth = CDSEAuth(settings.CDSE_USERNAME, settings.CDSE_PASSWORD)
            logger.info("CDSE credentials configured")
        else:
            logger.warning("CDSE credentials not configured - demo mode only")
    
    def _polygon_to_wkt(self, geojson_polygon: Dict) -> str:
        """Convert GeoJSON polygon to WKT format for CDSE query"""
        coords = geojson_polygon.get("coordinates", [[]])[0]
        # Ensure polygon is closed
        if coords[0] != coords[-1]:
            coords = coords + [coords[0]]
        
        coord_str = ", ".join(f"{c[0]} {c[1]}" for c in coords)
        return f"POLYGON(({coord_str}))"
    
    def _build_catalog_query(
        self,
        polygon_wkt: str,
        date_start: str,
        date_end: str,
        max_results: int = 20
    ) -> str:
        """
        Build OData query for CDSE catalog
        
        Query filters:
        - Collection: SENTINEL-1  
        - ProductType: GRD
        - Spatial intersection with polygon
        - Temporal range
        """
        # URL encode the WKT
        from urllib.parse import quote
        
        # Build filter components
        filters = [
            f"Collection/Name eq 'SENTINEL-1'",
            f"Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq '{S1_PRODUCT_TYPE}')",
            f"ContentDate/Start ge {date_start}T00:00:00.000Z",
            f"ContentDate/End le {date_end}T23:59:59.999Z",
            f"OData.CSC.Intersects(area=geography'SRID=4326;{polygon_wkt}')"
        ]
        
        filter_str = " and ".join(filters)
        
        query = (
            f"{CDSE_CATALOG_URL}"
            f"?$filter={quote(filter_str)}"
            f"&$orderby=ContentDate/Start desc"
            f"&$top={max_results}"
            f"&$expand=Attributes"
        )
        
        return query
    
    async def search_products(
        self,
        polygon: Dict,
        date_start: str,
        date_end: str,
        max_results: int = 10
    ) -> ScoutResult:
        """
        Search CDSE catalog for Sentinel-1 products
        
        Args:
            polygon: GeoJSON polygon geometry
            date_start: Start date (YYYY-MM-DD)
            date_end: End date (YYYY-MM-DD)
            max_results: Maximum number of products to return
            
        Returns:
            ScoutResult with found products
        """
        polygon_wkt = self._polygon_to_wkt(polygon)
        
        if not self.auth:
            logger.warning("No CDSE credentials - returning demo results")
            return self._generate_demo_results(polygon_wkt, date_start, date_end)
        
        try:
            token = await self.auth.get_token()
            query_url = self._build_catalog_query(polygon_wkt, date_start, date_end, max_results)
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    query_url,
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code != 200:
                    logger.error(f"CDSE catalog query failed: {response.text}")
                    return ScoutResult(
                        products=[],
                        total_found=0,
                        search_polygon_wkt=polygon_wkt,
                        date_range=(date_start, date_end),
                        error=f"Catalog query failed: {response.status_code}"
                    )
                
                data = response.json()
                products = self._parse_catalog_response(data)
                
                logger.info(f"Found {len(products)} Sentinel-1 products")
                
                return ScoutResult(
                    products=products,
                    total_found=len(products),
                    search_polygon_wkt=polygon_wkt,
                    date_range=(date_start, date_end)
                )
                
        except Exception as e:
            logger.error(f"CDSE search error: {e}")
            return ScoutResult(
                products=[],
                total_found=0,
                search_polygon_wkt=polygon_wkt,
                date_range=(date_start, date_end),
                error=str(e)
            )
    
    def _parse_catalog_response(self, data: Dict) -> List[Sentinel1Product]:
        """Parse CDSE OData response into product list"""
        products = []
        
        for item in data.get("value", []):
            try:
                # Extract attributes
                attrs = {}
                for attr in item.get("Attributes", []):
                    attrs[attr.get("Name", "")] = attr.get("Value")
                
                product = Sentinel1Product(
                    id=item.get("Id", ""),
                    name=item.get("Name", ""),
                    sensing_start=datetime.fromisoformat(
                        item.get("ContentDate", {}).get("Start", "").replace("Z", "+00:00")
                    ),
                    sensing_end=datetime.fromisoformat(
                        item.get("ContentDate", {}).get("End", "").replace("Z", "+00:00")
                    ),
                    footprint_wkt=item.get("Footprint", ""),
                    size_bytes=item.get("ContentLength", 0),
                    polarization=attrs.get("polarisationChannels", "VV VH"),
                    relative_orbit=int(attrs.get("relativeOrbitNumber", 0)),
                    download_url=f"{CDSE_DOWNLOAD_URL}({item.get('Id', '')})/$value",
                    quicklook_url=item.get("Quicklook", {}).get("@odata.mediaContentType")
                )
                products.append(product)
            except Exception as e:
                logger.warning(f"Failed to parse product: {e}")
                continue
        
        return products
    
    async def download_product(
        self,
        product: Sentinel1Product,
        output_dir: Optional[Path] = None
    ) -> Optional[Path]:
        """
        Download a Sentinel-1 product from CDSE
        
        Args:
            product: Product metadata
            output_dir: Directory to save file (default: cache dir)
            
        Returns:
            Path to downloaded file, or None if failed
        """
        if not self.auth:
            logger.error("Cannot download without CDSE credentials")
            return None
        
        output_dir = output_dir or self.cache_dir
        output_path = output_dir / f"{product.name}.zip"
        
        # Check cache
        if output_path.exists():
            logger.info(f"Using cached product: {product.name}")
            return output_path
        
        try:
            token = await self.auth.get_token()
            
            logger.info(f"Downloading {product.name} ({product.size_bytes / 1e6:.1f} MB)")
            
            async with httpx.AsyncClient(timeout=600.0) as client:
                response = await client.get(
                    product.download_url,
                    headers={"Authorization": f"Bearer {token}"},
                    follow_redirects=True
                )
                
                if response.status_code != 200:
                    logger.error(f"Download failed: {response.status_code}")
                    return None
                
                # Save to file
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                logger.info(f"Downloaded to: {output_path}")
                return output_path
                
        except Exception as e:
            logger.error(f"Download error: {e}")
            return None
    
    def _generate_demo_results(
        self,
        polygon_wkt: str,
        date_start: str,
        date_end: str
    ) -> ScoutResult:
        """Generate demo results when CDSE is not available"""
        
        # Create realistic-looking demo products
        start = datetime.strptime(date_start, "%Y-%m-%d")
        
        demo_products = []
        for i in range(3):
            sensing_date = start + timedelta(days=i * 6)  # S1 revisit ~6 days
            
            product = Sentinel1Product(
                id=f"demo-{hashlib.md5(f'{sensing_date}'.encode()).hexdigest()[:8]}",
                name=f"S1A_IW_GRDH_1SDV_{sensing_date.strftime('%Y%m%dT%H%M%S')}_DEMO",
                sensing_start=sensing_date,
                sensing_end=sensing_date + timedelta(seconds=25),
                footprint_wkt=polygon_wkt,
                size_bytes=500_000_000,
                polarization="VV VH",
                relative_orbit=100 + i,
                download_url="demo://not-available"
            )
            demo_products.append(product)
        
        logger.info(f"Generated {len(demo_products)} demo products (CDSE not configured)")
        
        return ScoutResult(
            products=demo_products,
            total_found=len(demo_products),
            search_polygon_wkt=polygon_wkt,
            date_range=(date_start, date_end),
            cached=True,  # Indicate demo mode
            error="Demo mode - CDSE credentials not configured"
        )
    
    def get_historical_baselines(
        self,
        polygon: Dict,
        reference_year: int = 2020
    ) -> Dict[int, float]:
        """
        Get historical baseline values for a region.
        
        For proper drought detection, we compare current values
        to historical baselines (e.g., same month in previous years).
        
        Args:
            polygon: GeoJSON polygon
            reference_year: Year to use as baseline
            
        Returns:
            Dict of month -> baseline mean σ0 dB
        """
        # In production, this would query a database of historical analyses
        # For now, return seasonal baselines for Mediterranean region
        
        # These are approximate values for agricultural areas
        seasonal_baselines = {
            1: -9.5,   # January - wet season
            2: -9.0,
            3: -9.5,
            4: -10.0,
            5: -10.5,
            6: -11.5,  # June - drying
            7: -12.5,  # July - dry season peak
            8: -13.0,  # August - driest
            9: -12.0,
            10: -11.0,
            11: -10.0,
            12: -9.5   # December - wet season returns
        }
        
        return seasonal_baselines


# Singleton instance
scout = ScoutAgent()
