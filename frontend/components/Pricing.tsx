'use client';

import { Check } from 'lucide-react';

const TIERS = [
    {
        name: "PILOT",
        price: "Free",
        desc: "For validation and small acreage.",
        features: [
            "1 Mission Report / Month",
            "Up to 100ha AOI",
            "Historical Analysis (6 months)",
            "Standard Resolution (10m)"
        ],
        cta: "Deploy Pilot",
        highlight: false
    },
    {
        name: "TACTICAL",
        price: "€250",
        period: "/ mo",
        desc: "For professional agronomy and monitoring.",
        features: [
            "Weekly Monitoring",
            "Up to 2,000ha AOI",
            "Historical Analysis (2 years)",
            "Alert Thresholds (-dB Drop)",
            "Priority Processing"
        ],
        cta: "Equip Tactical",
        highlight: true
    },
    {
        name: "ENTERPRISE",
        price: "Custom",
        desc: "For national agencies and defense.",
        features: [
            "Daily Revisit (Constellation)",
            "Unlimited Area",
            "Raw API Access",
            "On-Premise Deployment",
            "Dedicated Analyst Team"
        ],
        cta: "Contact Command",
        highlight: false
    }
];

export default function Pricing() {
    return (
        <section className="py-24 bg-[#080808] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">DEPLOYMENT TIERS</h2>
                    <p className="text-gray-500 font-mono">Select your operational capacity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TIERS.map((tier, i) => (
                        <div
                            key={i}
                            className={`p-8 border rounded-xl flex flex-col relative ${tier.highlight
                                    ? "bg-white/[0.03] border-radar-green/50 shadow-[0_0_30px_rgba(81,138,22,0.1)]"
                                    : "bg-transparent border-white/10"
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radar-green text-black px-4 py-1 text-xs font-bold font-mono rounded-full tracking-widest uppercase">
                                    Recommended
                                </div>
                            )}

                            <h3 className="text-lg font-mono text-gray-400 mb-2">{tier.name}</h3>
                            <div className="text-4xl font-bold text-white mb-4">
                                {tier.price} <span className="text-base font-normal text-gray-500">{tier.period}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-8 border-b border-white/5 pb-8">
                                {tier.desc}
                            </p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {tier.features.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check className={`w-4 h-4 mt-0.5 ${tier.highlight ? 'text-radar-green' : 'text-gray-500'}`} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 font-bold font-mono uppercase tracking-widest text-xs transition-all ${tier.highlight
                                    ? "bg-radar-green text-black hover:bg-white"
                                    : "border border-white/20 text-white hover:border-white"
                                }`}>
                                {tier.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
