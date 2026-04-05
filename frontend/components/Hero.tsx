'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <section
            className="relative min-h-[100svh] w-full flex flex-col justify-end bg-black overflow-hidden py-24 md:py-32 lg:py-48"
        >
            {/* Full-bleed background image with grain overlay */}
            <div
                className="absolute inset-0 bg-[url('/vysocina_radar.png')] bg-center bg-cover bg-no-no-repeat opacity-20 grayscale grayscale-[100] contrast-[1.4]"
            />

            {/* Dark gradient overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/95"
            />

            {/* Thin horizontal scan line */}
            <div
                className="absolute left-0 right-0 h-px top-[40%] bg-gradient-to-r from-transparent via-red-600/30 to-transparent pointer-events-none shadow-[0_0_15px_rgba(204,0,0,0.15)]"
            />

            {/* Corner marks — SpaceX style (Hidden on mobile) */}
            <div className="hidden sm:block absolute top-[100px] left-10 w-4 h-4 border-t border-l border-white/20" />
            <div className="hidden sm:block absolute top-[100px] right-10 w-4 h-4 border-t border-r border-white/20" />
            <div className="hidden sm:block absolute bottom-10 left-10 w-4 h-4 border-b border-l border-white/20" />
            <div className="hidden sm:block absolute bottom-10 right-10 w-4 h-4 border-b border-r border-white/20" />

            {/* Content Container */}
            <div
                className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20"
            >
                {/* Top label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6"
                >
                    <span
                        className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/80 flex items-center gap-2"
                    >
                        <span className="text-[#cc0000]">📡</span> Radar Phase Intelligence
                    </span>
                </motion.div>

                {/* Main heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 }}
                    className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.9] tracking-tighter uppercase text-white mb-8 pr-12 md:pr-0"
                >
                    Shift the{' '}
                    <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Perspective</span>
                    <br />
                    PhasQ Analysis.
                </motion.h1>

                {/* Sub-text and CTAs row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-10"
                >
                    <p
                        className="text-[#aaa] text-base md:text-lg lg:text-xl leading-relaxed max-w-[480px] font-light"
                    >
                        Physics-based Synthetic Aperture Radar analysis.
                        All-weather, all-hour intelligence — where optical satellites go blind.
                    </p>

                    <div className="flex flex-wrap gap-3 shrink-0">
                        <a
                            href="#demo"
                            className="btn-primary w-full sm:w-auto text-center"
                        >
                            Explore Demo ↗
                        </a>
                        <a
                            href="#process"
                            className="btn-outline w-full sm:w-auto text-center border-white/10 text-white/50"
                        >
                            How It Works
                        </a>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 mt-20 pt-10 border-t border-white/10"
                >
                    {[
                        { value: '6-DAY', label: 'Revisit Cycle' },
                        { value: '+14 DAYS', label: 'Early Detection' },
                        { value: '100%', label: 'Cloud Penetration' },
                        { value: 'C-BAND', label: 'SAR Frequency' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className={`flex flex-col gap-1 ${
                                i % 2 === 0 ? 'pr-4 md:border-r md:border-white/10' : 'pl-0 md:pl-4 md:border-r md:border-white/10 last:border-0'
                            }`}
                        >
                            <div
                                className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight"
                            >
                                {stat.value}
                            </div>
                            <div
                                className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#777]"
                            >
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
