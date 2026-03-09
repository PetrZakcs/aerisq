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
            style={{
                padding: '120px 0',
                background: '#060606',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Process</div>

                <h2
                    style={{
                        fontSize: 'clamp(2rem, 4vw, 4rem)',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        color: '#fff',
                        margin: '0 0 80px 0',
                    }}
                >
                    From satellite<br />
                    to insight.
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr 200px',
                                alignItems: 'center',
                                gap: '40px',
                                padding: '48px 0',
                                borderBottom: '1px solid #1a1a1a',
                            }}
                        >
                            {/* Number */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '13px',
                                    color: '#cc0000',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {step.num}
                            </div>

                            {/* Content */}
                            <div>
                                <h3
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.01em',
                                        color: '#fff',
                                        margin: '0 0 12px 0',
                                    }}
                                >
                                    {step.title}
                                </h3>
                                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, maxWidth: '600px', fontWeight: 300 }}>
                                    {step.desc}
                                </p>
                            </div>

                            {/* Tag */}
                            <div style={{ textAlign: 'right' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '10px',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        color: '#444',
                                        border: '1px solid #222',
                                        padding: '4px 12px',
                                    }}
                                >
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
