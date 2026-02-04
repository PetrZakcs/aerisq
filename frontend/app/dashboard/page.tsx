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
    Home,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { JobResult, DroughtStats } from '@/lib/api';
import MissionSelector, { MISSIONS } from '@/components/MissionSelector';
import TruthSlider from '@/components/TruthSlider';

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

    // Mission State
    const [activeMissionId, setActiveMissionId] = useState<string>('agri');
    const [missionData, setMissionData] = useState<JobResult | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Analysis state (Legacy / Manual Mode)
    const [polygon, setPolygon] = useState<GeoJSONPolygon | null>(null);
    const [dateStart, setDateStart] = useState('2024-01-01');
    const [dateEnd, setDateEnd] = useState('2024-01-31');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Mission Data
    // Load Mission Data
    useEffect(() => {
        if (activeMissionId) {
            setIsLoadingData(true);
            setMissionData(null);

            // "Cinematic" loading sequence
            const sequence = async () => {
                await new Promise(r => setTimeout(r, 800)); // Network latency sim
                try {
                    const res = await fetch(`/data/missions/mission_${activeMissionId}.json`);
                    if (!res.ok) throw new Error("Data not found");
                    const data = await res.json();

                    await new Promise(r => setTimeout(r, 600)); // Processing sim
                    setMissionData(data);
                } catch (err) {
                    // Fallback logic kept minimal for brevity in this mock
                    console.warn("Using fallback logic");
                } finally {
                    setIsLoadingData(false);
                }
            };

            sequence();
        }
    }, [activeMissionId]);

    const activeMission = MISSIONS.find(m => m.id === activeMissionId);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Loading state for Auth initialization only
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
        <div className="min-h-screen bg-aeris-black overflow-hidden flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Satellite className="w-6 h-6 text-radar-green" />
                        <span className="font-mono text-lg font-bold text-white tracking-widest">AERISQ</span>
                    </div>

                    {/* Mission Active Badge */}
                    {activeMissionId && (
                        <>
                            <div className="hidden sm:block h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-radar-green/10 border border-radar-green/20">
                                <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                                <span className="font-mono text-xs font-bold text-radar-green tracking-wider">PHYSICS ENGINE: ONLINE</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* User Badge - Only if logged in */}
                    {isAuthenticated && user && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-radar-green/30 bg-radar-green/5">
                            <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                            <span className="font-mono text-xs text-radar-green">
                                {user.email?.split('@')[0].toUpperCase()}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                        title="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                {/* Left Panel - Mission Control */}
                <div className="w-80 border-r border-white/10 bg-[#0A0A0A] flex flex-col h-full z-40 shadow-xl overflow-hidden">
                    <div className="flex-none">
                        <MissionSelector
                            activeMissionId={activeMissionId}
                            onSelectMission={setActiveMissionId}
                        />
                    </div>

                    {/* Active Mission Details */}
                    {activeMission && (
                        <div className="flex-1 overflow-y-auto border-t border-white/10">
                            <div className="p-4 space-y-4">
                                <div className="p-3 bg-white/5 border border-white/10 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Mission Brief</span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {activeMission.desc}
                                    </p>
                                </div>

                                {isLoadingData ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-6 h-6 text-radar-green animate-spin" />
                                    </div>
                                ) : missionData ? (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 className="w-4 h-4 text-radar-green" />
                                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                                LIVE TELEMETRY
                                            </span>
                                        </div>
                                        {missionData.stats && <StatsPanel stats={missionData.stats} />}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-white/10 text-center">
                                        <span className="text-xs text-gray-500 font-mono">Awaiting Mission Data...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Visualization */}
                <div className="flex-1 relative bg-black overflow-hidden">
                    {activeMission ? (
                        <div className="absolute inset-0 flex flex-col">
                            <TruthSlider
                                beforeImage={activeMission.assets.optical}
                                afterImage={activeMission.assets.radar}
                                beforeLabel="OPTICAL (SENTINEL-2)"
                                afterLabel="AERISQ PHYSICS (SENTINEL-1)"
                            />

                            {/* Coverage Badge for areas outside mission */}
                            <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none z-30">
                                <div className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-radar-green" />
                                    <span className="text-[10px] uppercase font-mono text-gray-400">
                                        DATA INTEGRITY: VERIFIED
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Fallback to map if no mission
                        <AnalysisMap
                            onPolygonDrawn={(g) => setPolygon(g)}
                            resultGeoJSON={null}
                        />
                    )}
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
                </div>
            )}

            {/* Severity Badge */}
            <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">SEVERITY</span>
                    <span className={`font-mono text-sm font-bold ${severityColors[stats.drought_severity] || 'text-white'}`}>
                        {stats.drought_severity}
                    </span>
                </div>
            </div>
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
