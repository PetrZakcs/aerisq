import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PopupModal } from 'react-calendly';


export default function Navbar() {
    const [openCalendly, setOpenCalendly] = useState(false);
    // Solves hydration mismatch for accessing document
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-aeris-black/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="relative w-48 h-12">
                        <Image
                            src="/logo.png"
                            alt="AerisQ Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 font-mono text-sm tracking-wide text-gray-400">
                    <Link href="#technology" className="hover:text-radar-green transition-colors">TECHNOLOGY</Link>
                    <Link href="#missions" className="hover:text-radar-green transition-colors">MISSIONS</Link>
                    <Link href="#company" className="hover:text-radar-green transition-colors">COMPANY</Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Book Demo CTA */}
                    <button
                        onClick={() => setOpenCalendly(true)}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold text-white border border-white/20 hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        <span>BOOK DEMO</span>
                    </button>

                    {/* Primary CTA */}
                    <Link
                        href="#waitlist"
                        className="flex items-center gap-2 px-6 py-2 font-mono text-xs font-bold text-black uppercase bg-radar-green hover:bg-white transition-all hover:scale-105"
                    >
                        <span>REQUEST ACCESS</span>
                    </Link>
                </div>
            </nav>


            {/* Login Modal */}

            <PopupModal
                url="https://calendly.com/petrrmarketing/aerisq"
                onModalClose={() => setOpenCalendly(false)}
                open={openCalendly}
                rootElement={document.getElementById("root") || document.body}
            />
        </>
    );
}
