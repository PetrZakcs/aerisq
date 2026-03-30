'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const CALENDLY_URL = "https://calendly.com/petr-phasq/30min";

const TIERS = [
    {
        id: 'AGR',
        name: 'Agriculture',
        price: '$5',
        period: '/ ha / year',
        desc: 'Precision moisture monitoring for modern farms.',
        features: [
            'Weekly root-zone updates',
            'Drought prediction models',
            'Yield forecasting',
            'Variable rate maps (VRA)',
            'Unlimited team access',
        ],
        cta: 'Start Monitoring ↗',
        ctaLink: '#waitlist',
        highlight: true,
    },
    {
        id: 'DEF',
        name: 'Defense & Gov',
        price: 'Custom',
        period: '',
        desc: 'Persistent surveillance. Strategic-grade analysis.',
        features: [
            'Daily revisit (constellation)',
            'Sub-mm subsidence detection',
            'Dark vessel detection',
            'On-premise deployment',
            'Dedicated analyst support',
        ],
        cta: 'Book a demo ↗',
        ctaLink: CALENDLY_URL,
        highlight: false,
    },
    {
        id: 'INF',
        name: 'Infrastructure',
        price: 'Custom',
        period: '',
        desc: 'Continuous stability monitoring for critical assets.',
        features: [
            'Pipeline integrity analysis',
            'Dam stability monitoring',
            'Bridge vibration analysis',
            'Landslide early warning',
            'Raw phase data access',
        ],
        cta: 'Book a demo ↗',
        ctaLink: CALENDLY_URL,
        highlight: false,
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            className="py-24 md:py-32 bg-black border-t border-white/10"
        >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="section-label">Pricing</div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10 mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter uppercase text-white m-0">
                        Transparent<br />
                        pricing.
                    </h2>
                    <p className="text-[#666] text-base md:text-lg leading-relaxed font-light m-0 max-w-[400px]">
                        Scalable intelligence from single fields to national-scale monitoring.
                        One platform, any operational scope.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/10 overflow-hidden">
                    {TIERS.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`p-8 md:p-12 relative flex flex-col border-b md:border-b-0 md:border-r border-white/10 last:border-b-0 last:border-r-0 ${
                                tier.highlight ? 'bg-[#0a0a0a]' : 'bg-transparent'
                            }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#cc0000]" />
                            )}

                            {/* Tier ID */}
                            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#cc0000] mb-6">
                                [{tier.id}]
                            </div>

                            <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-4">
                                {tier.name}
                            </div>

                            <div className="mb-4">
                                <span className={`font-mono text-white tracking-tight ${tier.price === 'Custom' ? 'text-3xl' : 'text-5xl font-bold'}`}>
                                    {tier.price}
                                </span>
                                {tier.period && (
                                    <span className="font-mono text-[11px] text-[#555] ml-2 tracking-widest">
                                        {tier.period}
                                    </span>
                                )}
                            </div>

                            <p className="text-[#555] text-sm leading-relaxed font-light mb-10">
                                {tier.desc}
                            </p>

                            <div className="w-full h-px bg-white/5 mb-8" />

                            <ul className="list-none p-0 m-0 mb-12 flex-1 space-y-4">
                                {tier.features.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-4 text-sm text-[#888] font-light">
                                        <div className={`w-3.5 h-3.5 flex items-center justify-center shrink-0 mt-0.5 ${tier.highlight ? 'bg-[#cc0000]' : 'bg-white/10'}`}>
                                            <Check className={`w-2 h-2 ${tier.highlight ? 'text-black' : 'text-[#666]'}`} />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={tier.ctaLink}
                                target={tier.ctaLink.startsWith('http') ? "_blank" : "_self"}
                                className={`block w-full py-4 text-center font-mono text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border ${
                                    tier.highlight 
                                    ? 'bg-white text-black border-transparent hover:bg-[#cc0000] hover:text-white' 
                                    : 'text-[#888] border-white/10 hover:text-white hover:border-white'
                                }`}
                            >
                                {tier.cta}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
