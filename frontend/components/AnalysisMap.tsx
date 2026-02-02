'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

interface AnalysisMapProps {
    onPolygonDrawn?: (geojson: { type: string; coordinates: number[][][] }) => void;
    resultGeoJSON?: any;
}

export default function AnalysisMap({ onPolygonDrawn, resultGeoJSON }: AnalysisMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const drawnItems = useRef<L.FeatureGroup | null>(null);
    const resultLayer = useRef<L.GeoJSON | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        // Fix Leaflet icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map
        const map = L.map(mapContainer.current, {
            center: [31.5, 35.0], // Default: Middle East region
            zoom: 7,
            zoomControl: false,
        });

        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Add zoom control to top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Create feature group for drawn items
        const drawn = new L.FeatureGroup();
        map.addLayer(drawn);
        drawnItems.current = drawn;

        // Add draw control
        const drawControl = new (L.Control as any).Draw({
            position: 'topleft',
            draw: {
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#ef4444',
                        message: '<strong>Error:</strong> Shape cannot intersect!'
                    },
                    shapeOptions: {
                        color: '#518a16',
                        fillColor: '#518a16',
                        fillOpacity: 0.2,
                        weight: 2
                    }
                },
                rectangle: {
                    shapeOptions: {
                        color: '#518a16',
                        fillColor: '#518a16',
                        fillOpacity: 0.2,
                        weight: 2
                    }
                },
                polyline: false,
                circle: false,
                circlemarker: false,
                marker: false
            },
            edit: {
                featureGroup: drawn,
                remove: true
            }
        });
        map.addControl(drawControl);

        // Handle draw events
        map.on((L as any).Draw.Event.CREATED, (e: any) => {
            const layer = e.layer;

            // Clear previous drawings
            drawn.clearLayers();

            // Add new layer
            drawn.addLayer(layer);

            // Convert to GeoJSON and notify parent
            const geojson = layer.toGeoJSON();
            if (onPolygonDrawn) {
                onPolygonDrawn(geojson.geometry);
            }
        });

        map.on((L as any).Draw.Event.DELETED, () => {
            if (onPolygonDrawn) {
                onPolygonDrawn(null as any);
            }
        });

        mapInstance.current = map;
        setIsMapReady(true);

        // Cleanup
        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Update onPolygonDrawn callback reference
    useEffect(() => {
        if (!mapInstance.current || !isMapReady) return;

        const map = mapInstance.current;

        // Re-register event handlers with new callback
        map.off((L as any).Draw.Event.CREATED);
        map.on((L as any).Draw.Event.CREATED, (e: any) => {
            const layer = e.layer;
            drawnItems.current?.clearLayers();
            drawnItems.current?.addLayer(layer);

            const geojson = layer.toGeoJSON();
            if (onPolygonDrawn) {
                onPolygonDrawn(geojson.geometry);
            }
        });
    }, [onPolygonDrawn, isMapReady]);

    // Handle result GeoJSON overlay
    useEffect(() => {
        if (!mapInstance.current || !isMapReady) return;

        const map = mapInstance.current;

        // Remove existing result layer
        if (resultLayer.current) {
            map.removeLayer(resultLayer.current);
            resultLayer.current = null;
        }

        // Add new result layer if available
        if (resultGeoJSON && resultGeoJSON.features) {
            const layer = L.geoJSON(resultGeoJSON, {
                style: (feature) => {
                    const props = feature?.properties || {};
                    return {
                        color: props.stroke || props.fill || '#518a16',
                        weight: props['stroke-width'] || 2,
                        opacity: props['stroke-opacity'] || 0.8,
                        fillColor: props.fill || '#518a16',
                        fillOpacity: props['fill-opacity'] || 0.4
                    };
                },
                onEachFeature: (feature, layer) => {
                    const props = feature.properties || {};
                    if (props.drought_severity) {
                        layer.bindPopup(`
              <div style="font-family: monospace; font-size: 12px;">
                <strong>Drought Severity:</strong> ${props.drought_severity}<br/>
                <strong>Affected Area:</strong> ${props.drought_percentage?.toFixed(1)}%<br/>
                <strong>Mean σ0:</strong> ${props.mean_sigma0_db?.toFixed(1)} dB
              </div>
            `);
                    }
                }
            });

            layer.addTo(map);
            resultLayer.current = layer;

            // Fit map to result bounds
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [resultGeoJSON, isMapReady]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Map overlay instructions */}
            {!resultGeoJSON && (
                <div className="absolute top-4 left-16 p-3 bg-black/80 backdrop-blur-sm border border-white/10 pointer-events-none">
                    <p className="font-mono text-xs text-gray-400">
                        Use the drawing tools to define your area of interest
                    </p>
                </div>
            )}

            {/* Coordinates display */}
            <div className="absolute bottom-4 left-4 p-2 bg-black/80 backdrop-blur-sm border border-white/10">
                <span className="font-mono text-xs text-gray-500">
                    SENTINEL-1 SAR • WGS84
                </span>
            </div>
        </div>
    );
}
