'use client';

import { motion } from 'framer-motion';

const BENEFITS = [
    {
        num: '01',
        title: 'Physics-First',
        desc: 'We analyze raw Sentinel-1 radar backscatter — not optical imagery. Dielectric constant measurements from orbit. No AI hallucinations.',
    },
    {
        num: '02',
        title: 'All-Weather',
        desc: 'C-band SAR penetrates clouds, smoke, and total darkness. Intelligence when optical satellites are completely blind.',
    },
    {
        num: '03',
        title: 'Zero-Friction',
        desc: 'No GIS expertise required. Weekly reports, export-ready GeoTIFFs, and decision-ready maps delivered to your dashboard.',
    }
];

export default function Benefits() {
    return (
        <section
            className="py-24 md:py-32 bg-black border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                {/* Section label */}
                <div className="section-label">Advantage</div>

                {/* Heading */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white m-0">
                        The physics<br />
                        <span className="text-[#cc0000]">advantage</span>
                    </h2>
                    <p className="text-[#666] text-base md:text-lg leading-relaxed font-light m-0 pt-2">
                        Optical NDVI indices are lagging indicators — they only show stress after visible damage occurs.
                        SAR radar detects subsurface moisture changes 2 weeks earlier. The difference between reacting and preventing.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/10">
                    {BENEFITS.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            viewport={{ once: true }}
                            className={`py-12 md:py-16 ${
                                i < 2 ? 'md:border-r md:border-white/10 md:pr-10' : ''
                            } ${
                                i > 0 ? 'md:pl-10' : ''
                            } border-b md:border-b-0 border-white/10 last:border-b-0`}
                        >
                            <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#cc0000] mb-6">
                                {b.num}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-4">
                                {b.title}
                            </h3>
                            <p className="text-[#666] text-sm md:text-base leading-relaxed font-light m-0">
                                {b.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
