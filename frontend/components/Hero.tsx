'use client';

import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-aeris-black border-b border-white/10">

            {/* Radar Background Effect */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1)_0%,transparent_70%)]" />
                {/* Grid grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-4 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-radar-green animate-pulse" />
                        <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">Global Surveillance System</span>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-extrabold font-display tracking-tighter text-white mb-6 leading-none">
                        PHYSICS, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-gray-600">NOT ART.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl text-center font-sans font-light leading-relaxed mb-10"
                >
                    We analyze raw Sentinel-1 radar backscatter and phase history. <br />
                    <span className="text-gray-200">Zero optical hallucinations. All-weather intelligence.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col md:flex-row gap-6 items-center"
                >
                    <a href="#demos" className="relative group px-8 py-4 bg-white text-black font-sans font-bold tracking-widest hover:bg-gray-200 transition-all uppercase overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">Start Mission</span>
                    </a>

                    <a href="#process" className="px-8 py-4 border border-white/20 text-white font-sans tracking-widest hover:bg-white/5 hover:border-white/40 transition-all uppercase backdrop-blur-sm">
                        How it works
                    </a>
                </motion.div>
            </div>

            {/* Decorative Radar Sweep Line */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[50%] left-[50%] w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_340deg,rgba(57,255,20,0.15)_360deg)] rounded-full"
                />
            </div>
        </section>
    );
}
