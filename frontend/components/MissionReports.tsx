'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const CASES = [
    {
        id: 1,
        title: "INVISIBLE DROUGHT PILOT",
        location: "SOUTH MORAVIA [500ha]",
        detection: "-4.2dB SIGNAL DROP",
        outcome: "YIELD SAVED (+15%)",
        image: "/vysocina_radar.png",
        link: "/mission/alpha" // Linking to the Alpha mission as the 'case study' demo for now, or pure text.
    }
];

export default function MissionReports() {
    return (
        <section id="missions" className="py-24 bg-aeris-black border-t border-white/5 relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                            MISSION REPORTS //
                        </h2>
                        <p className="text-gray-400 font-mono max-w-xl">
                            Declassified intelligence files from our latest autonomous analysis runs.
                            Physics-based detection in real-world scenarios.
                        </p>
                    </div>
                    <div className="font-mono text-radar-green text-sm border border-radar-green/30 px-3 py-1 rounded bg-radar-green/5">
                        STATUS: DECLASSIFIED
                    </div>
                </div>

                <div className="flex justify-center">
                    {CASES.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-[#0A0A0A] rounded-2xl border border-white/10 hover:border-radar-green/50 transition-colors overflow-hidden block w-full max-w-md"
                        >
                            <a href={item.link} className="block h-full">
                                {/* Image Header */}
                                <div className="relative h-64 w-full overflow-hidden border-b border-white/10">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors" />

                                    {/* Redacted Badge */}
                                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-2 py-0.5 border border-white/20 text-[10px] font-mono text-gray-300">
                                        CAMPAIGN #{1024 + i}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-radar-green transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="text-xs font-mono text-gray-500 mb-6 flex items-center gap-2">
                                        <span>{item.location}</span>
                                    </div>

                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">DETECTION</span>
                                            <span className="text-white">{item.detection}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-500">OUTCOME</span>
                                            <span className="text-radar-green">{item.outcome}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-2">
                                        <button className="text-xs font-bold text-gray-400 group-hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest">
                                            View Mission Data <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
