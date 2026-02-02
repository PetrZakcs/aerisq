'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Satellite,
    Calendar,
    Play,
    Loader2,
    AlertTriangle,
    CheckCircle,
    MapPin,
    BarChart3,
    FileText,
    LogOut,
    Home
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createDemoAnalysis, getJobStatusPublic, JobResult, DroughtStats } from '@/lib/api';

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

interface GeoJSONPolygon {
    type: string;
    coordinates: number[][][];
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

    // Analysis state
    const [polygon, setPolygon] = useState<GeoJSONPolygon | null>(null);
    const [dateStart, setDateStart] = useState('2024-01-01');
    const [dateEnd, setDateEnd] = useState('2024-01-31');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [jobStatus, setJobStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
    const [result, setResult] = useState<JobResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, router]);

    const handlePolygonDrawn = (geojson: GeoJSONPolygon) => {
        setPolygon(geojson);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!polygon) {
            setError('Please draw a polygon on the map first');
            return;
        }

        setIsAnalyzing(true);
        setJobStatus('pending');
        setError(null);
        setResult(null);

        try {
            // Create analysis job
            const response = await createDemoAnalysis({
                polygon: polygon,
                date_range: { start: dateStart, end: dateEnd }
            });

            setJobStatus('processing');

            // Poll for results (in standalone mode, it's instant)
            const jobResult = await getJobStatusPublic(response.job_id);

            setResult(jobResult);
            setJobStatus(jobResult.status as any);

        } catch (err: any) {
            setError(err.message || 'Analysis failed');
            setJobStatus('failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-aeris-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-radar-green animate-spin" />
                    <p className="font-mono text-gray-500">INITIALIZING SYSTEM...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aeris-black">
            {/* Top Navigation Bar */}
            <nav className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Satellite className="w-6 h-6 text-radar-green" />
                        <span className="font-mono text-lg font-bold text-white tracking-widest">AERISQ</span>
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-white/10" />
                    <span className="hidden sm:block font-mono text-sm text-gray-500">MISSION CONTROL</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-radar-green/30 bg-radar-green/5">
                        <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                        <span className="font-mono text-xs text-radar-green">
                            {user?.email?.split('@')[0].toUpperCase()}
                        </span>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                        title="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Panel - Controls */}
                <div className="w-80 border-r border-white/10 bg-[#0A0A0A] flex flex-col">
                    {/* Mission Header */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                            <h2 className="font-mono text-sm font-bold text-white tracking-widest">NEW ANALYSIS</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">Sentinel-1 SAR Drought Detection</p>
                    </div>

                    {/* Step 1: Draw Area */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-radar-green" />
                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                Step 1: Area of Interest
                            </span>
                        </div>
                        {polygon ? (
                            <div className="flex items-center gap-2 p-2 bg-radar-green/10 border border-radar-green/30">
                                <CheckCircle className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-radar-green">Polygon defined</span>
                            </div>
                        ) : (
                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30">
                                <span className="font-mono text-xs text-yellow-500">Draw polygon on map →</span>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Date Range */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-radar-green" />
                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                Step 2: Date Range
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-mono text-gray-600 mb-1">START</label>
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="w-full px-3 py-2 bg-black border border-white/10 text-white font-mono text-sm focus:border-radar-green focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-600 mb-1">END</label>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="w-full px-3 py-2 bg-black border border-white/10 text-white font-mono text-sm focus:border-radar-green focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Execute */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Play className="w-4 h-4 text-radar-green" />
                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                Step 3: Execute Analysis
                            </span>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-2 mb-3 bg-red-500/10 border border-red-500/30">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="font-mono text-xs text-red-400">{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !polygon}
                            className="w-full py-3 bg-radar-green text-black font-mono font-bold tracking-widest hover:bg-radar-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    ANALYZING...
                                </>
                            ) : (
                                <>
                                    <Satellite className="w-4 h-4" />
                                    RUN ANALYSIS
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Panel */}
                    {result && result.status === 'completed' && (
                        <div className="flex-1 overflow-auto p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                    Analysis Results
                                </span>
                            </div>

                            {/* Stats */}
                            {result.stats && <StatsPanel stats={result.stats} />}

                            {/* Summary */}
                            {result.summary && (
                                <div className="mt-4 p-3 bg-black/50 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-3 h-3 text-gray-500" />
                                        <span className="font-mono text-xs text-gray-500">AI SUMMARY</span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel - Map */}
                <div className="flex-1 relative">
                    <AnalysisMap
                        onPolygonDrawn={handlePolygonDrawn}
                        resultGeoJSON={result?.geojson}
                    />

                    {/* Map Legend */}
                    <div className="absolute bottom-4 right-4 p-3 bg-black/80 backdrop-blur-sm border border-white/10">
                        <span className="font-mono text-xs text-gray-500 block mb-2">DROUGHT SEVERITY</span>
                        <div className="space-y-1">
                            <LegendItem color="#22c55e" label="Normal" />
                            <LegendItem color="#eab308" label="Mild" />
                            <LegendItem color="#f97316" label="Moderate" />
                            <LegendItem color="#ef4444" label="Severe" />
                            <LegendItem color="#7c2d12" label="Extreme" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsPanel({ stats }: { stats: DroughtStats }) {
    const severityColors: Record<string, string> = {
        NORMAL: 'text-green-500',
        MILD: 'text-yellow-500',
        MODERATE: 'text-orange-500',
        SEVERE: 'text-red-500',
        EXTREME: 'text-red-800'
    };

    const getAnomalyColor = (anomaly: number | undefined) => {
        if (anomaly === undefined) return 'text-gray-400';
        if (anomaly < -2) return 'text-red-400';
        if (anomaly < 0) return 'text-orange-400';
        if (anomaly > 2) return 'text-blue-400';
        return 'text-green-400';
    };

    return (
        <div className="space-y-3">
            {/* Core Radar Metrics */}
            <StatRow
                label="Mean σ₀"
                value={`${stats.mean_sigma0_db.toFixed(1)} dB`}
            />
            <StatRow
                label="σ₀ Range"
                value={`${stats.min_sigma0_db.toFixed(1)} to ${stats.max_sigma0_db.toFixed(1)} dB`}
            />

            {/* Drought Metrics */}
            <div className="pt-2 border-t border-white/10">
                <StatRow
                    label="Drought Area"
                    value={`${stats.drought_percentage.toFixed(1)}%`}
                    highlight
                />
                {stats.soil_moisture_index !== undefined && (
                    <StatRow
                        label="Soil Moisture Index"
                        value={`${stats.soil_moisture_index.toFixed(0)} / 100`}
                    />
                )}
            </div>

            {/* Anomaly Detection */}
            {stats.anomaly_db !== undefined && (
                <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-500">vs Baseline</span>
                        <span className={`font-mono text-sm font-bold ${getAnomalyColor(stats.anomaly_db)}`}>
                            {stats.anomaly_db > 0 ? '+' : ''}{stats.anomaly_db.toFixed(1)} dB
                        </span>
                    </div>
                    {stats.baseline_mean_db !== undefined && (
                        <div className="text-xs text-gray-600 font-mono mt-1">
                            Baseline: {stats.baseline_mean_db.toFixed(1)} dB
                        </div>
                    )}
                </div>
            )}

            {/* Area & Quality */}
            <div className="pt-2 border-t border-white/10">
                <StatRow
                    label="Area Analyzed"
                    value={`${stats.area_km2.toFixed(1)} km²`}
                />
                {stats.confidence !== undefined && (
                    <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-xs text-gray-500">Confidence</span>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-radar-green rounded-full transition-all"
                                    style={{ width: `${stats.confidence * 100}%` }}
                                />
                            </div>
                            <span className="font-mono text-xs text-gray-400">
                                {(stats.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Severity Badge */}
            <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">SEVERITY</span>
                    <span className={`font-mono text-sm font-bold ${severityColors[stats.drought_severity] || 'text-white'}`}>
                        {stats.drought_severity}
                    </span>
                </div>
            </div>

            {/* Quality Flag */}
            {stats.quality_flag && (
                <div className="text-center">
                    <span className="font-mono text-[10px] text-gray-600 px-2 py-0.5 border border-gray-800 rounded">
                        {stats.polarization || 'VV'} • {stats.quality_flag}
                    </span>
                </div>
            )}
        </div>
    );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">{label}</span>
            <span className={`font-mono text-sm ${highlight ? 'text-radar-green font-bold' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs text-gray-400">{label}</span>
        </div>
    );
}
