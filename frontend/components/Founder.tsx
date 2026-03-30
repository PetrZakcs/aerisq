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
        id: 'COLLAB-01',
        name: 'University Partners',
        role: 'Scientific Collaboration',
        bio: 'Strategic partnerships with leading technical universities for radar physics validation and dielectric modeling research.',
        icon: '🏛️',
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
            style={{
                padding: '120px 0',
                background: '#000',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div className="section-label">Organization</div>

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
                        We bridge the gap between academic radar physics and real-world operational intelligence. From core physics to enterprise-scale deployment.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
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
                                gridColumn: member.isLead ? 'span 1' : 'auto',
                                opacity: member.type === 'incoming' ? 0.8 : 1,
                            }}
                        >
                            {/* Visual Header */}
                            <div
                                style={{
                                    position: 'relative',
                                    aspectRatio: member.isCollab ? '16/7' : '4/3',
                                    overflow: 'hidden',
                                    background: '#0a0a0a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'top',
                                            filter: member.type === 'incoming' ? 'grayscale(100%) contrast(1.1) brightness(0.7)' : 'grayscale(100%) contrast(1.1)',
                                            display: 'block',
                                            transition: 'filter 0.4s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (member.type !== 'incoming') {
                                                (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%) contrast(1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (member.type !== 'incoming') {
                                                (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%) contrast(1.1)';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: '48px', opacity: 0.2 }}>{member.icon || '👤'}</div>
                                )}
                                
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
                                        color: member.isCollab ? '#444' : '#888',
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '4px 10px',
                                    }}
                                >
                                    {member.id}
                                </div>

                                {member.type === 'incoming' && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 16,
                                            right: 16,
                                            fontFamily: 'var(--font-space-mono)',
                                            fontSize: '10px',
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            color: '#cc0000',
                                            border: '1px solid #cc0000',
                                            padding: '4px 10px',
                                            background: 'rgba(0,0,0,0.9)',
                                        }}
                                    >
                                        Incoming
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ padding: '40px' }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-space-mono)',
                                        fontSize: '11px',
                                        letterSpacing: '0.15em',
                                        color: member.isCollab ? '#444' : '#cc0000',
                                        marginBottom: '4px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    / {member.role}
                                </div>
                                <h3
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.01em',
                                        color: member.isCollab ? '#888' : '#fff',
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
