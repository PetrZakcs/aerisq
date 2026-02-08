'use client';

import { Check, ShieldAlert } from 'lucide-react';

const TIERS = [
    {
        name: "AGRICULTURE",
        price: "$5",
        period: "/ ha / year",
        desc: "Precision moisture monitoring for modern farming.",
        features: [
            "Weekly Root-Zone Updates",
            "Drought Prediction Models",
            "Yield Forecasting",
            "Variable Rate Maps (VRA)",
            "Unlimited Users"
        ],
        cta: "Calculate ROI",
        highlight: true
    },
    {
        name: "DEFENSE & GOV",
        price: "CUSTOM",
        period: "",
        desc: "Persistent surveillance for strategic sectors.",
        features: [
            "Daily Revisit (Constellation)",
            "Sub-millimeter Subsidence",
            "Dark Vessel Detection",
            "On-Premise Deployment",
            "Dedicated Analyst Team"
        ],
        cta: "Contact Command",
        highlight: false
    },
    {
        name: "INFRASTRUCTURE",
        price: "CUSTOM",
        period: "",
        desc: "Stability monitoring for critical assets.",
        features: [
            "Pipeline Integrity",
            "Dam Stability Monitoring",
            "Bridge Vibration Analysis",
            "Landslide Early Warning",
            "Raw Phase Data Access"
        ],
        cta: "Request Demo",
        highlight: false
    }
];

export default function Pricing() {
    return (
        <section className="py-24 bg-[#080808] border-t border-white/5 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6 uppercase tracking-tight">Deployment Tiers</h2>
                    <p className="text-gray-400 font-sans text-lg max-w-2xl mx-auto">
                        Scalable intelligence for any operational theatre. From single fields to national borders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TIERS.map((tier, i) => (
                        <div
                            key={i}
                            className={`p-10 border rounded-3xl flex flex-col relative transition-all duration-300 ${tier.highlight
                                ? "bg-white/[0.03] border-radar-green/40 shadow-[0_0_50px_rgba(81,138,22,0.1)] scale-105 z-10"
                                : "bg-[#0A0A0A] border-white/10 hover:border-white/20"
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radar-green text-black px-4 py-1 text-xs font-bold font-mono rounded-full tracking-widest uppercase shadow-[0_0_20px_rgba(81,138,22,0.4)]">
                                    Most Deployed
                                </div>
                            )}

                            <h3 className="text-sm font-mono font-bold text-gray-500 mb-4 uppercase tracking-widest">{tier.name}</h3>
                            <div className="text-5xl font-bold font-display text-white mb-6">
                                {tier.price} <span className="text-lg font-sans font-normal text-gray-400">{tier.period}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-8 leading-relaxed h-10">
                                {tier.desc}
                            </p>

                            <div className="w-full h-px bg-white/5 mb-8" />

                            <ul className="space-y-4 mb-10 flex-1">
                                {tier.features.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-3 text-sm text-gray-300 group">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${tier.highlight ? 'bg-radar-green/20 text-radar-green' : 'bg-white/10 text-gray-400'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="font-sans group-hover:text-white transition-colors">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={tier.cta === 'Request Demo' ? 'https://calendly.com/petrrmarketing/aerisq' : '#waitlist'}
                                className={`block w-full py-4 text-center font-bold font-mono uppercase tracking-widest text-xs rounded-xl transition-all ${tier.highlight
                                    ? "bg-radar-green text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                    : "border border-white/20 text-white hover:bg-white/5 hover:border-white"
                                    }`}
                            >
                                {tier.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
