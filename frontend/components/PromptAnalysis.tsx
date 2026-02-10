'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Loader2,
    Satellite,
    Leaf,
    Droplets,
    Flame,
    ChevronRight,
    MapPin,
    Calendar,
    Sparkles,
    AlertTriangle,
    CheckCircle,
    X,
    Command,
} from 'lucide-react';

interface PromptResult {
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
    polygon_used: {
        type: string;
        coordinates: number[][][];
    };
    created_at: string;
}

interface ExamplePrompt {
    prompt: string;
    type: string;
    icon: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
    { prompt: "Analyze NDVI vegetation health", type: "ndvi", icon: "🌿" },
    { prompt: "Check soil moisture levels", type: "sar_moisture", icon: "💧" },
    { prompt: "Detect water bodies with NDWI", type: "ndwi", icon: "🌊" },
    { prompt: "Show drought severity", type: "sar_drought", icon: "🔥" },
    { prompt: "Crop health analysis", type: "ndvi", icon: "🌾" },
];

const TYPE_ICONS: Record<string, { icon: typeof Leaf; color: string }> = {
    ndvi: { icon: Leaf, color: 'text-green-400' },
    ndwi: { icon: Droplets, color: 'text-blue-400' },
    sar_moisture: { icon: Droplets, color: 'text-cyan-400' },
    sar_drought: { icon: Flame, color: 'text-orange-400' },
};

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

interface GeoJSONPolygon {
    type: string;
    coordinates: number[][][];
}

interface PromptAnalysisProps {
    drawnPolygon?: GeoJSONPolygon | null;
    apiBaseUrl: string;
}

export default function PromptAnalysis({ drawnPolygon, apiBaseUrl }: PromptAnalysisProps) {
    const [prompt, setPrompt] = useState('');
    const [coordInput, setCoordInput] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<PromptResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCoordInput, setShowCoordInput] = useState(false);
    const [showDateInput, setShowDateInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Set default dates
    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setDateStart(start.toISOString().split('T')[0]);
        setDateEnd(end.toISOString().split('T')[0]);
    }, []);

    const handleAnalyze = async (promptText?: string) => {
        const analysisPrompt = promptText || prompt;
        if (!analysisPrompt.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            // Build request
            const body: Record<string, unknown> = {
                prompt: analysisPrompt,
            };

            // Add polygon if drawn
            if (drawnPolygon) {
                body.polygon = drawnPolygon;
            }

            // Parse coordinate input
            if (coordInput.trim()) {
                const parts = coordInput.split(/[,;\s]+/).map(Number).filter(n => !isNaN(n));
                if (parts.length >= 2) {
                    body.coordinates = { lat: parts[0], lon: parts[1] };
                }
            }

            // Add date range
            if (dateStart && dateEnd) {
                body.date_range = { start: dateStart, end: dateEnd };
            }

            const response = await fetch(`${apiBaseUrl}/api/v1/analyze/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
                throw new Error(errData.detail || `HTTP ${response.status}`);
            }

            const data: PromptResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Command className="w-4 h-4 text-radar-green" />
                    <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                        Mission Command
                    </span>
                </div>

                {/* Prompt Input */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you want to analyze?"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-radar-green/50 focus:ring-1 focus:ring-radar-green/30 transition-all"
                        disabled={isAnalyzing}
                    />
                    <button
                        onClick={() => handleAnalyze()}
                        disabled={isAnalyzing || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-radar-green/20 text-radar-green hover:bg-radar-green/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Quick toggles */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setShowCoordInput(!showCoordInput)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${showCoordInput ? 'bg-radar-green/20 text-radar-green border border-radar-green/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
                    >
                        <MapPin className="w-3 h-3" />
                        Coords
                    </button>
                    <button
                        onClick={() => setShowDateInput(!showDateInput)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${showDateInput ? 'bg-radar-green/20 text-radar-green border border-radar-green/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
                    >
                        <Calendar className="w-3 h-3" />
                        Date
                    </button>
                    {drawnPolygon && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-radar-green/10 border border-radar-green/20">
                            <CheckCircle className="w-3 h-3 text-radar-green" />
                            <span className="text-[10px] font-mono text-radar-green">Polygon Set</span>
                        </div>
                    )}
                </div>

                {/* Coordinate Input */}
                {showCoordInput && (
                    <div className="mt-2">
                        <input
                            type="text"
                            value={coordInput}
                            onChange={(e) => setCoordInput(e.target.value)}
                            placeholder="49.8175, 15.473 (lat, lon)"
                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white font-mono text-xs placeholder:text-gray-600 focus:outline-none focus:border-radar-green/50"
                        />
                    </div>
                )}

                {/* Date Range Input */}
                {showDateInput && (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-radar-green/50 [color-scheme:dark]"
                        />
                        <input
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-radar-green/50 [color-scheme:dark]"
                        />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {/* Loading State */}
                {isAnalyzing && (
                    <div className="p-6 flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                            <Satellite className="w-8 h-8 text-radar-green animate-pulse" />
                            <div className="absolute -inset-4 border border-radar-green/20 rounded-full animate-ping" />
                        </div>
                        <div className="text-center">
                            <p className="font-mono text-xs text-radar-green animate-pulse">PROCESSING SATELLITE DATA...</p>
                            <p className="font-mono text-[10px] text-gray-600 mt-1">Querying Earth Engine</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-mono text-xs text-red-400">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="font-mono text-[10px] text-red-400/60 hover:text-red-400 mt-1"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="p-4 space-y-3 animate-in fade-in duration-500">
                        {/* Analysis Type Badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-radar-green" />
                                <span className="font-mono text-xs text-radar-green uppercase tracking-wider">
                                    {result.analysis_info.name}
                                </span>
                            </div>
                            <button onClick={() => setResult(null)} className="text-gray-600 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Satellite & Quality */}
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400">
                                {result.results.satellite}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${result.results.quality_flag === 'GEE_REALTIME' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'}`}>
                                {result.results.quality_flag === 'GEE_REALTIME' ? '● LIVE' : '○ SIMULATED'}
                            </span>
                            {result.results.scene_count !== undefined && (
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400">
                                    {result.results.scene_count} scenes
                                </span>
                            )}
                        </div>

                        {/* Classification */}
                        <div className={`p-3 rounded-lg border ${CLASSIFICATION_COLORS[result.results.classification] || 'text-white bg-white/5 border-white/10'}`}>
                            <div className="font-mono text-sm font-bold">
                                {result.results.classification}
                            </div>
                            <div className="font-mono text-xs opacity-70 mt-0.5">
                                {result.results.classification_description}
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="space-y-2">
                            <MetricRow label="Mean Value" value={result.results.mean_value.toFixed(4)} />
                            <MetricRow label="Std Dev" value={result.results.std_value.toFixed(4)} />
                            <MetricRow
                                label="Range"
                                value={`${result.results.min_value.toFixed(4)} → ${result.results.max_value.toFixed(4)}`}
                            />
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
                )}

                {/* Example Prompts (show when no result) */}
                {!result && !isAnalyzing && !error && (
                    <div className="p-4 space-y-2">
                        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-3">
                            Try these prompts
                        </div>
                        {EXAMPLE_PROMPTS.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setPrompt(ex.prompt);
                                    handleAnalyze(ex.prompt);
                                }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group text-left"
                            >
                                <span className="text-lg">{ex.icon}</span>
                                <span className="font-mono text-xs text-gray-400 group-hover:text-white flex-1 transition-colors">
                                    {ex.prompt}
                                </span>
                                <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-radar-green transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
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
