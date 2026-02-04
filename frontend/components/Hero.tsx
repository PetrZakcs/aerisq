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
            <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter text-white mb-6">
                        PHYSICS, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800">NOT ART.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl text-center font-mono leading-relaxed"
                >
                    We analyze raw Sentinel-1 radar backscatter ($\sigma^0$). <br />
                    We do not trust optical AI hallucinations.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex flex-col md:flex-row gap-6 items-center"
                >
                    <a href="/dashboard" className="px-8 py-3 bg-radar-green text-black font-mono font-bold tracking-widest hover:bg-white transition-all uppercase no-underline">
                        DEPLOY MISSION
                    </a>
                    <span className="text-gray-600 text-sm font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-radar-green animate-pulse"></span>
                        SYSTEM ONLINE
                    </span>
                </motion.div>
            </div>

            {/* Decorative Radar Sweep Line */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[50%] left-[50%] w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_340deg,rgba(57,255,20,0.1)_360deg)] rounded-full"
                />
            </div>
        </section>
    );
}
