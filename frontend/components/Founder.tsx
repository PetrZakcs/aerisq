'use client';

import { motion } from 'framer-motion';

export default function Founder() {
    return (
        <section id="company" className="py-24 bg-[#080808] border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">

                    {/* Founder Image Area */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="w-full md:w-1/3 relative aspect-[3/4]"
                    >
                        <div className="absolute inset-0 border border-white/20 p-2">
                            <div className="w-full h-full bg-white/5 flex items-center justify-center border border-white/10 relative overflow-hidden">
                                {/* Placeholder for Founder Image */}
                                <div className="text-center p-6">
                                    <span className="block text-4xl mb-2">🧑‍🚀</span>
                                    <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                                        Founder Image<br />Upload Required
                                    </p>
                                </div>

                                {/* Tech Overlay */}
                                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-400">
                                    ID: CEO-01 <br />
                                    ACCESS: L5
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bio Content */}
                    <div className="w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-12 bg-radar-green" />
                            <span className="font-mono text-radar-green text-xs uppercase tracking-widest">Leadership</span>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-6">
                            BUILT BY SCIENTISTS, <br />
                            <span className="text-gray-500">NOT MARKETERS.</span>
                        </h2>

                        <div className="space-y-6 text-gray-400 leading-relaxed max-w-xl">
                            <p>
                                "We noticed a critical gap in the market: vast amounts of satellite data, yet zero actionable physics-based intelligence for non-experts."
                            </p>
                            <p>
                                AerisQ was founded to bridge the gap between raw Synthetic Aperture Radar (SAR) backscatter and business decisions. We don't just show you a map; we tell you what the signal drop *means* for your yield, your assets, and your security.
                            </p>
                        </div>

                        <div className="mt-8 flex items-center gap-6">
                            <div className="font-mono text-sm text-white">
                                <span className="block font-bold tracking-wider">JAN NOVAK</span>
                                <span className="text-gray-500 text-xs">FOUNDER & LEAD ARCHITECT</span>
                            </div>

                            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:border-radar-green/50 hover:text-radar-green transition-all group">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 group-hover:text-radar-green">Connect</span>
                                <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
