'use client';

import { motion } from 'framer-motion';

const steps = [
    {
        num: '01',
        title: 'Define Area of Interest',
        desc: 'Select your coordinates. We continuously stream calibrated Sentinel-1 GRD data for your exact location — no hardware needed.',
        tag: 'Input'
    },
    {
        num: '02',
        title: 'Signal Processing',
        desc: 'Physics-based pipeline converts raw SAR backscatter (σ⁰ dB) into moisture maps, subsidence fields, and structural health indices.',
        tag: 'Processing'
    },
    {
        num: '03',
        title: 'Intelligence Delivered',
        desc: 'Reports, GeoTIFFs, and vector masks — ready for decision-making, not interpretation. Delivered weekly or on-demand.',
        tag: 'Output'
    },
];

export default function ProcessSteps() {
    return (
        <section
            id="process"
            className="py-24 md:py-32 bg-[#060606] border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="section-label">Process</div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white mb-20 m-0">
                    From satellite<br />
                    to insight.
                </h2>

                <div className="flex flex-col">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:grid md:grid-cols-[100px_1fr_150px] items-start md:items-center gap-8 md:gap-10 py-12 md:py-16 border-b border-white/10 last:border-b-0"
                        >
                            {/* Number */}
                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#cc0000] m-0 shrink-0">
                                PHASE {step.num}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-3 m-0">
                                    {step.title}
                                </h3>
                                <p className="text-[#666] text-sm md:text-base leading-relaxed font-light m-0 max-w-[640px]">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Tag */}
                            <div className="md:text-right w-full md:w-auto">
                                <span className="inline-block font-mono text-[10px] tracking-widest uppercase text-[#444] border border-white/5 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                                    {step.tag}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
