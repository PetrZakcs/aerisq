'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function WaitlistForm() {
    const [email, setEmail] = useState('');
    const [interest, setInterest] = useState('other');
    const [country, setCountry] = useState('other');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            setStatus('error');
            setMessage('DATABASE CONNECTION NOT CONFIGURED.');
            return;
        }

        setStatus('loading');

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([
                    { email, interest, country, created_at: new Date().toISOString() },
                ]);

            if (error) {
                if (error.code === '23505' || error.message.includes('duplicate')) {
                    setStatus('success');
                    setMessage('YOU ARE ALREADY IN THE QUEUE.');
                    return;
                }
                throw error;
            }

            setStatus('success');
            setMessage('TRANSMISSION RECEIVED. WELCOME TO THE INTELLIGENCE LAYER.');
            setEmail('');
        } catch (error) {
            console.error('Error submitting to waitlist:', error);
            setStatus('error');
            setMessage('TRANSMISSION FAILED. PLEASE RETRY.');
        }
    };

    return (
        <div className="w-full max-w-lg relative group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#cc0000]/10 to-transparent rounded-2xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
            
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-10">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#cc0000]/10 text-[#cc0000] mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase">ACCESS REQUESTED</h3>
                            <p className="text-[#cc0000] font-mono text-[11px] tracking-widest uppercase">{message}</p>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label htmlFor="email" className="sr-only">Email Frequency</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="ENTER EMAIL FREQUENCY"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading'}
                                    className="w-full bg-black/50 border border-white/20 px-5 py-4 text-white font-mono placeholder:text-[#333] focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000] transition-all text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="relative">
                                    <select
                                        value={interest}
                                        onChange={(e) => setInterest(e.target.value)}
                                        disabled={status === 'loading'}
                                        className="w-full bg-black/50 border border-white/20 px-5 py-4 text-white font-mono appearance-none focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000] transition-all cursor-pointer text-[11px] tracking-widest"
                                    >
                                        <option value="agriculture">AGRI-INTEL</option>
                                        <option value="defense">DEFENSE/GOV</option>
                                        <option value="investor">INVESTOR</option>
                                        <option value="other">OTHER</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={status === 'loading'}
                                        className="w-full bg-black/50 border border-white/20 px-5 py-4 text-white font-mono appearance-none focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000] transition-all cursor-pointer text-[11px] tracking-widest"
                                    >
                                        <option value="other">SELECT REGION</option>
                                        <option value="us">NORTH AMERICA</option>
                                        <option value="eu">EUROPE</option>
                                        <option value="apac">ASIA PACIFIC</option>
                                        <option value="latam">LATAM</option>
                                        <option value="mea">MIDDLE EAST/AFRICA</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[#cc0000] text-white font-black font-mono py-5 hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        ENCRYPTING...
                                    </>
                                ) : (
                                    'INITIATE UPLINK'
                                )}
                            </button>

                            {status === 'error' && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[#cc0000] text-[10px] font-mono text-center flex items-center justify-center gap-2 tracking-widest"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {message}
                                </motion.p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-[#333] font-mono uppercase tracking-[0.3em]">
                    SECURE TRANSMISSION // 256-BIT ENCRYPTION
                </p>
            </div>
        </div>
    );
}
