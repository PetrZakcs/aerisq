'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <section
            style={{
                position: 'relative',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '120px 0 80px 0',
                background: '#000',
                overflow: 'hidden',
            }}
        >
            {/* Full-bleed background image with grain overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'url(/vysocina_radar.png) center / cover no-repeat',
                    opacity: 0.2,
                    filter: 'grayscale(100%) contrast(1.4)',
                }}
            />

            {/* Dark gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.95) 100%)',
                }}
            />

            {/* Thin horizontal scan line */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '1px',
                    top: '40%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(204,0,0,0.1) 30%, rgba(204,0,0,0.3) 50%, rgba(204,0,0,0.1) 70%, transparent 100%)',
                    pointerEvents: 'none',
                    boxShadow: '0 0 15px rgba(204,0,0,0.15)'
                }}
            />

            {/* Corner marks — SpaceX style */}
            <div style={{ position: 'absolute', top: 80, left: 40, width: 16, height: 16, borderTop: '1px solid #444', borderLeft: '1px solid #444' }} />
            <div style={{ position: 'absolute', top: 80, right: 40, width: 16, height: 16, borderTop: '1px solid #444', borderRight: '1px solid #444' }} />
            <div style={{ position: 'absolute', bottom: 80, left: 40, width: 16, height: 16, borderBottom: '1px solid #444', borderLeft: '1px solid #444' }} />
            <div style={{ position: 'absolute', bottom: 80, right: 40, width: 16, height: 16, borderBottom: '1px solid #444', borderRight: '1px solid #444' }} />

            {/* Content */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 40px',
                    width: '100%',
                }}
            >
                {/* Top label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '24px' }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '10px',
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{ color: '#cc0000' }}>📡</span> Radar Phase Intelligence
                    </span>
                </motion.div>

                {/* Main heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15 }}
                    style={{
                        fontSize: 'clamp(3.5rem, 9vw, 10rem)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        letterSpacing: '-0.04em',
                        textTransform: 'uppercase',
                        color: '#fff',
                        margin: '0 0 32px 0',
                    }}
                >
                    Shift the{' '}
                    <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)', color: 'transparent' }}>Perspective</span>
                    <br />
                    PhasQ Analysis.
                </motion.h1>

                {/* Sub-text and CTAs row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '40px',
                        flexWrap: 'wrap',
                    }}
                >
                    <p
                        style={{
                            color: '#888',
                            fontSize: '16px',
                            lineHeight: 1.7,
                            maxWidth: '480px',
                            margin: 0,
                            fontWeight: 300,
                        }}
                    >
                        Physics-based Synthetic Aperture Radar analysis.
                        All-weather, all-hour intelligence — where optical satellites go blind.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
                        <a
                            href="#demos"
                            className="btn-primary"
                        >
                            Explore Demo ↗
                        </a>
                        <a
                            href="#process"
                            className="btn-outline"
                        >
                            How It Works
                        </a>
                    </div>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0',
                        marginTop: '80px',
                        borderTop: '1px solid #1a1a1a',
                        paddingTop: '32px',
                    }}
                >
                    {[
                        { value: '6-DAY', label: 'Revisit Cycle' },
                        { value: '+14 DAYS', label: 'Early Detection' },
                        { value: '100%', label: 'Cloud Penetration' },
                        { value: 'C-BAND', label: 'SAR Frequency' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            style={{
                                flex: '1 1 150px',
                                paddingRight: '32px',
                                borderRight: i < 3 ? '1px solid #1a1a1a' : 'none',
                                paddingLeft: i > 0 ? '32px' : '0',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                                    fontWeight: 700,
                                    color: '#fff',
                                    letterSpacing: '-0.02em',
                                    display: 'block',
                                    marginBottom: '4px',
                                }}
                            >
                                {stat.value}
                            </div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '10px',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: '#555',
                                }}
                            >
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
