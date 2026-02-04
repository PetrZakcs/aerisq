'use client';

import { Target, Shield, Factory, ChevronRight } from 'lucide-react';

export const MISSIONS = [
    {
        id: 'agri',
        icon: Target,
        title: 'AGRI-INTELLIGENCE',
        subtitle: 'South Moravia',
        desc: 'Detect hidden drought stress using root-level sensors.',
        color: 'text-radar-green',
        borderColor: 'border-radar-green',
        coordinates: [48.8, 16.6],
        badge: 'COMMERCIAL',
        assets: {
            optical: '/data/missions/agri_optical.png',
            radar: '/data/missions/agri_radar.png'
        }
    },
    {
        id: 'defense',
        icon: Shield,
        title: 'DEFENSE & GOV',
        subtitle: 'Ukraine Border',
        desc: 'Heavy metal detection under cloud cover.',
        color: 'text-blue-400',
        borderColor: 'border-blue-400',
        coordinates: [46.5, 30.7],
        badge: 'YC RFS #5',
        assets: {
            optical: '/data/missions/defense_optical.png',
            radar: '/data/missions/defense_radar.png'
        }
    },
    {
        id: 'industrial',
        icon: Factory,
        title: 'INDUSTRIAL STABILITY',
        subtitle: 'Open-Pit Mine',
        desc: 'Sub-millimeter ground subsidence monitoring.',
        color: 'text-orange-400',
        borderColor: 'border-orange-400',
        coordinates: [50.5, 13.8],
        badge: 'CRITICAL',
        assets: {
            optical: '/data/missions/industrial_optical.png',
            radar: '/data/missions/industrial_radar.png'
        }
    }
];

interface MissionSelectorProps {
    activeMissionId: string | null;
    onSelectMission: (id: string) => void;
}

export default function MissionSelector({ activeMissionId, onSelectMission }: MissionSelectorProps) {
    return (
        <div className="space-y-1">
            <div className="px-4 pt-4 pb-2">
                <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select Mission Profile</h3>
            </div>
            {MISSIONS.map((mission) => {
                const Icon = mission.icon;
                const isActive = activeMissionId === mission.id;

                return (
                    <button
                        key={mission.id}
                        onClick={() => onSelectMission(mission.id)}
                        className={`w-full text-left px-4 py-3 group transition-all relative overflow-hidden border-l-2 ${isActive
                            ? `${mission.borderColor} bg-white/5`
                            : 'border-transparent hover:bg-white/5'
                            }`}
                    >
                        {/* Background Hover Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />

                        <div className="relative z-10 flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded bg-black/50 border border-white/10 ${isActive ? mission.color : 'text-gray-500'}`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`font-mono text-xs font-bold tracking-wider ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                        {mission.title}
                                    </span>
                                    {mission.badge && (
                                        <span className={`text-[10px] px-1.5 rounded border font-mono ${isActive ? 'border-white/20 text-white' : 'border-white/10 text-gray-600'}`}>
                                            {mission.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="font-mono text-[10px] text-gray-500 uppercase mb-1">{mission.subtitle}</p>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed opacity-80">
                                    {mission.desc}
                                </p>
                            </div>

                            {isActive && (
                                <ChevronRight className={`w-4 h-4 ${mission.color} animate-pulse`} />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
