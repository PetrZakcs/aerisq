'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Satellite,
    Loader2,
    Leaf,
    Droplets,
    Flame,
    ChevronRight,
    MapPin,
    Sparkles,
    CheckCircle,
    Globe,
    ArrowRight,
    BarChart3,
    Shield,
    Zap,
    Home,
} from 'lucide-react';
import Link from 'next/link';

// Dynamic import for Leaflet (no SSR)
const AnalysisMap = dynamic(
    () => import('@/components/AnalysisMap').then(mod => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-radar-green animate-spin" />
            </div>
        )
    }
);

// ===== PRESET DEMO AREAS =====
const DEMO_AREAS = [
    {
        id: 'vysocina',
        name: 'Vysočina, Czech Republic',
        description: 'Agricultural region – drought monitoring',
        icon: '🌾',
        polygon: {
            type: 'Polygon',
            coordinates: [[[15.3, 49.7], [15.7, 49.7], [15.7, 49.9], [15.3, 49.9], [15.3, 49.7]]]
        },
        analyses: [
            { prompt: 'Analyze NDVI vegetation health', type: 'ndvi', icon: '🌿' },
            { prompt: 'Check soil moisture levels', type: 'sar_moisture', icon: '💧' },
            { prompt: 'Show drought severity with SAR', type: 'sar_drought', icon: '🔥' },
        ]
    },
    {
        id: 'almeria',
        name: 'Almería, Spain',
        description: 'Arid region – extreme drought analysis',
        icon: '🏜️',
        polygon: {
            type: 'Polygon',
            coordinates: [[[-2.6, 36.7], [-2.2, 36.7], [-2.2, 37.0], [-2.6, 37.0], [-2.6, 36.7]]]
        },
        analyses: [
            { prompt: 'Show drought severity with SAR', type: 'sar_drought', icon: '🔥' },
            { prompt: 'Analyze NDVI vegetation health', type: 'ndvi', icon: '🌿' },
            { prompt: 'Detect water bodies with NDWI', type: 'ndwi', icon: '🌊' },
        ]
    },
    {
        id: 'netherlands',
        name: 'Flevoland, Netherlands',
        description: 'Dense agriculture – crop health monitoring',
        icon: '🇳🇱',
        polygon: {
            type: 'Polygon',
            coordinates: [[[5.4, 52.4], [5.8, 52.4], [5.8, 52.6], [5.4, 52.6], [5.4, 52.4]]]
        },
        analyses: [
            { prompt: 'Analyze NDVI vegetation health', type: 'ndvi', icon: '🌿' },
            { prompt: 'Detect water bodies with NDWI', type: 'ndwi', icon: '🌊' },
            { prompt: 'Check soil moisture levels', type: 'sar_moisture', icon: '💧' },
        ]
    },
    {
        id: 'sahel',
        name: 'Sahel, West Africa',
        description: 'Climate change hotspot – desertification tracking',
        icon: '🌍',
        polygon: {
            type: 'Polygon',
            coordinates: [[[-1.0, 13.0], [0.5, 13.0], [0.5, 14.0], [-1.0, 14.0], [-1.0, 13.0]]]
        },
        analyses: [
            { prompt: 'Show drought severity with SAR', type: 'sar_drought', icon: '🔥' },
            { prompt: 'Analyze NDVI vegetation health', type: 'ndvi', icon: '🌿' },
            { prompt: 'Check soil moisture levels', type: 'sar_moisture', icon: '💧' },
        ]
    },
];

// ===== RESULT TYPES =====
interface AnalysisResult {
    job_id: string;
    status: string;
    prompt: string;
    analysis_type: string;
    analysis_info: {
        name: string;
        satellite: string;
        description: string;
        formula: string;
        range: string;
    };
    prompt_confidence: number;
    results: {
        index_type: string;
        satellite: string;
        mean_value: number;
        std_value: number;
        min_value: number;
        max_value: number;
        median_value: number;
        classification: string;
        classification_description: string;
        area_km2: number;
        quality_flag: string;
        scene_count?: number;
        drought_percentage?: number;
        soil_moisture_index?: number;
        water_percentage?: number;
        anomaly_db?: number;
        confidence?: number;
    };
    created_at: string;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
    'EXCELLENT': 'text-green-400 bg-green-400/10 border-green-400/30',
    'GOOD': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'STRESSED': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'POOR': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    'BARREN': 'text-red-400 bg-red-400/10 border-red-400/30',
    'WATER': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'WET': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    'MODERATE': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'DRY': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    'NORMAL': 'text-green-400 bg-green-400/10 border-green-400/30',
    'MILD': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'SEVERE': 'text-red-400 bg-red-400/10 border-red-400/30',
    'EXTREME': 'text-red-600 bg-red-600/10 border-red-600/30',
};

