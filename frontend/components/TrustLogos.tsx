'use client';

export default function TrustLogos() {
    const logos = [
        { name: 'ESA', label: 'ESA BIC' },
        { name: 'Copernicus', label: 'COPERNICUS' },
        { name: 'GSA', label: 'EUSPA' },
        { name: 'MinAgri', label: 'MINISTRY OF AGRICULTURE' },
    ];

    return (
        <section className="py-12 border-b border-white/5 bg-aeris-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center font-mono text-xs text-gray-600 mb-8 uppercase tracking-widest">
                    Trusted by Scientific & Government Institutions
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo) => (
                        <div key={logo.name} className="flex items-center gap-2 group">
                            {/* Placeholder for Logo - replacing with text for now to avoid broken images */}
                            <span className="text-xl font-bold font-sans text-gray-400 group-hover:text-white transition-colors">{logo.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
