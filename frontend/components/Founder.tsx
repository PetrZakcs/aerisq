'use client';

import { motion } from 'framer-motion';
import { Linkedin, Twitter } from 'lucide-react';

const TEAM = [
    {
        name: "PETR ZAK",
        role: "FOUNDER & CEO",
        bio: "Aerospace engineer with 10+ years in SAR signal processing.",
        image: "🧑‍🚀",
        id: "CMD-01"
    },
    {
        name: "SARAH CONNOR",
        role: "LEAD RADAR SCIENTIST",
        bio: "PhD in Microwave Remote Sensing. Expert in interferometry.",
        image: "👩‍🔬",
        id: "SCI-01"
    },
    {
        name: "DAVID BOWMAN",
        role: "MISSION SYSTEMS ARCHITECT",
        bio: "Former JPL engineer. Scales data pipelines to petabyte levels.",
        image: "👨‍💻",
        id: "SYS-01"
    }
];

export default function Founder() {
    return (
        <section id="company" className="py-32 bg-[#050505] border-t border-white/5 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block border border-white/10 px-4 py-1 rounded-full bg-white/5 backdrop-blur-md mb-6"
                    >
                        <span className="font-mono text-xs text-radar-green tracking-widest uppercase">Command Structure</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 tracking-tight uppercase">
                        Built By <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Scientists</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto font-sans text-lg leading-relaxed">
                        We bridge the gap between raw Synthetic Aperture Radar physics and actionable business intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TEAM.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500"
                        >
                            {/* Image Placeholder */}
                            <div className="aspect-[4/5] bg-white/5 relative flex items-center justify-center overflow-hidden group-hover:bg-white/10 transition-colors">
                                <div className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110 transform">
                                    {member.image}
                                </div>

                                {/* Overlay Stats */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
                                    <div className="font-mono text-[10px] text-gray-500">
                                        ID: {member.id}<br />
                                        STATUS: ACTIVE
                                    </div>
                                    <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse shadow-[0_0_10px_rgba(81,138,22,0.8)]" />
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="text-2xl font-bold font-display text-white mb-1 uppercase tracking-wide">{member.name}</h3>
                                <div className="text-radar-green font-mono text-xs font-bold uppercase tracking-widest mb-4">{member.role}</div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-sans border-l border-white/10 pl-4">
                                    {member.bio}
                                </p>

                                <div className="flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <a href="#" className="p-2 border border-white/10 rounded-full hover:bg-white text-white hover:text-black transition-all">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                    <a href="#" className="p-2 border border-white/10 rounded-full hover:bg-white text-white hover:text-black transition-all">
                                        <Twitter className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
