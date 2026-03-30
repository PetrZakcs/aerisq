'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { PopupModal } from 'react-calendly';

export default function Navbar() {
    const [openCalendly, setOpenCalendly] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 40px',
                    background: scrolled ? 'rgba(0,0,0,0.92)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid #1a1a1a' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ position: 'relative', width: '38px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Logo style={{ width: '100%', height: '100%' }} />
                </Link>

                {/* Nav Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }} className="hidden md:flex">
                    {['Technology', 'Use Cases', 'About', 'Pricing'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '')}`}
                            style={{
                                fontFamily: 'var(--font-space-mono)',
                                fontSize: '11px',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#888',
                                textDecoration: 'none',
                                transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a
                        href="mailto:petr@phasq.com"
                        className="hidden sm:block"
                        style={{
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '11px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#888',
                            background: 'transparent',
                            border: '1px solid #2a2a2a',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#fff';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a2a';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#888';
                        }}
                    >
                        Contact Us
                    </a>

                    <Link
                        href="#waitlist"
                        style={{
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '11px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#000',
                            background: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#e2e8f0';
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#fff';
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                        }}
                    >
                        Get Access ↗
                    </Link>
                </div>
            </nav>
        </>
    );
}
