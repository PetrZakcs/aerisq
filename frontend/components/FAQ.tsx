'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
    {
        q: 'How does AerisQ differ from NDVI optical imagery?',
        a: 'NDVI is a lagging indicator — it only reveals stress after chlorophyll loss occurs visibly. AerisQ uses C-band SAR to measure dielectric constant changes in the root zone, detecting water stress 14 days before any visual signals appear. The difference is prevention vs. reaction.',
    },
    {
        q: 'What makes the physics-based approach unique?',
        a: 'Competitors apply pattern-matching ML to optical images. We solve the radar equation — modeling backscatter physics (σ⁰ Naught) to derive soil moisture and structural properties from first principles. Results are grounded in electromagnetics, not learned correlations.',
    },
    {
        q: 'Can radar detect assets under concealment?',
        a: 'Yes. Metal surfaces have near-perfect radar reflectivity (corner reflection). Radar energy penetrates lightweight foliage, camouflage nets, and thin cover — returning a distinct double-bounce signature from hard surfaces that is impossible to mask.',
    },
    {
        q: 'Do I need hardware or ground sensors?',
        a: 'Zero hardware. The Sentinel-1 constellation revisits every coordinate on Earth every 6–12 days. We process petabyte-scale SAR archives in cloud infrastructure and deliver ready-to-use intelligence — no installation, no calibration.',
    },
    {
        q: 'How is data kept secure?',
        a: 'Area of interest coordinates and analysis outputs are encrypted end-to-end. We do not share data with third parties or train external models on your inputs. Defense and government clients may request fully air-gapped, on-premise deployment.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section
            style={{
                padding: '120px 0',
                background: '#060606',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">FAQ</div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '80px',
                        alignItems: 'start',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 3vw, 3.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase',
                            color: '#fff',
                            margin: 0,
                            position: 'sticky',
                            top: '120px',
                        }}
                    >
                        Questions<br />
                        &amp; answers.
                    </h2>

                    <div style={{ borderTop: '1px solid #1a1a1a' }}>
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                style={{
                                    borderBottom: '1px solid #1a1a1a',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '28px 0',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-space-mono)',
                                                fontSize: '10px',
                                                color: '#cc0000',
                                                letterSpacing: '0.1em',
                                                paddingTop: '4px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: openIndex === i ? '#fff' : '#ccc',
                                                margin: 0,
                                                lineHeight: 1.4,
                                                transition: 'color 0.15s ease',
                                            }}
                                        >
                                            {faq.q}
                                        </h3>
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '18px',
                                            color: '#444',
                                            flexShrink: 0,
                                            transition: 'transform 0.3s ease, color 0.15s ease',
                                            transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
                                            color: openIndex === i ? '#cc0000' : '#444',
                                            display: 'inline-block',
                                        }}
                                    >
                                        +
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <p
                                                style={{
                                                    color: '#666',
                                                    fontSize: '14px',
                                                    lineHeight: 1.9,
                                                    margin: '0 0 28px 42px',
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
