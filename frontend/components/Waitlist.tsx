'use client';

import WaitlistForm from './WaitlistForm';

export default function Waitlist() {
    return (
        <section
            id="waitlist"
            className="py-24 md:py-32 bg-[#060606] border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
                    <div className="flex flex-col">
                        <div className="section-label mb-8">Early Access — Q2 2026</div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-none tracking-tighter uppercase text-white mb-6">
                            Get early<br />
                            <span className="text-[#cc0000]">access.</span>
                        </h2>
                        <p className="text-[#666] text-base md:text-lg leading-relaxed font-light m-0 max-w-[480px]">
                            Limited spots for the pilot program. Priority access for agriculture, infrastructure, and defense operators.
                        </p>
                    </div>

                    <div className="w-full">
                        <WaitlistForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
