'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const CASES = [
    {
        id: 'MISSION-01',
        title: 'Invisible Drought Detection',
        location: 'South Moravia — 500 ha',
        sensor: 'Sentinel-1 Radar Scan',
        date: 'Opening in Q2 2026',
        detection: 'Anomaly v2.4 Restricted',
        outcome: 'Available Q2 2026',
        image: '/vysocina_radar.png',
        link: '#waitlist'
    }
];

export default function MissionReports() {
    return (
        <section
            id="missions"
            className="py-24 md:py-32 bg-[#060606] border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="section-label">Case study</div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10 mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white m-0">
                        Operational<br />
                        Roadmap.
                    </h2>
                    <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 max-w-[300px] leading-relaxed m-0">
                        Physics-based detection applied to real scenarios — with documented, measurable outcomes.
                    </p>
                </div>

                <div className="space-y-10">
                    {CASES.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] border border-white/10 overflow-hidden opacity-70"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-video md:aspect-[4/3] overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover grayscale contrast-[1.2]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent pointer-events-none" />
                                
                                <div className="absolute top-5 left-5 font-mono text-[10px] tracking-widest uppercase text-[#666] bg-black/80 px-3 py-1 backdrop-blur-sm">
                                    {item.id} — RESTRICTED
                                </div>
                                <div className="absolute bottom-5 left-5 font-mono text-[10px] text-[#444] tracking-widest uppercase">
                                    {item.sensor}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between">
                                <div className="mb-10">
                                    <div className="font-mono text-[10px] tracking-widest uppercase text-gray-400 mb-4">
                                        {item.location} — {item.date}
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white leading-[1.1]">
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-10">
                                    {/* Data Grid */}
                                    <div className="grid grid-cols-2 border-t border-white/10">
                                        {[
                                            { label: 'Detection', value: 'Restricted', highlight: false },
                                            { label: 'Outcome', value: 'Restricted', highlight: true },
                                        ].map((row, ri) => (
                                            <div
                                                key={ri}
                                                className={`p-5 md:p-6 lg:p-8 ${ri === 0 ? 'border-r border-white/10' : ''}`}
                                            >
                                                <div className="font-mono text-[10px] tracking-widest uppercase text-gray-500 mb-2">
                                                    {row.label}
                                                </div>
                                                <div className={`font-mono text-base md:text-lg tracking-wide ${row.highlight ? 'text-[#cc0000]' : 'text-gray-400'}`}>
                                                    {row.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[#cc0000] border border-[#cc0000]/30 px-6 py-3 hover:bg-[#cc0000]/5 transition-colors cursor-pointer">
                                        Access Required ↗
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
