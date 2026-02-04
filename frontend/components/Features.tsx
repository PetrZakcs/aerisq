'use client';

import { Shield, Sprout, Satellite, TrendingUp } from 'lucide-react';

export default function Features() {
    return (
        <section id="technology" className="py-24 px-6 bg-aeris-black relative border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse shadow-[0_0_10px_rgba(81,138,22,0.8)]" />
                    <h2 className="text-xl font-display font-bold text-gray-500 tracking-widest">SECTOR APPLICATIONS</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BentoCard
                        title="AGRICULTURE"
                        icon={<Sprout className="w-6 h-6 text-radar-green" />}
                        desc="Pre-visualize drought stress 2 weeks before optical signs."
                        className="border-white/5 hover:border-radar-green/30"
                        iconColor="text-radar-green"
                    />
                    <BentoCard
                        title="DEFENSE"
                        icon={<Shield className="w-6 h-6 text-alert-red" />}
                        desc="Detect convoy movement and subterranean bunkers."
                        className="border-red-900/10 hover:border-alert-red/30"
                        iconColor="text-alert-red"
                    />
                    <BentoCard
                        title="SPACE"
                        icon={<Satellite className="w-6 h-6 text-blue-400" />}
                        desc="Ground station calibration and debris tracking."
                        className="border-blue-900/10 hover:border-blue-500/30"
                        iconColor="text-blue-400"
                    />
                    <BentoCard
                        title="FINANCE"
                        icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
                        desc="Verify commodity yields for insurance and futures."
                        className="border-purple-900/10 hover:border-purple-500/30"
                        iconColor="text-purple-400"
                    />
                </div>
            </div>
        </section>
    );
}

function BentoCard({ title, icon, desc, className = "", iconColor = "text-radar-green" }: any) {
    return (
        <div className={`p-8 bg-[#0A0A0A] rounded-2xl border border-white/10 hover:bg-white/5 transition-all duration-300 group relative overflow-hidden ${className}`}>
            {/* Hover Highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

            {/* Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className={`mb-6 ${iconColor} opacity-80 group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold font-display text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-sans">{desc}</p>
        </div>
    )
}
