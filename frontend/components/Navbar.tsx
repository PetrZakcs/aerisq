'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, LogOut, User, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import LoginModal from './LoginModal';

export default function Navbar() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

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
                    {isLoading ? (
                        <div className="px-4 py-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {/* User Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-radar-green/30 bg-radar-green/5">
                                <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                                <span className="font-mono text-xs text-radar-green">
                                    {user?.email?.split('@')[0].toUpperCase()}
                                </span>
                            </div>

                            {/* Logout Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold text-gray-400 border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                            >
                                <LogOut className="w-3 h-3" />
                                <span className="hidden sm:inline">LOGOUT</span>
                            </motion.button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Login Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowLoginModal(true)}
                                className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold text-gray-400 border border-white/10 hover:border-radar-green/50 hover:text-radar-green transition-all"
                            >
                                <LogIn className="w-3 h-3" />
                                <span className="hidden sm:inline">LOGIN</span>
                            </motion.button>

                            {/* Join Waitlist Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 font-mono text-xs font-bold text-black uppercase bg-radar-green hover:bg-white transition-colors"
                            >
                                Join Waitlist
                            </motion.button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}