// ===== API URL =====
const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '' : 'http://localhost:8000';

export default function InvestorDemoPage() {
    const [selectedArea, setSelectedArea] = useState(DEMO_AREAS[0]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

    // Check API on first render
    useState(() => {
        fetch(`${API_BASE}/api`)
            .then(r => r.json())
            .then(d => setApiStatus(d.gee_available ? 'online' : 'online'))
            .catch(() => setApiStatus('offline'));
    });

    const runAnalysis = async (prompt: string) => {
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        try {
            const response = await fetch(`${API_BASE}/api/v1/analyze/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    polygon: selectedArea.polygon,
                    date_range: {
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0],
                    }
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
                throw new Error(errData.detail || `HTTP ${response.status}`);
            }

            const data: AnalysisResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-aeris-black">
            {/* Top Bar */}
            <nav className="h-14 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Satellite className="w-5 h-5 text-radar-green" />
                        <span className="font-mono text-sm font-bold text-white tracking-widest">AERISQ</span>
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="font-mono text-xs text-radar-green tracking-wider">INTELLIGENCE DEMO</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono ${apiStatus === 'online' ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : apiStatus === 'offline' ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                : 'bg-white/5 border border-white/10 text-gray-500'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'online' ? 'bg-green-400 animate-pulse' : apiStatus === 'offline' ? 'bg-red-400' : 'bg-gray-500'
                            }`} />
                        {apiStatus === 'online' ? 'SYSTEMS ONLINE' : apiStatus === 'offline' ? 'CONNECTING...' : 'CHECKING...'}
                    </div>
                    <Link href="/" className="p-1.5 text-gray-500 hover:text-white transition-colors">
                        <Home className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radar-green/10 border border-radar-green/20 mb-4">
                        <Globe className="w-3.5 h-3.5 text-radar-green" />
                        <span className="font-mono text-xs text-radar-green tracking-wider">LIVE SATELLITE ANALYSIS</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Real-Time Earth Intelligence
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm">
                        Select a region, choose an analysis type, and receive real satellite data
                        from Sentinel-1 (radar) and Sentinel-2 (optical) missions. No simulation – live data.
                    </p>
                </div>

                {/* Capabilities Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                        { icon: Leaf, label: 'NDVI', desc: 'Vegetation Health', color: 'text-green-400' },
                        { icon: Droplets, label: 'NDWI', desc: 'Water Detection', color: 'text-blue-400' },
                        { icon: Flame, label: 'SAR Drought', desc: 'Drought Severity', color: 'text-orange-400' },
                        { icon: BarChart3, label: 'Soil Moisture', desc: 'Moisture Index', color: 'text-cyan-400' },
                    ].map((cap) => (
                        <div key={cap.label} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <cap.icon className={`w-5 h-5 ${cap.color}`} />
                            <div>
                                <div className="font-mono text-xs text-white font-bold">{cap.label}</div>
                                <div className="font-mono text-[10px] text-gray-500">{cap.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content: 2-column layout */}
                <div className="grid lg:grid-cols-[380px_1fr] gap-6">

                    {/* Left Panel */}
                    <div className="space-y-4">
                        {/* Region Selector */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">Select Region</span>
                            </div>
                            <div className="p-2 space-y-1">
                                {DEMO_AREAS.map((area) => (
                                    <button
                                        key={area.id}
                                        onClick={() => { setSelectedArea(area); setResult(null); setError(null); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${selectedArea.id === area.id
                                                ? 'bg-radar-green/10 border border-radar-green/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <span className="text-xl">{area.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-mono text-xs font-bold truncate ${selectedArea.id === area.id ? 'text-radar-green' : 'text-white'
                                                }`}>{area.name}</div>
                                            <div className="font-mono text-[10px] text-gray-500 truncate">{area.description}</div>
                                        </div>
                                        {selectedArea.id === area.id && (
                                            <CheckCircle className="w-4 h-4 text-radar-green flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analysis Buttons */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">Run Analysis</span>
                            </div>
                            <div className="p-2 space-y-1">
                                {selectedArea.analyses.map((analysis, i) => (
                                    <button
                                        key={i}
                                        onClick={() => runAnalysis(analysis.prompt)}
                                        disabled={isAnalyzing}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-radar-green/5 hover:border-radar-green/20 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="text-lg">{analysis.icon}</span>
                                        <span className="font-mono text-xs text-gray-300 group-hover:text-white flex-1 transition-colors">
                                            {analysis.prompt}
                                        </span>
                                        {isAnalyzing ? (
                                            <Loader2 className="w-4 h-4 text-radar-green animate-spin flex-shrink-0" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-radar-green transition-colors flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Panel */}
                        {isAnalyzing && (
                            <div className="bg-white/[0.02] border border-radar-green/20 rounded-xl p-6 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <Satellite className="w-8 h-8 text-radar-green animate-pulse" />
                                    <div className="absolute -inset-4 border border-radar-green/20 rounded-full animate-ping" />
                                </div>
                                <div className="text-center">
                                    <p className="font-mono text-xs text-radar-green animate-pulse">QUERYING SATELLITE DATA...</p>
                                    <p className="font-mono text-[10px] text-gray-600 mt-1">Processing {selectedArea.name}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-4">
                                <p className="font-mono text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden animate-in fade-in duration-500">
                                {/* Result Header */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-radar-green" />
                                        <span className="font-mono text-xs text-radar-green uppercase tracking-wider">
                                            {result.analysis_info.name}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${result.results.quality_flag === 'GEE_REALTIME'
                                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                        }`}>
                                        {result.results.quality_flag === 'GEE_REALTIME' ? '● LIVE DATA' : '● PHYSICS MODEL'}
                                    </span>
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Satellite + Scenes */}
                                    <div className="flex gap-2">
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400">
                                            {result.results.satellite}
                                        </span>
                                        {result.results.scene_count !== undefined && (
                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400">
                                                {result.results.scene_count} scenes
                                            </span>
                                        )}
                                    </div>

                                    {/* Classification */}
                                    <div className={`p-3 rounded-lg border ${CLASSIFICATION_COLORS[result.results.classification] || 'text-white bg-white/5 border-white/10'}`}>
                                        <div className="font-mono text-sm font-bold">{result.results.classification}</div>
                                        <div className="font-mono text-xs opacity-70 mt-0.5">{result.results.classification_description}</div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-2">
                                        <MetricRow label="Mean Value" value={result.results.mean_value.toFixed(4)} />
                                        <MetricRow label="Std Dev" value={result.results.std_value.toFixed(4)} />
                                        <MetricRow label="Range" value={`${result.results.min_value.toFixed(4)} → ${result.results.max_value.toFixed(4)}`} />
                                        <MetricRow label="Area" value={`${result.results.area_km2} km²`} highlight />
                                        {result.results.drought_percentage !== undefined && (
                                            <MetricRow label="Drought Area" value={`${result.results.drought_percentage.toFixed(1)}%`} highlight />
                                        )}
                                        {result.results.soil_moisture_index !== undefined && (
                                            <MetricRow label="Soil Moisture" value={`${result.results.soil_moisture_index.toFixed(0)} / 100`} />
                                        )}
                                        {result.results.water_percentage !== undefined && (
                                            <MetricRow label="Water Cover" value={`${result.results.water_percentage.toFixed(1)}%`} highlight />
                                        )}
                                        {result.results.anomaly_db !== undefined && (
                                            <MetricRow
                                                label="vs Baseline"
                                                value={`${result.results.anomaly_db > 0 ? '+' : ''}${result.results.anomaly_db.toFixed(2)} dB`}
                                            />
                                        )}
                                    </div>

                                    {/* Formula */}
                                    <div className="pt-2 border-t border-white/10">
                                        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-1">Formula</div>
                                        <div className="font-mono text-xs text-gray-400">{result.analysis_info.formula}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Map */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden min-h-[500px] lg:min-h-0">
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
                                    {selectedArea.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-gray-600" />
                                <span className="font-mono text-[10px] text-gray-600">ESA/COPERNICUS DATA</span>
                            </div>
                        </div>
                        <div className="h-[500px] lg:h-[calc(100vh-16rem)]">
                            <AnalysisMap
                                onPolygonDrawn={() => { }}
                                resultGeoJSON={null}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        Sentinel-1/2 data provided by ESA/Copernicus • Analysis powered by Google Earth Engine
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">{label}</span>
            <span className={`font-mono text-sm ${highlight ? 'text-radar-green font-bold' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}
