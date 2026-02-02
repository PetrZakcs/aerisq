"""
Agent 3: The Analyst
Generates natural language summaries using GPT-4o
"""
import httpx
from typing import Optional
import logging

from app.core.config import settings
from app.agents.physicist import DroughtAnalysisResult

logger = logging.getLogger(__name__)


class AnalystAgent:
    """
    The Analyst Agent - AI-Powered Summary Generation
    
    Responsibilities:
    - Take physics analysis results
    - Generate human-readable summaries
    - Provide actionable insights
    """
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4o"
    
    async def generate_summary(
        self,
        result: DroughtAnalysisResult,
        location_name: Optional[str] = None,
        date_range: Optional[str] = None
    ) -> str:
        """
        Generate a natural language summary of the analysis
        
        Args:
            result: DroughtAnalysisResult from Physicist Agent
            location_name: Optional name of the analyzed location
            date_range: Optional date range string
            
        Returns:
            Human-readable summary string
        """
        # Build context for GPT
        location_str = location_name or "the analyzed region"
        date_str = date_range or "the selected time period"
        
        prompt = f"""You are AerisQ, an expert agricultural drought analyst. 
Based on Sentinel-1 SAR radar analysis, provide a concise, professional summary.

ANALYSIS RESULTS:
- Location: {location_str}
- Time Period: {date_str}
- Mean Backscatter (σ0): {result.mean_sigma0_db:.2f} dB
- Backscatter Range: {result.min_sigma0_db:.2f} to {result.max_sigma0_db:.2f} dB
- Area Analyzed: {result.area_km2:.1f} km²
- Drought-Affected Area: {result.drought_percentage:.1f}%
- Severity Classification: {result.drought_severity}

CONTEXT:
- Backscatter below -3 dB indicates dry soil conditions
- Lower values suggest reduced soil moisture and vegetation stress
- This analysis uses physics-based radar signal processing

Write a 2-3 sentence professional summary suitable for agricultural stakeholders.
Include the key metrics and a brief actionable recommendation.
Do not use markdown formatting."""

        # If no API key, return template summary
        if not self.api_key:
            logger.info("Analyst in DEMO mode - generating template summary")
            return self._generate_template_summary(result, location_str, date_str)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are AerisQ, a professional agricultural drought analyst."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 200,
                        "temperature": 0.7
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    summary = data["choices"][0]["message"]["content"]
                    logger.info("Analyst generated GPT-4o summary successfully")
                    return summary.strip()
                else:
                    logger.error(f"OpenAI API error: {response.text}")
                    return self._generate_template_summary(result, location_str, date_str)
                    
        except Exception as e:
            logger.error(f"Analyst summary generation failed: {e}")
            return self._generate_template_summary(result, location_str, date_str)
    
    def _generate_template_summary(
        self,
        result: DroughtAnalysisResult,
        location: str,
        date_range: str
    ) -> str:
        """
        Generate a template-based summary when GPT is unavailable
        """
        severity_descriptions = {
            "NORMAL": "within normal moisture parameters",
            "MILD": "showing early signs of moisture deficit",
            "MODERATE": "experiencing moderate drought stress",
            "SEVERE": "under severe drought conditions",
            "EXTREME": "facing critical drought emergency"
        }
        
        severity_desc = severity_descriptions.get(
            result.drought_severity, 
            "requires attention"
        )
        
        recommendations = {
            "NORMAL": "Continue standard monitoring protocols.",
            "MILD": "Increase monitoring frequency and prepare contingency measures.",
            "MODERATE": "Implement water conservation measures and adjust irrigation schedules.",
            "SEVERE": "Activate drought response protocols and prioritize water allocation.",
            "EXTREME": "Immediate intervention required. Engage emergency agricultural support."
        }
        
        recommendation = recommendations.get(
            result.drought_severity,
            "Consult local agricultural authorities."
        )
        
        return (
            f"Sentinel-1 radar analysis of {location} for {date_range} reveals "
            f"mean backscatter of {result.mean_sigma0_db:.1f} dB with "
            f"{result.drought_percentage:.0f}% of the {result.area_km2:.1f} km² area "
            f"{severity_desc}. Classification: {result.drought_severity}. "
            f"{recommendation}"
        )


# Singleton instance
analyst = AnalystAgent()
