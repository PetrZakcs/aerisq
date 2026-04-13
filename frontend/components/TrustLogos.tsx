'use client';

export default function TrustLogos() {
    const logos = [
        { name: 'ESA', label: 'ESA BIC' },
        { name: 'Copernicus', label: 'COPERNICUS' },
        { name: 'GSA', label: 'EUSPA' },
        { name: 'MinAgri', label: 'MINISTRY OF AGRICULTURE' },
    ];

    return (
        <section className="py-12 border-b border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center font-mono text-[10px] text-gray-500 mb-12 uppercase tracking-[0.25em] font-bold">
                    Trusted by Scientific & Government Institutions
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                    {logos.map((logo) => (
                        <div key={logo.name} className="flex items-center gap-2 group">
                            <span className="text-sm md:text-xl font-black font-sans text-gray-400 group-hover:text-white transition-colors tracking-tighter uppercase">
                                {logo.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
