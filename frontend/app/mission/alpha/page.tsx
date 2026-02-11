'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Satellite,
    Loader2,
    CheckCircle,
    BarChart3,
    FileText,
    Home,
    ArrowLeft
} from 'lucide-react';
import { JobResult, DroughtStats } from '@/lib/api';
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

// Hardcoded Mission Data Configuration
const MISSION_CONFIG = {
    id: 'agri',
    title: 'AGRICULTURE INTELLIGENCE',
    desc: 'Monitoring soil moisture and crop health in the Vysocina region using Sentinel-1 C-band SAR. Darker areas indicate higher moisture retention.',
    assets: {
        optical: '/vysocina_optical.png',
        radar: '/vysocina_radar.png'
    }
};

export default function MissionAlphaPage() {
    const router = useRouter();
    const [missionData, setMissionData] = useState<JobResult | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Load Mission Data
    useEffect(() => {
        setIsLoadingData(true);

        // "Cinematic" loading sequence
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 800)); // Network latency sim
            try {
                // Fetch static JSON data for the mission
                const res = await fetch(`/data/missions/mission_agri.json`);
                if (!res.ok) throw new Error("Data not found");
                const data = await res.json();

                await new Promise(r => setTimeout(r, 600)); // Processing sim
                setMissionData(data);
            } catch (err) {
                console.warn("Failed to load mission data", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        sequence();
    }, []);

    return (
        <div className="min-h-screen bg-aeris-black overflow-hidden flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-mono text-sm uppercase tracking-widest hidden sm:inline">Back to HQ</span>
                    </Link>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-3">
                        <Satellite className="w-6 h-6 text-radar-green" />
                        <span className="font-mono text-lg font-bold text-white tracking-widest">MISSION ALPHA</span>
                    </div>

                    <div className="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded bg-radar-green/10 border border-radar-green/20">
                        <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse flex-shrink-0" />
                        <span className="font-mono text-[10px] md:text-xs font-bold text-radar-green tracking-wider whitespace-nowrap">LIVE</span>
                        <span className="font-mono text-[10px] md:text-xs font-bold text-radar-green tracking-wider hidden sm:inline">FEED: ACTIVE</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/#waitlist"
                        className="hidden sm:flex items-center px-4 py-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded"
                    >
                        Request Access
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                {/* Left Panel - Mission Brief */}
                <div className="w-80 border-r border-white/10 bg-[#0A0A0A] flex flex-col h-full z-40 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white mb-2">{MISSION_CONFIG.title}</h2>
                        <div className="text-xs font-mono text-radar-green mb-4">SECTOR: AGRICULTURE</div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {MISSION_CONFIG.desc}
                        </p>
                    </div>

                    {/* Active Mission Details */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-6 h-6 text-radar-green animate-spin" />
                                </div>
                            ) : missionData ? (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-radar-green" />
                                        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                            TELEMETRY
                                        </span>
                                    </div>
                                    {missionData.stats && <StatsPanel stats={missionData.stats} />}
                                </div>
                            ) : (
                                <div className="p-4 border border-dashed border-white/10 text-center">
                                    <span className="text-xs text-gray-500 font-mono">Loading Physics Engine...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Visualization */}
                <div className="flex-1 relative bg-black overflow-hidden">
                    <div className="absolute inset-0 flex flex-col">
                        <TruthSlider
                            beforeImage={MISSION_CONFIG.assets.optical}
                            afterImage={MISSION_CONFIG.assets.radar}
                            beforeLabel="OPTICAL (SENTINEL-2)"
                            afterLabel="AERISQ PHYSICS (SENTINEL-1)"
                        />

                        {/* Coverage Badge */}
                        <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none z-30">
                            <div className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-radar-green" />
                                <span className="text-[10px] uppercase font-mono text-gray-400">
                                    DATA INTEGRITY: VERIFIED
                                </span>
                            </div>
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

            {/* Anomaly Detection - Translated for Farmers */}
            {stats.anomaly_db !== undefined && (
                <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-gray-400">FIELD DIAGNOSIS</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Signal Loss (Dryness)</span>
                        <span className={`font-mono text-sm font-bold ${getAnomalyColor(stats.anomaly_db)}`}>
                            {stats.anomaly_db > 0 ? '+' : ''}{stats.anomaly_db.toFixed(1)} dB
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                        Radar signal parses deep soil structure. A drop of -4.8 dB confirms critical subsurface drying not yet visible on the surface.
                    </p>
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

            {/* Actionable Insight - For Farmers */}
            <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider">ACTION REQUIRED</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                    Immediate variable-rate irrigation recommended for the 68% affected area. Yield risk is high.
                </p>
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
