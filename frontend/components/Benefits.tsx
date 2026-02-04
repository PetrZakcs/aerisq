'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, ShieldCheck, Zap } from 'lucide-react';

const BENEFITS = [
    {
        title: "Physics-First Precision",
        desc: "We analyze raw Sentinel-1 backscatter. No optical hallucinations, no AI guesswork. Just pure dielectric constant measurements.",
        icon: <Zap className="w-6 h-6 text-radar-green" />
    },
    {
        title: "All-Weather Intelligence",
        desc: "Radar penetrates clouds, smoke, and darkness. Get actionable insights when optical satellites are blind.",
        icon: <ShieldCheck className="w-6 h-6 text-radar-green" />
    },
    {
        title: "Zero-Integration Config",
        desc: "No complex GIS software required. Receive weekly PDF reports and GeoTIFFs directly to your executive dashboard.",
        icon: <MousePointerClick className="w-6 h-6 text-radar-green" />
    }
];

export default function Benefits() {
    return (
        <section className="py-24 bg-[#080808]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">WHY PHYSICS MATTERS</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-sans text-sm">
                        Optical vegetation indices (NDVI) are lagging indicators. Radar detects stress weeks before the plant changes color.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {BENEFITS.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 border border-white/5 bg-aeris-dark hover:bg-white/[0.05] hover:border-radar-green/30 transition-all group rounded-2xl"
                        >
                            <div className="w-12 h-12 bg-radar-green/50 text-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {b.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 font-sans h-[3.5rem] flex items-center">{b.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-sans min-h-[5rem]">
                                {b.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
