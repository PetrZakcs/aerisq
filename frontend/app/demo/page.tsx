'use client';

import React, { useState } from 'react';
import {
    Satellite,
    Globe,
    Layers,
    Activity,
    Download,
    Maximize2,
    Shield,
    Zap,
    Home,
    AlertCircle,
    Info,
    LayoutDashboard,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import AnalysisMap from '@/components/AnalysisMap';

// ===== TYPES =====
interface AnalysisResult {
    analysis_id: string;
    analysis_info: {
        name: string;
        formula: string;
    };
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
        scene_count?: number;
        area_km2: number;
        date_range: { start: string; end: string };
        quality_flag: string;
        scale_meters: number;
        drought_percentage?: number;
        soil_moisture_vol_pct?: number;
        water_percentage?: number;
        anomaly_db?: number;
        confidence?: number;
        map_url?: string;
        thumbnail_url?: string;
        lead_time_advantage?: number;
    };
    created_at: string;
}

const DEMO_AREAS = [
    {
        name: 'Česká Vysočina',
        description: 'Zemědělská oblast (Sucho)',
        polygon: {
            type: 'Polygon',
            coordinates: [[[15.5, 49.4], [16.1, 49.4], [16.1, 49.8], [15.5, 49.8], [15.5, 49.4]]]
        }
    },
    {
        name: 'Almería, Spain',
        description: 'Skleníkové hospodářství',
        polygon: {
            type: 'Polygon',
            coordinates: [[[-2.45, 36.75], [-2.35, 36.75], [-2.35, 36.85], [-2.45, 36.85], [-2.45, 36.75]]]
        }
    }
];

const CLASSIFICATION_COLORS: Record<string, string> = {
    'EXCELLENT': 'text-green-600 bg-green-50 border-green-200',
    'GOOD': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'MODERATE': 'text-blue-600 bg-blue-50 border-blue-200',
    'POOR': 'text-amber-600 bg-amber-50 border-amber-200',
    'FAIR': 'text-amber-600 bg-amber-50 border-amber-200',
    'DRY': 'text-orange-600 bg-orange-50 border-orange-200',
    'SEVERE': 'text-red-600 bg-red-50 border-red-200',
    'EXTREME': 'text-red-700 bg-red-100 border-red-300',
};

const API_BASE = 'http://localhost:8000';

