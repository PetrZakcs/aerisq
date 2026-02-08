'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Initialize Supabase client
// Note: We use process.env here. If keys are missing, it will log a warning but the UI will still render.
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
            setMessage('Database connection not configured. Please contact admin.');
            console.error('Missing Supabase Environment Variables');
            return;
        }

        setStatus('loading');

        try {
            // Attempt blind insert. 
            // If email exists, Supabase will return an error (23505 unique_violation)
            // We shouldn't check beforehand because that requires SELECT permissions which leaks privacy.
            const { error } = await supabase
                .from('waitlist')
                .insert([
                    { email, interest, country, created_at: new Date().toISOString() },
                ]);

            if (error) {
                // Check for duplicate key error (Postgres code 23505)
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
            setMessage('TRANSMISSION FAILED. PLEASE RETRY OR CONTACT COMMS.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-radar-green/20 to-blue-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-lg">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-8"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-radar-green/10 text-radar-green mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">ACCESS REQUESTED</h3>
                            <p className="text-radar-green font-mono text-sm">{message}</p>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
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
                                    className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-radar-green focus:ring-1 focus:ring-radar-green transition-all rounded-md"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <select
                                        value={interest}
                                        onChange={(e) => setInterest(e.target.value)}
                                        disabled={status === 'loading'}
                                        className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono appearance-none focus:outline-none focus:border-radar-green focus:ring-1 focus:ring-radar-green transition-all rounded-md cursor-pointer text-xs"
                                    >
                                        <option value="agriculture">AGRI-INTEL</option>
                                        <option value="defense">DEFENSE/GOV</option>
                                        <option value="investor">INVESTOR</option>
                                        <option value="other">OTHER</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={status === 'loading'}
                                        className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono appearance-none focus:outline-none focus:border-radar-green focus:ring-1 focus:ring-radar-green transition-all rounded-md cursor-pointer text-xs"
                                    >
                                        <option value="other">SELECT REGION</option>
                                        <option value="us">NORTH AMERICA</option>
                                        <option value="eu">EUROPE</option>
                                        <option value="apac">ASIA PACIFIC</option>
                                        <option value="latam">LATAM</option>
                                        <option value="mea">MIDDLE EAST/AFRICA</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-radar-green text-black font-bold font-mono py-3 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest rounded-md flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
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
                                    className="text-red-400 text-xs font-mono text-center mt-2 flex items-center justify-center gap-2"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {message}
                                </motion.p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    SECURE TRANSMISSION // 256-BIT ENCRYPTION
                </p>
            </div>
        </div>
    );
}
