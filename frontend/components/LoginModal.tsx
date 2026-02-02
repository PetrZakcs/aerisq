'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setEmail('');
                setPassword('');
                router.push('/dashboard');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const fillTestCredentials = () => {
        setEmail('admin@aerisq.tech');
        setPassword('password123');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-[#0A0A0A] border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
                        <h2 className="text-xl font-mono font-bold text-white tracking-widest">
                            SYSTEM ACCESS
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Access granted. Redirecting...
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Identifier
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operator@aerisq.tech"
                            className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm placeholder:text-gray-600 focus:border-radar-green focus:outline-none transition-colors"
                            required
                            disabled={isLoading || success}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Access Key
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm placeholder:text-gray-600 focus:border-radar-green focus:outline-none transition-colors"
                            required
                            disabled={isLoading || success}
                        />
                    </div>

                    {/* Test Credentials Hint */}
                    <button
                        type="button"
                        onClick={fillTestCredentials}
                        className="text-xs font-mono text-gray-600 hover:text-radar-green transition-colors"
                    >
                        [DEV] Use test credentials →
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full py-4 bg-radar-green text-black font-mono font-bold tracking-widest hover:bg-radar-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                AUTHENTICATING...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                ACCESS GRANTED
                            </>
                        ) : (
                            'AUTHENTICATE'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 text-center">
                    <p className="text-xs font-mono text-gray-600">
                        CLASSIFIED ACCESS • AUTHORIZED PERSONNEL ONLY
                    </p>
                </div>
            </div>
        </div>
    );
}
