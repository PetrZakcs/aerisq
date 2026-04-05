'use client';

import { motion } from 'framer-motion';

const TEAM = [
    {
        id: 'PZ-01',
        name: 'Petr Žák',
        role: 'Founder & CEO',
        bio: 'GIS specialist and high-agency builder who re-engineered PhasQ\'s core physics engine in 14 days — replacing AI hallucinations with raw SAR signal analysis. Detects subsurface drought and hidden assets where optical systems see nothing.',
        image: '/team/petr-zak.jpg',
        linkedin: 'https://www.linkedin.com/in/petrzak01/',
        isLead: true,
    },
    {
        id: 'JR-01',
        name: 'Incoming CTO',
        role: 'Chief Technical Officer',
        type: 'incoming',
        bio: 'Leading engineering talent from US generative AI labs and European autonomous systems research. Arriving to scale our radar signal intelligence stack.',
        isLead: true,
    },
    {
        id: 'CZU-01',
        name: 'ČZU — University of Life Sciences Prague',
        role: 'Institute of Precision Agriculture',
        bio: 'Strategic partnership for radar physics validation and dielectric modeling. Scientific peer-review of our root-zone moisture algorithms.',
        image: '/czu_logo.png',
        isCollab: true,
    },
    {
        id: 'COLLAB-02',
        name: 'Research Fellows',
        role: 'Remote Sensed Data',
        bio: 'Joint research initiatives focused on C-Band SAR interferometry and volumetric soil moisture estimation protocols.',
        icon: '🔬',
        isCollab: true,
    },
    {
        id: 'COLLAB-03',
        name: 'Open Science',
        role: 'Data Verification',
        bio: 'Community-driven ground truth validation and cross-sensor calibration for global drought indexing.',
        icon: '🌍',
        isCollab: true,
    }
];

export default function Founder() {
    return (
        <section
            id="company"
            className="py-24 md:py-32 bg-black border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="section-label">Organization</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-end mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white m-0">
                        Built by<br />
                        scientists.
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light m-0">
                        We bridge the gap between academic radar physics and real-world operational intelligence. From core physics to enterprise-scale deployment.
                    </p>
                </div>

                {/* Row 1: Leadership */}
                <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-white/10 mb-10">
                    {TEAM.filter(m => m.isLead).map((member, i) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className={`border-r border-b border-white/10 overflow-hidden group ${
                                member.type === 'incoming' ? 'opacity-80' : 'opacity-100'
                            }`}
                        >
                            {/* Visual Header */}
                            <div className="relative aspect-square overflow-hidden bg-[#0a0a0a] flex items-center justify-center group-hover:bg-[#0f0f0f] transition-colors duration-500">
                                {member.image ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-top grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-5xl opacity-20">{member.icon || '👤'}</div>
                                )}
                                
                                <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest uppercase text-[#888] bg-black/80 px-3 py-1 backdrop-blur-sm">
                                    {member.id}
                                </div>

                                {member.type === 'incoming' && (
                                    <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-widest uppercase text-[#cc0000] border border-[#cc0000] px-3 py-1 bg-black/90">
                                        Incoming
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-8 lg:p-12">
                                <div className="font-mono text-[11px] tracking-widest uppercase text-[#cc0000] mb-3">
                                    / {member.role}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-6">
                                    {member.name}
                                </h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light mb-10">
                                    {member.bio}
                                </p>
                                {member.linkedin && (
                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block font-mono text-[10px] tracking-widest uppercase text-gray-500 border border-white/10 px-5 py-2.5 hover:text-white hover:border-white transition-all"
                                    >
                                        LinkedIn ↗
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2: Collaboration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-white/10">
                    {TEAM.filter(m => !m.isLead).map((member, i) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="border-r border-b border-white/10 overflow-hidden group"
                        >
                            {/* Visual Header */}
                            <div className="relative aspect-square overflow-hidden bg-[#0a0a0a] flex items-center justify-center group-hover:bg-[#0f0f0f] transition-colors duration-500">
                                {member.image ? (
                                    <div className="w-full h-full flex items-center justify-center p-16">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-contain grayscale brightness-[2.0] contrast-[1.2] opacity-80 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-5xl opacity-20">{member.icon || '👤'}</div>
                                )}
                                
                                <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest uppercase text-[#888] bg-black/80 px-3 py-1 backdrop-blur-sm">
                                    {member.id}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-8 lg:p-12">
                                <div className="font-mono text-[11px] tracking-widest uppercase text-[#cc0000] mb-3">
                                    / {member.role}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-6">
                                    {member.name}
                                </h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light mb-10">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
