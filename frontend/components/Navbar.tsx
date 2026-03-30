'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Instagram } from 'lucide-react';

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    const navLinks = [
        { name: 'Technology', href: '#technology' },
        { name: 'Use Cases', href: '#usecases' },
        { name: 'About', href: '#company' },
        { name: 'Pricing', href: '#pricing' }
    ];

    const CALENDLY_URL = "https://calendly.com/petr-phasq/30min";
    const INSTAGRAM_URL = "https://www.instagram.com/phasq1/";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between transition-all duration-300 ${
                    scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 py-4 px-6 md:px-10' : 'bg-transparent py-6 px-6 md:px-10'
                }`}
            >
                {/* Logo */}
                <Link href="/" className="relative w-[34px] h-[40px] flex items-center justify-center flex-shrink-0">
                    <Logo style={{ width: '100%', height: '100%' }} />
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="font-mono text-[11px] tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* CTAs & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <a 
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex text-white/30 hover:text-white transition-colors"
                    >
                        <Instagram className="w-4 h-4" />
                    </a>

                    <a
                        href={CALENDLY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden lg:block font-mono text-[11px] tracking-widest uppercase text-[#cc0000] border border-[#cc0000]/30 hover:bg-[#cc0000] hover:text-white px-5 py-2.5 transition-all font-bold"
                    >
                        Book a demo
                    </a>

                    <Link
                        href="#waitlist"
                        className="font-mono text-[11px] tracking-widest uppercase text-white bg-[#cc0000] px-5 py-2.5 flex items-center gap-2 font-bold hover:bg-white hover:text-black transition-all"
                    >
                        Get Access <span className="hidden sm:inline">↗</span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className={`w-6 h-px bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-px bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`w-6 h-px bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 z-[90] bg-black/98 backdrop-blur-3xl md:hidden transition-transform duration-500 ease-in-out ${
                    mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="flex flex-col items-center justify-center h-full gap-8 px-10">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="font-mono text-2xl tracking-[0.2em] uppercase text-white hover:text-[#cc0000] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="w-20 h-px bg-[#cc0000]/50 my-4" />
                    <a
                        href={CALENDLY_URL}
                        target="_blank"
                        className="font-mono text-sm tracking-[0.2em] uppercase text-white bg-[#cc0000] px-10 py-5 w-full text-center font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Book a demo
                    </a>
                    <div className="flex gap-10 mt-6">
                        <a href={INSTAGRAM_URL} target="_blank" className="text-white/30 hover:text-white transition-colors">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="https://www.linkedin.com/company/phasq1" target="_blank" className="text-white/30 hover:text-white transition-colors">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
