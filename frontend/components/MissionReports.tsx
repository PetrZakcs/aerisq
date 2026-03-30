'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const CASES = [
    {
        id: 'CASE-001',
        title: 'Invisible Drought Detection',
        location: 'South Moravia — 500 ha',
        sensor: 'Sentinel-1 IW GRD',
        date: '2024-07',
        detection: '−4.2 dB signal drop',
        outcome: '+15% yield saved',
        image: '/vysocina_radar.png',
        link: '/mission/alpha'
    }
];

export default function MissionReports() {
    return (
        <section
            id="missions"
            style={{
                padding: '120px 0',
                background: '#060606',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Case study</div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '80px',
                        gap: '40px',
                        flexWrap: 'wrap',
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
                        Real-world<br />
                        results.
                    </h2>
                    <p
                        style={{
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '11px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#444',
                            margin: 0,
                            maxWidth: '300px',
                            lineHeight: 1.8,
                        }}
                    >
                        Physics-based detection applied to real scenarios — with documented, measurable outcomes.
                    </p>
                </div>

                <div>
                    {CASES.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0',
                                background: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                overflow: 'hidden',
                                opacity: 0.7,
                            }}
                        >
                            {/* Image */}
                            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    style={{ objectFit: 'cover', filter: 'grayscale(100%) contrast(1.2)' }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, transparent 60%)',
                                    }}
                                />
                                {/* Overlay label */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 20,
                                        left: 20,
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '10px',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        color: '#666',
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '4px 10px',
                                        backdropFilter: 'blur(4px)',
                                    }}
                                >
                                    {item.id} — RESTRICTED
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 20,
                                        left: 20,
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '10px',
                                        color: '#444',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {item.sensor}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div
                                        style={{
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '10px',
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            color: '#444',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        {item.location} — {item.date}
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '-0.01em',
                                            color: '#888',
                                            margin: '0 0 40px 0',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                </div>

                                {/* Data table */}
                                <div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '0',
                                            borderTop: '1px solid #1a1a1a',
                                            marginBottom: '32px',
                                        }}
                                    >
                                        {[
                                            { label: 'Detection', value: 'Restricted', highlight: false },
                                            { label: 'Outcome', value: 'Restricted', highlight: true },
                                        ].map((row, ri) => (
                                            <div
                                                key={ri}
                                                style={{
                                                    padding: '20px',
                                                    borderRight: ri === 0 ? '1px solid #1a1a1a' : 'none',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily: 'var(--font-space-mono)',
                                                        fontSize: '10px',
                                                        letterSpacing: '0.15em',
                                                        textTransform: 'uppercase',
                                                        color: '#333',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    {row.label}
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily: 'var(--font-space-mono)',
                                                        fontSize: '15px',
                                                        color: row.highlight ? '#cc0000' : '#444',
                                                        letterSpacing: '0.02em',
                                                    }}
                                                >
                                                    {row.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <span
                                        style={{
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '11px',
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            color: '#cc0000',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid rgba(204,0,0,0.3)',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        Access Required ↗
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
