'use client';

const FAQS = [
    {
        q: "How accurate is the moisture detection?",
        a: "We calibrate to Sentinel-1's native Sigma Naught (σ0) backscatter. In open fields, we detect statistically significant relative moisture drops (p<0.05) compared to a 2-year baseline. Resolution is 10m/pixel."
    },
    {
        q: "Does this work in cloudy weather?",
        a: "Yes. C-Band Synthetic Aperture Radar (SAR) penetrates clouds, fog, and light rain. It is an active sensor (it transmits its own energy), so it also works at night."
    },
    {
        q: "Can I use this for forestry?",
        a: "Absolutely. We offer a specific 'Biomass Coherence' pipeline that detects illegal logging and canopy loss by analyzing phase coherence loss between consecutive satellite passes."
    },
    {
        q: "Do I need GIS software?",
        a: "No. You can view all results in our web dashboard, or download simple PDF reports. For power users, we provide GeoTIFF/Shapefiles compatible with QGIS and ArcGIS."
    }
];

export default function FAQ() {
    return (
        <section className="py-24 bg-aeris-black border-t border-white/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">TECHNICAL FAQ</h2>

                <div className="space-y-6">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border border-white/10 bg-white/[0.02] p-6 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
