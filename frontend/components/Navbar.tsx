'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';


export default function Navbar() {

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

        </>
    );
}
