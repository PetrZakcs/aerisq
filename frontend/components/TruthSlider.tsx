'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function TruthSlider() {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (x: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const percent = Math.min(Math.max((x - rect.left) / rect.width * 100, 0), 100);
            setSliderPosition(percent);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX);
    };

    const handleClick = (e: React.MouseEvent) => {
        handleMove(e.clientX);
    };

    return (
        <section className="py-24 bg-aeris-black border-b border-white/10 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">

                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">THE TRUTH TEST</h2>
                    <p className="text-gray-400 font-mono">Drag to reveal what optical sensors miss.</p>
                </div>

                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border border-white/20 select-none"
                    ref={containerRef}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    onTouchMove={handleTouchMove}
                    onClick={handleClick}
                >
                    {/* Background: RADAR (TRUTH) */}
                    <div className="absolute inset-0 grayscale-[20%] contrast-125">
                        <Image src="/vysocina_radar.png" alt="Radar Truth Analysis" fill className="object-cover" />
                        <div className="absolute inset-0 bg-aeris-black/10 mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-8 right-8 text-right pointer-events-none">
                            <div className="text-red-500 font-mono text-xs font-bold tracking-widest mb-1 border-b border-red-500/30 pb-1">
                                LAYER: SAR [SENTINEL-1A]
                            </div>
                            <div className="text-[10px] text-red-400 font-mono">
                                POLARIZATION: VV+VH <br />
                                INTERFEROMETRY: ACTIVE <br />
                                MOISTURE STRESS: <span className="text-red-500 font-bold">DETECTED</span>
                            </div>
                        </div>
                    </div>

                    {/* Foreground: OPTICAL (FALSE) - Clipped */}
                    <div
                        className="absolute inset-0 z-10 overscroll-none"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <Image src="/vysocina_optical.png" alt="Optical Satellite View" fill className="object-cover" />
                        <div className="absolute inset-0 bg-radar-green/10 mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-8 left-8 pointer-events-none">
                            <div className="text-radar-green font-mono text-xs font-bold tracking-widest mb-1 border-b border-radar-green/30 pb-1">
                                LAYER: OPTICAL [CNES]
                            </div>
                            <div className="text-[10px] text-radar-green/80 font-mono">
                                SPECTRUM: RGB <br />
                                CLOUD COVER: 0% <br />
                                STATUS: <span className="text-radar-green font-bold">NOMINAL (FALSE POSTIVE)</span>
                            </div>
                        </div>
                    </div>

                    {/* Slider Handle (Scanner Line) */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-white z-20 cursor-ew-resize group"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        {/* Glowing Laser Line */}
                        <div className="absolute top-0 bottom-0 left-[-1px] w-[3px] bg-white/50 blur-[1px]" />
                        <div className="absolute top-0 bottom-0 left-[-20px] w-[40px] opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent transition-opacity" />

                        {/* Handle UI */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-aeris-black/90 border border-white/40 flex items-center justify-center backdrop-blur-sm">
                            <div className="w-0.5 h-6 bg-white/50" />
                        </div>

                        {/* Scanner Data Label */}
                        <div className="absolute bottom-8 left-4 text-[10px] font-mono whitespace-nowrap text-white/80 bg-black/60 px-1 border-l border-white/50">
                            SCANX: {sliderPosition.toFixed(1)}%
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
