'use client';

import { motion } from 'framer-motion';

const SECTORS = [
    {
        id: 'AGR',
        title: 'Agriculture',
        desc: 'Detect root-zone drought stress 14 days before optical visibility. Drive variable-rate irrigation and harvest decisions with physics — not guesswork.',
        metrics: ['Root-zone moisture mapping', 'Harvest timing models', 'Yield loss prediction'],
    },
    {
        id: 'DEF',
        title: 'Defense',
        desc: 'All-weather persistent surveillance. Detect vehicle displacement, infrastructure changes, and subsurface anomalies through cloud cover and concealment.',
        metrics: ['Change detection (24h)', 'Sub-meter displacement', 'Through-cover detection'],
    },
    {
        id: 'SPC',
        title: 'Space',
        desc: 'Ground station calibration, orbital debris tracking, and ionospheric monitoring for space operations and scientific research programs.',
        metrics: ['Calibration support', 'Atm. path delay', 'Surface deformation'],
    },
    {
        id: 'FIN',
        title: 'Finance',
        desc: 'Independent verification of commodity yields for insurance underwriting, agricultural futures, and infrastructure asset valuation.',
        metrics: ['Yield verification', 'Crop insurance data', 'Asset tracking'],
    },
];

export default function Features() {
    return (
        <section
            id="technology"
            style={{
                padding: '120px 0',
                background: '#000',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Applications</div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '80px',
                        alignItems: 'end',
                        marginBottom: '80px',
                    }}
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
                        One platform.<br />
                        Every industry.
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                        A single, physics-based radar intelligence engine — adapted to the data requirements and operational tempo of each sector.
                    </p>
                </div>

                {/* Table-style grid */}
                <div style={{ borderTop: '1px solid #1a1a1a' }}>
                    {SECTORS.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            viewport={{ once: true }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '100px 1fr 1fr',
                                gap: '40px',
                                padding: '48px 0',
                                borderBottom: '1px solid #1a1a1a',
                                alignItems: 'start',
                                cursor: 'default',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#080808')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                        >
                            {/* ID */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.15em',
                                    color: '#cc0000',
                                    paddingTop: '4px',
                                }}
                            >
                                [{s.id}]
                            </div>

                            {/* Title + desc */}
                            <div>
                                <h3
                                    style={{
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.01em',
                                        color: '#fff',
                                        margin: '0 0 12px 0',
                                    }}
                                >
                                    {s.title}
                                </h3>
                                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                                    {s.desc}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                                {s.metrics.map((m, mi) => (
                                    <div
                                        key={mi}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        <span style={{ width: '3px', height: '3px', background: '#444', flexShrink: 0, display: 'inline-block' }} />
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-space-mono)',
                                                fontSize: '11px',
                                                letterSpacing: '0.08em',
                                                color: '#555',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {m}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
