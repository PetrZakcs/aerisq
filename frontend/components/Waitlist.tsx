'use client';

import WaitlistForm from './WaitlistForm';

export default function Waitlist() {
    return (
        <section
            id="waitlist"
            style={{
                padding: '120px 0',
                background: '#060606',
                borderTop: '1px solid #1a1a1a',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '80px',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div className="section-label" style={{ marginBottom: '32px' }}>Early Access — Q2 2026</div>
                        <h2
                            style={{
                                fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                                fontWeight: 800,
                                lineHeight: 1.0,
                                letterSpacing: '-0.03em',
                                textTransform: 'uppercase',
                                color: '#fff',
                                margin: '0 0 24px 0',
                            }}
                        >
                            Get early<br />
                            <span style={{ color: '#cc0000' }}>access.</span>
                        </h2>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, margin: 0, fontWeight: 300, maxWidth: '400px' }}>
                            Limited spots for the pilot program. Priority access for agriculture, infrastructure, and defense operators.
                        </p>
                    </div>

                    <div>
                        <WaitlistForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
