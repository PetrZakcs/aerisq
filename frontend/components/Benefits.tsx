'use client';

import { motion } from 'framer-motion';

const BENEFITS = [
    {
        num: '01',
        title: 'Physics-First',
        desc: 'We analyze raw Sentinel-1 radar backscatter — not optical imagery. Dielectric constant measurements from orbit. No AI hallucinations.',
    },
    {
        num: '02',
        title: 'All-Weather',
        desc: 'C-band SAR penetrates clouds, smoke, and total darkness. Intelligence when optical satellites are completely blind.',
    },
    {
        num: '03',
        title: 'Zero-Friction',
        desc: 'No GIS expertise required. Weekly reports, export-ready GeoTIFFs, and decision-ready maps delivered to your dashboard.',
    }
];

export default function Benefits() {
    return (
        <section
            style={{
                padding: '120px 0',
                background: '#000',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                {/* Section label */}
                <div className="section-label">Advantage</div>

                {/* Heading */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '80px',
                        alignItems: 'start',
                        marginBottom: '80px',
                    }}
                    className="md:grid"
                >
                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 4rem)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase',
                            color: '#fff',
                            margin: 0,
                        }}
                    >
                        The physics<br />
                        <span style={{ color: '#cc0000' }}>advantage</span>
                    </h2>
                    <p
                        style={{
                            color: '#666',
                            fontSize: '15px',
                            lineHeight: 1.8,
                            margin: 0,
                            paddingTop: '8px',
                            fontWeight: 300,
                        }}
                    >
                        Optical NDVI indices are lagging indicators — they only show stress after visible damage occurs.
                        SAR radar detects subsurface moisture changes 2 weeks earlier. The difference between reacting and preventing.
                    </p>
                </div>

                {/* Three columns */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        borderTop: '1px solid #1a1a1a',
                    }}
                    className="grid-cols-1 md:grid-cols-3"
                >
                    {BENEFITS.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '48px 40px 48px 0',
                                borderRight: i < 2 ? '1px solid #1a1a1a' : 'none',
                                paddingLeft: i > 0 ? '40px' : '0',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.15em',
                                    color: '#cc0000',
                                    marginBottom: '24px',
                                }}
                            >
                                {b.num}
                            </div>
                            <h3
                                style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    color: '#fff',
                                    margin: '0 0 16px 0',
                                }}
                            >
                                {b.title}
                            </h3>
                            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                                {b.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
