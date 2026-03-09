'use client';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import ProcessSteps from '../components/ProcessSteps';
import TruthSlider from '../components/TruthSlider';
import MissionReports from '../components/MissionReports';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Founder from '../components/Founder';
import Waitlist from '../components/Waitlist';
import Features from '../components/Features';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <Hero />

      {/* LIVE DEMOS */}
      <section
        id="demos"
        style={{
          padding: '120px 0',
          background: '#060606',
          borderTop: '1px solid #1a1a1a',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <div className="section-label">Live Demonstrations</div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '80px',
              gap: '40px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#fff',
                margin: 0,
              }}
            >
              See it in action.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#444',
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              No login required.<br />Public access.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0',
              border: '1px solid #1a1a1a',
            }}
          >
            {/* Live Demo */}
            <motion.a
              href="/mission/alpha"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                display: 'block',
                position: 'relative',
                aspectRatio: '16/9',
                overflow: 'hidden',
                borderRight: '1px solid #1a1a1a',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: "url('/vysocina_radar.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(70%) contrast(1.3)',
                  transition: 'transform 0.6s ease, filter 0.4s ease',
                }}
                className="group-hover:scale-105"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                }}
              />
              <div style={{ position: 'absolute', inset: 0, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#cc0000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#cc0000',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    Live
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#555',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '3px 10px',
                    }}
                  >
                    DEMO-001
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      color: '#fff',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Agriculture Intelligence
                  </h3>
                  <p
                    style={{
                      color: '#888',
                      fontSize: '13px',
                      margin: '0 0 20px 0',
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    Crop health, soil moisture, and harvest readiness via Sentinel-1 SAR.
                  </p>
                  <span className="btn-primary" style={{ display: 'inline-flex' }}>
                    Open Demo ↗
                  </span>
                </div>
              </div>
            </motion.a>

            {/* Coming Soon */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              style={{
                position: 'relative',
                aspectRatio: '16/9',
                overflow: 'hidden',
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: "url('/vysocina_optical.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(100%) contrast(0.8)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 100%)',
                }}
              />
              <div style={{ position: 'absolute', inset: 0, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  — Restricted
                </span>
                <div>
                  <h3
                    style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      color: '#fff',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Finance &amp; Defense
                  </h3>
                  <p style={{ color: '#555', fontSize: '13px', margin: '0 0 20px 0', fontWeight: 300 }}>
                    In development — contact for early access.
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#444',
                      border: '1px solid #333',
                      padding: '10px 20px',
                      display: 'inline-flex',
                    }}
                  >
                    Coming Q3 2026
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <Benefits />

      {/* PROCESS */}
      <ProcessSteps />

      {/* TRUTH SLIDER */}
      <TruthSlider
        beforeImage="/vysocina_optical.png"
        afterImage="/vysocina_radar.png"
        beforeLabel="Optical (Sentinel-2)"
        afterLabel="AerisQ SAR (Sentinel-1)"
      />

      {/* FEATURES */}
      <Features />

      {/* CASE STUDIES */}
      <MissionReports />

      {/* PRICING */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* TEAM */}
      <Founder />

      {/* WAITLIST */}
      <Waitlist />

      {/* FOOTER */}
      <footer
        style={{
          padding: '40px',
          borderTop: '1px solid #1a1a1a',
          background: '#000',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#444',
            }}
          >
            © {new Date().getFullYear()} AerisQ — SAR Intelligence
          </span>

          <div style={{ display: 'flex', gap: '32px' }}>
            {['Legal', 'Privacy', 'Data Rights'].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#444',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#444')}
              >
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { href: 'https://linkedin.com', label: 'LI' },
              { href: 'https://x.com', label: 'X' },
              { href: 'mailto:info@aerisq.com', label: '✉' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  color: '#444',
                  textDecoration: 'none',
                  border: '1px solid #1a1a1a',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = '#fff';
                  el.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = '#1a1a1a';
                  el.style.color = '#444';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <span
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#333',
            }}
          >
            Sentinel-1 data: ESA/Copernicus
          </span>
        </div>
      </footer>
    </main>
  );
}
