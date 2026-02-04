'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus } from "lucide-react";

const FAQS = [
    {
        q: "How does AerisQ differ from NDVI optical imagery?",
        a: "NDVI is a 'lagging indicator'—it only shows stress after the plant has already turned yellow (chlorophyll loss). AerisQ uses Synthetic Aperture Radar (SAR) to measure dielectric constant changes in the root zone. We detect water stress 2 weeks before visual signs appear, allowing you to irrigate and save yield."
    },
    {
        q: "What makes your 'Physics-Based' approach unique?",
        a: "Most competitors use 'Black Box AI' to guess outcomes from optical images. We utilize deep physical modeling of radar backscatter (Sigma Naught). We solve the radar equation for soil moisture and texture, meaning our results are essentially lab-grade measurements from orbit, not hallucinations."
    },
    {
        q: "Can you detect military vehicles under camouflage?",
        a: "Yes. Metal reflects radar waves essentially perfectly (corner reflection). Even if a tank is under a camouflage net or in a forest, the radar signal often penetrates lightweight cover and bounces off the hard metal surfaces, creating a distinct 'double-bounce' signature."
    },
    {
        q: "Do I need to install sensors in my fields?",
        a: "Zero hardware required. We use the Sentinel-1 satellite constellation (and others) which revisits every point on Earth every 6-12 days. We process this petabyte-scale stream in the cloud and deliver actionable maps directly to your phone."
    },
    {
        q: "Is my data secure?",
        a: "We operate on a strictly 'Need-to-Know' architecture. Our servers are air-gapped from public AI models. Your AOI (Area of Interest) coordinates are encrypted, and for Defense clients, we offer on-premise deployment options."
    }
];

export default function FAQ() {
    return (
        <section className="py-32 bg-aeris-black border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-16 text-center uppercase tracking-tight">
                    Mission Critical <span className="text-radar-green">Intel</span>
                </h2>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border-b border-white/10 last:border-0">
                            <details className="group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-6 text-white hover:text-radar-green transition-colors">
                                    <h3 className="font-display text-lg md:text-xl font-medium uppercase tracking-wide">
                                        {faq.q}
                                    </h3>
                                    <div className="white-icon group-open:-rotate-45 transition-transform duration-300">
                                        <Plus className="w-5 h-5 text-gray-500 group-hover:text-radar-green" />
                                    </div>
                                </summary>

                                <p className="font-sans text-gray-400 leading-relaxed mb-6 pl-4 border-l-2 border-radar-green/30">
                                    {faq.a}
                                </p>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
