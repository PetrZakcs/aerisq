'use client';

import WaitlistForm from './WaitlistForm';

export default function Waitlist() {
    return (
        <section id="waitlist" className="py-32 bg-aeris-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radar-green/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    SECURE YOUR <span className="text-radar-green">INTELLIGENCE</span>.
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                    Join the waitlist for early access to the AerisQ Physics Core.
                    Limited spots for the Pilot Program (Q2 2026).
                </p>

                <WaitlistForm />
            </div>
        </section>
    );
}
