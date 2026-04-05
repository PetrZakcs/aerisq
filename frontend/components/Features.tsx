'use client';

import { motion } from 'framer-motion';

const SECTORS = [
    {
        id: 'AGR',
        title: 'Agriculture',
        desc: 'Detect root-zone drought stress 14 days before optical visibility. Drive variable-rate irrigation and harvest decisions with physics — not guesswork.',
        metrics: ['Root-zone moisture mapping', 'Harvest timing models', 'Yield loss prediction'],
    },
    {
        id: 'DEF',
        title: 'Defense',
        desc: 'All-weather persistent surveillance. Detect vehicle displacement, infrastructure changes, and subsurface anomalies through cloud cover and concealment.',
        metrics: ['Change detection (24h)', 'Sub-meter displacement', 'Through-cover detection'],
    },
    {
        id: 'SPC',
        title: 'Space',
        desc: 'Ground station calibration, orbital debris tracking, and ionospheric monitoring for space operations and scientific research programs.',
        metrics: ['Calibration support', 'Atm. path delay', 'Surface deformation'],
    },
    {
        id: 'FIN',
        title: 'Finance',
        desc: 'Independent verification of commodity yields for insurance underwriting, agricultural futures, and infrastructure asset valuation.',
        metrics: ['Yield verification', 'Crop insurance data', 'Asset tracking'],
    },
];

export default function Features() {
    return (
        <section
            id="technology"
            className="py-24 md:py-32 bg-black border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="section-label">Applications</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-end mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white m-0">
                        One platform.<br />
                        Every industry.
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light m-0">
                        A single, physics-based radar intelligence engine — adapted to the data requirements and operational tempo of each sector.
                    </p>
                </div>

                {/* Table-style grid */}
                <div className="border-t border-white/10">
                    {SECTORS.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:grid md:grid-cols-[100px_1fr_1fr] gap-8 md:gap-12 lg:gap-20 py-12 md:py-16 border-b border-white/10 hover:bg-white/[0.02] transition-colors duration-300"
                        >
                            {/* ID */}
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#cc0000] shrink-0 m-0">
                                [{s.id}]
                            </div>

                            {/* Title + desc */}
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-4 m-0">
                                    {s.title}
                                </h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light m-0">
                                    {s.desc}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="flex flex-col gap-3 py-2">
                                {s.metrics.map((m, mi) => (
                                    <div key={mi} className="flex items-center gap-3">
                                        <div className="w-1 h-1 bg-[#444] rounded-full shrink-0" />
                                        <span className="font-mono text-[10px] md:text-[11px] tracking-wider uppercase text-[#555]">
                                            {m}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