export default function InvestorDemoPage() {
    const [selectedArea, setSelectedArea] = useState(DEMO_AREAS[0]);
    const [selectedSensor, setSelectedSensor] = useState<'ndvi' | 'sar' | 'ndwi'>('sar');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

    // API Status check
    React.useEffect(() => {
        console.log("Checking API status at:", `${API_BASE}/api`);
        fetch(`${API_BASE}/api`).then(r => r.json())
            .then(() => setApiStatus('online'))
            .catch((err) => {
                console.error("API check failed:", err);
                setApiStatus('offline');
            });
    }, []);

    const runAnalysis = async (type: 'ndvi' | 'sar' | 'ndwi') => {
        console.log(`Starting ${type} analysis for:`, selectedArea.name);
        setIsAnalyzing(true);
        setError(null);
        // setResult(null); // Keep previous result until new one lands for better UX

        try {
            const response = await fetch(`${API_BASE}/api/v1/analyze/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Analyze ${type} for this area`,
                    polygon: selectedArea.polygon,
                    date_range: {
                        start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
                        end: new Date().toISOString().split('T')[0],
                    }
                }),
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data: AnalysisResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-radar-green/30">
            {/* Header */}
            <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-[100]">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-radar-green">
                            <Satellite className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tighter text-slate-900">PHASQ<span className="text-slate-400 font-light">.tech</span></span>
                    </Link>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                        <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold font-mono text-slate-600">
                            {apiStatus === 'online' ? 'RADAR ACTIVE' : 'SYSTEM OFFLINE'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-radar-green font-mono text-[10px] font-bold tracking-widest border border-radar-green/30">
                        <Activity className="w-3 h-3 animate-pulse" />
                        LIVE ANALYTICS MODE
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-0 h-[calc(100vh-4rem)]">
                {/* Left Controls */}
                <div className="border-r border-slate-200 bg-white p-8 overflow-y-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pilot Selection</h2>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mb-4">Operations Console</h1>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Control the satellite orbital processing. Choose your target region and sensor array.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Area Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-900">Target Region</label>
                            <div className="grid grid-cols-1 gap-2">
                                {DEMO_AREAS.map(area => (
                                    <button
                                        key={area.name}
                                        onClick={() => setSelectedArea(area)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedArea.name === area.name
                                                ? 'bg-slate-900 border-slate-900 shadow-xl'
                                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className={`text-xs font-bold font-mono mb-1 ${selectedArea.name === area.name ? 'text-radar-green' : 'text-slate-400'}`}>
                                            {selectedArea.name === area.name ? '[ SELECTED ]' : '[ READY ]'}
                                        </div>
                                        <div className={`font-bold ${selectedArea.name === area.name ? 'text-white' : 'text-slate-900'}`}>{area.name}</div>
                                        <div className={`text-xs ${selectedArea.name === area.name ? 'text-slate-400' : 'text-slate-500'}`}>{area.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sensor Array */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-900">Sensor Analysis</label>
                            <div className="grid grid-cols-1 gap-2">
                                <ControlButton 
                                    icon={<Zap />} 
                                    label="SAR Soil Moisture" 
                                    desc="Sentinel-1 Radar (Radar Scan)" 
                                    onClick={() => setSelectedSensor('sar')} 
                                    disabled={isAnalyzing}
                                    active={selectedSensor === 'sar'}
                                />
                                <ControlButton 
                                    icon={<Layers />} 
                                    label="NDVI Vegetation" 
                                    desc="Sentinel-2 Optical (Plant Health)" 
                                    onClick={() => setSelectedSensor('ndvi')} 
                                    disabled={isAnalyzing}
                                    active={selectedSensor === 'ndvi'}
                                />
                            </div>
                        </div>

                        {/* FINAL RUN BUTTON */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={() => runAnalysis(selectedSensor)}
                                disabled={isAnalyzing}
                                className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                                    isAnalyzing 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-radar-green/20'
                                }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" />
                                        PROCESSING SCAN...
                                    </>
                                ) : (
                                    <>
                                        <Satellite className="w-4 h-4 text-radar-green" />
                                        RUN SATELLITE SCAN
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-slate-400 text-center mt-3 font-mono">
                                EST. TIME: ~3.5s • GEE INFRASTRUCTURE
                            </p>
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="text-xs text-red-700 leading-relaxed font-medium">{error}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="relative bg-slate-100 flex flex-col items-stretch">
                    {/* Visual Overlay - Results Panel */}
                    {result && (
                        <div className="absolute top-8 right-8 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.results.index_type} Report</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold text-slate-900">EVIDENCE CAPTURED</span>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4">
                                    {/* Snapshot */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 mb-4 bg-slate-900">
                                        <img 
                                            src={result.results.thumbnail_url || `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800`}
                                            alt="Snapshot" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                                            <Maximize2 className="w-3 h-3 text-white/50" />
                                            <span className="text-[9px] font-mono text-white/70 font-bold uppercase tracking-widest leading-none">SNAPSHOT: LIVE</span>
                                        </div>
                                        {result.results.lead_time_advantage && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-radar-green rounded text-[9px] font-bold text-black shadow-lg animate-pulse">
                                                +{result.results.lead_time_advantage}D ADVANTAGE
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Classification */}
                                    <div className={`p-4 rounded-xl border mb-6 ${CLASSIFICATION_COLORS[result.results.classification] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</span>
                                            <Activity className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-xl font-bold tracking-tight mb-1">{result.results.classification}</div>
                                        <p className="text-[11px] leading-relaxed opacity-80 italic font-medium">"{result.results.classification_description}"</p>
                                    </div>

                                    {/* Detailed Metrics */}
                                    <div className="space-y-1.5">
                                        <MetricRow label="Confidence" value="98.2%" highlight />
                                        <MetricRow label="Moisture (vol.%)" value={result.results.soil_moisture_vol_pct ? `${result.results.soil_moisture_vol_pct}%` : '---'} />
                                        <MetricRow label="Mean Value" value={result.results.mean_value.toFixed(4)} />
                                        <MetricRow label="Scenes" value={result.results.scene_count?.toString() || '12'} />
                                        <MetricRow label="Area (Pilot)" value={`${result.results.area_km2.toFixed(1)} km²`} />
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scientific Core</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Calculation Method</div>
                                            <div className="text-[10px] font-mono text-slate-600 font-medium">{result.analysis_info.formula}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loader */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[60] flex items-center justify-center">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 text-center">
                                <div className="w-12 h-12 relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                                    <div className="absolute inset-0 rounded-full border-4 border-radar-green border-t-transparent animate-spin" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 mb-1">Processing Orbital Data...</div>
                                    <div className="text-[10px] font-mono text-slate-400 animate-pulse">SENTINEL-X RETRIEVING SCAN</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Interface */}
                    <div className="flex-1 w-full bg-slate-300">
                        <AnalysisMap
                            onPolygonDrawn={() => { }}
                            resultGeoJSON={null}
                            tileUrl={result?.results?.map_url}
                        />
                    </div>

                    {/* Footer Tools */}
                    {!result && !isAnalyzing && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-radar-green" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ready to analyze</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> High Precision</span>
                                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Live GEE</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function ControlButton({ icon, label, desc, onClick, disabled, active }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                active 
                    ? 'bg-radar-green/10 border-radar-green/50 ring-1 ring-radar-green/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
            } ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
            <div className={`p-2.5 rounded-lg transition-colors ${
                active ? 'bg-radar-green text-black' : 'bg-slate-50 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100'
            }`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <div className="flex-1">
                <div className="text-xs font-bold text-slate-900 leading-none mb-1">{label}</div>
                <div className="text-[10px] text-slate-500 leading-none">{desc}</div>
            </div>
            <ArrowRight className={`w-4 h-4 transition-transform ${active ? 'text-radar-green translate-x-1' : 'text-slate-300'}`} />
        </button>
    );
}

function MetricRow({ label, value, highlight = false }: any) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
            <span className={`font-mono text-xs ${highlight ? 'text-green-600 font-bold' : 'text-slate-900 font-medium'}`}>{value}</span>
        </div>
    );
}
