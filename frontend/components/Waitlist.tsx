'use client';

import { motion } from 'framer-motion';

export default function Waitlist() {
    return (
        <section className="py-32 bg-aeris-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radar-green/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    SECURE YOUR <span className="text-radar-green">INTELLIGENCE</span>.
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                    Join the waitlist for early access to the AerisQ Physics Core.
                    Limited spots for the Pilot Program (Q1 2026).
                </p>

                <form className="max-w-md mx-auto relative">
                    <input
                        type="email"
                        placeholder="ENTER COMS FREQUENCY (EMAIL)"
                        className="w-full bg-[#0F0F0F] border border-white/20 px-6 py-4 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-radar-green transition-colors rounded-none"
                    />
                    <button
                        type="submit"
                        className="w-full mt-4 bg-radar-green text-black font-bold font-mono py-4 hover:bg-white transition-colors uppercase tracking-widest"
                    >
                        Request Access
                    </button>
                </form>

                <p className="mt-6 text-xs text-gray-600 font-mono">
                    ENCRYPTED TRANSMISSION // NO SPAM PROTOCOLS
                </p>
            </div>
        </section>
    );
}
