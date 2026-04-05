'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MissionReports from "@/components/MissionReports";
import ProcessSteps from "@/components/ProcessSteps";
import Benefits from "@/components/Benefits";
import Pricing from "@/components/Pricing";
import Waitlist from "@/components/Waitlist";
import FAQ from "@/components/FAQ";
import Founder from "@/components/Founder";
import TruthSlider from "@/components/TruthSlider";
import { Mail, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const INSTAGRAM_URL = "https://www.instagram.com/phasq1/";
  const LINKEDIN_URL = "https://www.linkedin.com/company/phasq1";
  const CALENDLY_URL = "https://calendly.com/petr-phasq/30min";

  return (
    <main className="bg-black text-white selection:bg-[#cc0000]/30 overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Comparison Section */}
      <section id="demo" className="py-24 md:py-32 bg-black border-t border-white/10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-20">
          <div className="section-label">Live demonstration</div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter uppercase text-white m-0">
              The shift from<br />
              optical to <span className="text-[#cc0000]">radar.</span>
            </h2>
            <p className="text-[#666] text-base md:text-lg leading-relaxed font-light m-0 max-w-[400px]">
              Drag the slider to compare standard optical imagery with PhasQ's phase-intelligent radar analysis.
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[400px] md:h-[600px] lg:h-[700px]">
          <TruthSlider 
            beforeImage="/vysocina_optical.png" 
            afterImage="/vysocina_radar.png"
            beforeLabel="Optical (Sentinel-2)"
            afterLabel="PhasQ Radar (Sentinel-1)"
          />
        </div>
      </section>

      <Features />
      <MissionReports />
      <Benefits />
      <ProcessSteps />

      {/* Agriculture Restricted Area */}
      <section className="py-24 md:py-32 bg-[#060606] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col gap-6 items-start mb-16">
            <div className="section-label">Early access — Q2 2026</div>
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#cc0000] uppercase">
                🔴 Restricted Area
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            <div className="flex flex-col">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none tracking-tighter uppercase text-white mb-6">
                Agriculture<br />
                Intelligence.
              </h2>
              <p className="text-[#666] text-base md:text-lg leading-relaxed font-light mb-10 max-w-[480px]">
                Coming soon: Crop health, soil moisture, and harvest readiness via Sentinel-1 SAR. 
                Full orbital throughput for precision farming.
              </p>
              <div>
                <span className="inline-block font-mono text-[11px] tracking-widest uppercase text-white border border-white/10 px-8 py-3 bg-white/5 backdrop-blur-sm">
                  Opening Q2 2026
                </span>
              </div>
            </div>

            <div className="relative aspect-video rounded-xl border border-white/10 overflow-hidden bg-black flex items-center justify-center group">
              <img 
                src="/agri_restricted.png" 
                alt="Agri Intel" 
                className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-30 transition-opacity"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full border border-[#cc0000]/30 flex items-center justify-center mb-4">
                    <span className="text-[#cc0000] text-xl">🔒</span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#cc0000] mb-2">Access Required</h3>
                <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                  Authentication protocol v2.1 // Q2 Release
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Founder />
      <Waitlist />

      {/* Footer */}

      {/* Footer */}
      <footer className="py-20 md:py-24 bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-10 mb-20">
            {/* Branding */}
            <div className="flex flex-col col-span-2">
              <div className="text-2xl font-black tracking-tighter uppercase mb-6">
                PHASQ<span className="text-[#cc0000]">.tech</span>
              </div>
              <p className="text-[#666] text-sm md:text-base leading-relaxed font-light max-w-[320px] mb-8">
                Physics-based radar intelligence. Shifting the perspective from optical to radar surveillance.
              </p>
              <div className="flex gap-6">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                </a>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-5">
              <h4 className="font-mono text-[11px] tracking-widest uppercase text-white/50 mb-2">Comms</h4>
              <a href="mailto:petr@phasq.com" className="group flex items-center gap-3 text-[#666] hover:text-white transition-colors text-sm">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#cc0000] group-hover:bg-[#cc0000]/5 transition-all">
                    <Mail className="w-3.5 h-3.5" />
                </div>
                petr@phasq.com
              </a>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-[#666] hover:text-white transition-colors text-sm">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#cc0000] group-hover:bg-[#cc0000]/5 transition-all font-mono text-[10px] font-bold">
                    CAL
                </div>
                Book a demo
              </a>
            </div>

            {/* Legal / System */}
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[11px] tracking-widest uppercase text-white/50 mb-2">System</h4>
              <Link href="/demo" className="text-[#1a1a1a] hover:text-[#222] transition-colors text-[10px] font-mono tracking-[0.2em] whitespace-nowrap cursor-default">
                v1.2.5 — OPERATIONAL
              </Link>
              <span className="text-[#333] text-[10px] font-mono tracking-[0.2em] whitespace-nowrap">© 2026 PHASQ INTELLIGENCE</span>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-mono text-[#222] tracking-[0.4em] uppercase">
                SENTINEL-1 // SENTINEL-2 // GEE // PHASE-02
            </div>
            <div className="flex gap-4">
                <div className="w-12 h-[1px] bg-white/5" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
