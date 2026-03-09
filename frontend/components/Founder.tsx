'use client';

import { motion } from 'framer-motion';

const TEAM = [
    {
        id: 'PZ-01',
        name: 'Petr Žák',
        role: 'Founder & CEO',
        bio: 'GIS specialist and high-agency builder who re-engineered AerisQ\'s core physics engine in 14 days — replacing AI hallucinations with raw SAR signal analysis. Detects subsurface drought and hidden assets where optical systems see nothing.',
        image: '/team/petr-zak.jpg',
        linkedin: 'https://www.linkedin.com/in/petrzak01/',
    },
    {
        id: 'JR-01',
        name: 'Jan Rudolf',
        role: 'CTO',
        bio: 'From engineering autonomous systems at VW/Audi and US generative AI labs to architecting AerisQ\'s radar signal intelligence stack — grounded in physics research from CTU Prague.',
        image: '/team/jan-rudolf.jpg',
    },
];

export default function Founder() {
    return (
        <section
            id="company"
            style={{
                padding: '120px 0',
                background: '#000',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Team</div>

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
                        Built by<br />
                        scientists.
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                        We bridge the gap between academic radar physics and real-world operational intelligence. Not a team of designers making visualizations — engineers solving the radar equation.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        borderTop: '1px solid #1a1a1a',
                        borderLeft: '1px solid #1a1a1a',
                    }}
                >
                    {TEAM.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            style={{
                                borderRight: '1px solid #1a1a1a',
                                borderBottom: '1px solid #1a1a1a',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Photo */}
                            <div
                                style={{
                                    position: 'relative',
                                    aspectRatio: '4/3',
                                    overflow: 'hidden',
                                    background: '#0a0a0a',
                                }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'top',
                                        filter: 'grayscale(100%) contrast(1.1)',
                                        display: 'block',
                                        transition: 'filter 0.4s ease',
                                    }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%) contrast(1)')}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%) contrast(1.1)')}
                                />
                                {/* ID overlay */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        left: 16,
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '10px',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        color: '#888',
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '4px 10px',
                                    }}
                                >
                                    {member.id}
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '40px' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '10px',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        color: '#cc0000',
                                        marginBottom: '8px',
                                    }}
                                >
                                    {member.role}
                                </div>
                                <h3
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.01em',
                                        color: '#fff',
                                        margin: '0 0 20px 0',
                                    }}
                                >
                                    {member.name}
                                </h3>
                                <p
                                    style={{
                                        color: '#666',
                                        fontSize: '13px',
                                        lineHeight: 1.9,
                                        margin: '0 0 24px 0',
                                        fontWeight: 300,
                                    }}
                                >
                                    {member.bio}
                                </p>
                                {member.linkedin && (
                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '10px',
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            color: '#555',
                                            textDecoration: 'none',
                                            border: '1px solid #222',
                                            padding: '6px 14px',
                                            display: 'inline-block',
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.color = '#555';
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222';
                                        }}
                                    >
                                        LinkedIn ↗
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
