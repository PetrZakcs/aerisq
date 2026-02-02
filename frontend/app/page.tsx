'use client';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustLogos from '../components/TrustLogos';
import Benefits from '../components/Benefits';
import ProcessSteps from '../components/ProcessSteps';
import TruthSlider from '../components/TruthSlider';
import MissionReports from '../components/MissionReports';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Founder from '../components/Founder';
import Waitlist from '../components/Waitlist';
import { Shield, Sprout, Satellite, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-aeris-black selection:bg-radar-green selection:text-black">
      <Navbar />

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. TRUST / LOGOS */}
      <TrustLogos />

      {/* 3. BENEFITS (PROBLEM/SOLUTION) */}
      <Benefits />

      {/* 4. PROCESS (HOW IT WORKS) */}
      <ProcessSteps />

      {/* 5. INTERACTIVE DEMO (TRUTH SLIDER) */}
      <TruthSlider />

      {/* 6. FEATURES (SECTOR INTELLIGENCE) */}
      <section id="technology" className="py-24 px-6 bg-aeris-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
            <h2 className="text-xl font-mono font-bold text-gray-500 tracking-widest">SECTOR APPLICATIONS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BentoCard
              title="AGRICULTURE"
              icon={<Sprout className="w-6 h-6 text-radar-green" />}
              desc="Pre-visualize drought stress 2 weeks before optical signs."
            />
            <BentoCard
              title="DEFENSE"
              icon={<Shield className="w-6 h-6 text-alert-red" />}
              desc="Detect convoy movement and subterranean bunkers."
              className="border-red-900/10 hover:border-alert-red/30"
              iconColor="text-red-500"
            />
            <BentoCard
              title="SPACE"
              icon={<Satellite className="w-6 h-6 text-blue-400" />}
              desc="Ground station calibration and debris tracking."
              className="border-blue-900/10 hover:border-blue-500/30"
              iconColor="text-blue-400"
            />
            <BentoCard
              title="FINANCE"
              icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
              desc="Verify commodity yields for insurance and futures."
              className="border-purple-900/10 hover:border-purple-500/30"
              iconColor="text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* 7. SOCIAL PROOF (CASE STUDIES) */}
      <MissionReports />

      {/* 8. PRICING */}
      <Pricing />

      {/* 9. FAQ */}
      <FAQ />

      {/* 10. ABOUT / FOUNDER */}
      <Founder />

      {/* 11. FINAL CTA (WAITLIST) */}
      <Waitlist />

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-black text-center text-gray-600 font-mono text-sm">
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://linkedin.com" className="p-2 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
          </a>
          <a href="https://x.com" className="p-2 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a href="mailto:info@aerisq.com" className="p-2 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </a>
        </div>

        <div className="flex justify-center gap-8 mb-8 text-xs uppercase tracking-widest text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Legal</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Data Rights</a>
        </div>
        <p>&copy; {new Date().getFullYear()} AERISQ INTELLIGENCE. ALL RIGHTS RESERVED.</p>
        <p className="mt-2 text-[10px] opacity-50">SENTINEL-1 DATA PROVIDED BY ESA/COPERNICUS</p>
      </footer>
    </main>
  );
}

function BentoCard({ title, icon, desc, className = "", iconColor = "text-radar-green" }: any) {
  return (
    <div className={`p-8 bg-[#0A0A0A] border border-white/10 hover:bg-white/5 transition-all duration-300 group relative overflow-hidden ${className}`}>
      {/* Hover Highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <div className={`mb-6 ${iconColor} opacity-80 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 font-sans tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed font-sans">{desc}</p>
    </div>
  )
}
