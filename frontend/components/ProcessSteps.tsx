'use client';

export default function ProcessSteps() {
    const steps = [
        { num: '01', title: 'Target Acquisition', desc: 'Select your AOI (Area of Interest). We stream calibrated Sentinel-1 GRD data for your coordinates.' },
        { num: '02', title: 'Signal Processing', desc: 'Our four automated agents convert raw backscatter (dB) into moisture and structural health maps.' },
        { num: '03', title: 'Actionable Intel', desc: 'Receive a Mission Report with vector masks for your machinery and plain English summaries.' },
    ];

    return (
        <section id="process" className="py-24 bg-aeris-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-16 text-center">MISSION PROTOCOL</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-radar-green/50 to-transparent z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-aeris-dark border border-white/10 text-radar-green flex items-center justify-center font-display text-3xl font-bold mb-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-radar-green/50 group-hover:scale-110 transition-all duration-300">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-bold font-display text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm font-sans max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
