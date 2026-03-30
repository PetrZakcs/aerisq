'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TIERS = [
    {
        id: 'AGR',
        name: 'Agriculture',
        price: '$5',
        period: '/ ha / year',
        desc: 'Precision moisture monitoring for modern farms.',
        features: [
            'Weekly root-zone updates',
            'Drought prediction models',
            'Yield forecasting',
            'Variable rate maps (VRA)',
            'Unlimited team access',
        ],
        cta: 'Start Monitoring ↗',
        ctaLink: '#waitlist',
        highlight: true,
    },
    {
        id: 'DEF',
        name: 'Defense & Gov',
        price: 'Custom',
        period: '',
        desc: 'Persistent surveillance. Strategic-grade analysis.',
        features: [
            'Daily revisit (constellation)',
            'Sub-mm subsidence detection',
            'Dark vessel detection',
            'On-premise deployment',
            'Dedicated analyst support',
        ],
        cta: 'Contact Us ↗',
        ctaLink: '#waitlist',
        highlight: false,
    },
    {
        id: 'INF',
        name: 'Infrastructure',
        price: 'Custom',
        period: '',
        desc: 'Continuous stability monitoring for critical assets.',
        features: [
            'Pipeline integrity analysis',
            'Dam stability monitoring',
            'Bridge vibration analysis',
            'Landslide early warning',
            'Raw phase data access',
        ],
        cta: 'Request Demo ↗',
        ctaLink: 'https://calendly.com/petrrmarketing/phasq',
        highlight: false,
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            style={{
                padding: '120px 0',
                background: '#000',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Pricing</div>

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
                        Transparent<br />
                        pricing.
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, maxWidth: '400px', fontWeight: 300 }}>
                        Scalable intelligence from single fields to national-scale monitoring.
                        One platform, any operational scope.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        borderTop: '1px solid #1a1a1a',
                        borderLeft: '1px solid #1a1a1a',
                    }}
                    className="grid-cols-1 md:grid-cols-3"
                >
                    {TIERS.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '48px 40px',
                                borderRight: '1px solid #1a1a1a',
                                borderBottom: '1px solid #1a1a1a',
                                background: tier.highlight ? '#0a0a0a' : 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                            }}
                        >
                            {tier.highlight && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background: '#cc0000',
                                    }}
                                />
                            )}

                            {/* Tier ID */}
                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '10px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: '#cc0000',
                                    marginBottom: '20px',
                                }}
                            >
                                [{tier.id}]
                            </div>

                            <div
                                style={{
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: '#666',
                                    marginBottom: '12px',
                                }}
                            >
                                {tier.name}
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: tier.price === 'Custom' ? '28px' : '42px',
                                        fontWeight: 700,
                                        color: '#fff',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {tier.price}
                                </span>
                                {tier.period && (
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '11px',
                                            color: '#555',
                                            marginLeft: '8px',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {tier.period}
                                    </span>
                                )}
                            </div>

                            <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, margin: '0 0 32px 0', fontWeight: 300 }}>
                                {tier.desc}
                            </p>

                            <div
                                style={{
                                    width: '100%',
                                    height: '1px',
                                    background: '#1a1a1a',
                                    marginBottom: '28px',
                                }}
                            />

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {tier.features.map((f, fi) => (
                                    <li
                                        key={fi}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            fontSize: '13px',
                                            color: '#888',
                                            fontWeight: 300,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                background: tier.highlight ? '#cc0000' : '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                marginTop: '2px',
                                            }}
                                        >
                                            <Check style={{ width: '8px', height: '8px', color: tier.highlight ? '#000' : '#666' }} />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={tier.ctaLink}
                                style={{
                                    display: 'block',
                                    padding: '14px 24px',
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-space-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    background: tier.highlight ? '#fff' : 'transparent',
                                    color: tier.highlight ? '#000' : '#888',
                                    border: tier.highlight ? 'none' : '1px solid #2a2a2a',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    if (tier.highlight) {
                                        el.style.background = '#cc0000';
                                        el.style.color = '#fff';
                                    } else {
                                        el.style.borderColor = '#fff';
                                        el.style.color = '#fff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    if (tier.highlight) {
                                        el.style.background = '#fff';
                                        el.style.color = '#000';
                                    } else {
                                        el.style.borderColor = '#2a2a2a';
                                        el.style.color = '#888';
                                    }
                                }}
                            >
                                {tier.cta}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
