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
import Features from '../components/Features';

export default function Home() {
  return (
    <main className="min-h-screen bg-aeris-black selection:bg-radar-green selection:text-black">
      <Navbar />

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 1.5. PUBLIC DEMO ACCESS */}
      <section id="demos" className="py-24 bg-black relative border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ACCESS <span className="text-radar-green">INTELLIGENCE LAYER</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore real-time radar analysis of critical infrastructure. No login required for public demonstrations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AGRICULTURE DEMO */}
            <a href="/mission/alpha" className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-radar-green/50 transition-all bg-white/5 aspect-video flex flex-col justify-end p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              {/* Placeholder for map image if available */}
              <div className="absolute inset-0 bg-[url('/vysocina_radar.png')] bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity duration-500 mix-blend-luminosity" />

              <div className="relative z-20">
                <div className="flex items-center gap-2 mb-2 text-radar-green">
                  <span className="w-2 h-2 rounded-full bg-radar-green animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest">Live Feed</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-radar-green transition-colors">AGRICULTURE INTELLIGENCE</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Monitor crop health, soil moisture, and harvest readiness with Sentinel-1 SAR analysis.
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-xs text-white uppercase tracking-widest border border-white/20 px-4 py-2 rounded group-hover:bg-radar-green group-hover:text-black group-hover:border-radar-green transition-all">
                  Launch Mission Alpha
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </div>
            </a>

            {/* DEFENSE / FINANCE DEMO (PENDING) */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 aspect-video flex flex-col justify-end p-8 opacity-75 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              <div className="absolute inset-0 bg-[url('/vysocina_optical.png')] bg-cover bg-center opacity-30 mix-blend-luminosity" />

              <div className="relative z-20">
                <div className="flex items-center gap-2 mb-2 text-yellow-500">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest">PENDING AUTHORIZATION</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">FINANCE & DEFENSE</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Infrastructure stability, flood detection, and strategic asset monitoring (Defense, Space, Finance).
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-xs text-gray-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded">
                  Status: Classified / In Development
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / LOGOS - Hidden for now
      <TrustLogos /> 
      */}

      {/* 3. BENEFITS (PROBLEM/SOLUTION) */}
      <Benefits />

      {/* 4. PROCESS (HOW IT WORKS) */}
      <ProcessSteps />

      {/* 5. INTERACTIVE DEMO (TRUTH SLIDER) */}
      <TruthSlider
        beforeImage="/vysocina_optical.png"
        afterImage="/vysocina_radar.png"
        beforeLabel="Optical (Sentinel-2)"
        afterLabel="AerisQ Radar (Sentinel-1)"
      />

      {/* 6. FEATURES (SECTOR INTELLIGENCE) */}
      <Features />

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


