import { useState } from 'react'
import { C, F, S } from '../utils/styles.js'

export default function Landing({ onGetStarted }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: C.bg,
      overflowY: 'auto',
      color: C.text,
      fontFamily: F.sans,
      position: 'relative',
    }}>
      
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: '500px',
        background: `radial-gradient(circle, ${C.accent}05 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: `1px solid ${C.border}`,
        background: `${C.bg}dd`,
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: F.mono,
            fontSize: 20,
            fontWeight: 800,
            color: C.accent,
            letterSpacing: '1px',
          }}>⊙ JobHunt.ai</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#extension" style={{ color: C.textDim, textDecoration: 'none', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.5px' }}>EXTENSION</a>
          <a href="#dashboard" style={{ color: C.textDim, textDecoration: 'none', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.5px' }}>DASHBOARD</a>
          <a href="#ai-engine" style={{ color: C.textDim, textDecoration: 'none', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.5px' }}>AI OUTREACH</a>
          <button
            onClick={onGetStarted}
            style={{
              ...S.btn.ghost,
              padding: '6px 14px',
              fontSize: 11,
              borderColor: C.accent,
              color: C.accent,
              background: `${C.accent}06`,
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = `${C.accent}12`
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = `${C.accent}06`
            }}
          >
            SIGN IN
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '90px 40px 80px',
        textAlign: 'center',
        maxWidth: '980px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        
        {/* Monospace Badge */}
        <span style={{
          fontFamily: F.mono,
          fontSize: 9,
          fontWeight: 700,
          color: C.accent,
          background: `${C.accent}12`,
          border: `1px solid ${C.accent}30`,
          padding: '4px 12px',
          borderRadius: 99,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          🚀 OPEN-SOURCE OUTREACH TRACKER
        </span>

        {/* Headline */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: '1.2',
          margin: 0,
          letterSpacing: '-1px',
        }}>
          Scale your cold outreach and track your <span style={{
            background: `linear-gradient(to right, ${C.accent}, #00b3ff)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>job pipeline</span> in one unified app.
        </h1>

        {/* Subhead */}
        <p style={{
          fontSize: '16px',
          color: C.textDim,
          maxWidth: '640px',
          lineHeight: '1.6',
          margin: '10px 0 20px',
        }}>
          Combine the agility of a browser extension scraper with the analytics power of a desktop dashboard. Fully open-source and customizable.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={onGetStarted}
            style={{
              ...S.btn.primary,
              width: 'auto',
              padding: '14px 28px',
              fontSize: 13,
              boxShadow: `0 8px 30px ${C.accent}20`,
            }}
          >
            Launch Web Application
          </button>
          
          <a
            href="#extension"
            style={{
              ...S.btn.ghost,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '13px 26px',
              fontSize: 12,
            }}
            onMouseOver={e => { e.currentTarget.style.color = C.text }}
            onMouseOut={e => { e.currentTarget.style.color = C.textDim }}
          >
            Explore Features ↓
          </a>
        </div>
      </section>

      {/* FEATURE SECTION 1: CHROME EXTENSION SUITE */}
      <section id="extension" style={{
        padding: '80px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: `1px solid ${C.border}`,
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: '1px' }}>
            BROWSER INTEGRATION
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            The Chrome Extension Helper
          </h2>
          <p style={{ fontSize: '14px', color: C.textDim, lineHeight: '1.7', margin: 0 }}>
            Scrape, parse, and collect lead data directly on the web. Our native Chrome extension injects seamlessly into LinkedIn, allowing you to bypass manual data entry entirely.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>🖱️</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>One-Click Profile Scraper</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Extracts name, title, current company, avatar, and resume profile links instantly from any active LinkedIn profile page.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📥</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Popup Contact List & Filters</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Search, filter pipeline stages, download templates, and export sheets straight from the extension popup layout.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Mock of Extension */}
        <div style={{
          ...S.card,
          width: '320px',
          justifySelf: 'center',
          padding: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          background: C.surface,
          borderColor: C.border,
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, fontWeight: 700 }}>TRACKER</span>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted }}>41 Contacts</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <button style={{ ...S.btn.ghost, fontSize: 8, padding: '4px 6px', flex: 1 }}>TEMPLATE</button>
            <button style={{ ...S.btn.ghost, fontSize: 8, padding: '4px 6px', flex: 1 }}>EXPORT</button>
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Naman Khetawat</span>
              <span style={{ fontSize: 8, color: C.yellow, fontFamily: F.mono }}>MID</span>
            </div>
            <span style={{ fontSize: 9, color: C.textDim }}>Founder · Balistro</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: C.accent, fontFamily: F.mono, background: `${C.accent}12`, padding: '2px 6px', borderRadius: 4 }}>Discovered</span>
              <span style={{ fontSize: 9, color: C.muted }}>✉️ email</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 2: WEB DASHBOARD WORKSPACE */}
      <section id="dashboard" style={{
        padding: '80px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: `1px solid ${C.border}`,
        display: 'grid',
        gridTemplateColumns: '0.9fr 1.1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        {/* Visual Mock of Dashboard */}
        <div style={{
          ...S.card,
          width: '100%',
          maxWidth: '440px',
          padding: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          background: C.surface,
          borderColor: C.border,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted }}>WORKSPACE DASHBOARD</span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
              <p style={{ margin: 0, fontSize: 8, color: C.muted, fontFamily: F.mono }}>OUTREACH PIPELINE</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: C.accent }}>41 Total</h3>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
              <p style={{ margin: 0, fontSize: 8, color: C.muted, fontFamily: F.mono }}>RESPONSE RATE</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: C.blue }}>24% Replies</h3>
            </div>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 8, color: C.muted }}>STAGE SPLIT</span>
            <div style={{ height: 6, background: C.border2, borderRadius: 3, display: 'flex', overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: '50%', background: C.blue }} />
              <div style={{ width: '30%', background: C.yellow }} />
              <div style={{ width: '20%', background: C.accent }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: '1px' }}>
            DESKTOP WORKSPACE
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            The Web Dashboard Workspace
          </h2>
          <p style={{ fontSize: '14px', color: C.textDim, lineHeight: '1.7', margin: 0 }}>
            Analyze pipeline metrics and manage bulk data in a widescreen desktop application. Perfectly synced with the Chrome Extension database.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Pipeline Analytics & SVG Charts</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Beautiful dynamic visual metrics representing conversion progress, priority tags, and response logs.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Excel Import, Export, & Templates</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Drag and drop Excel files to import contacts in bulk, download spreadsheet templates, or back up your Mongo collection.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>✏️</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Advanced Contact CRUD Console</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Edit full profile backgrounds, modify job titles, add notes, and change status levels directly in modal overlays.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 3: AI PERSONALIZATION ENGINE & API BYPASS */}
      <section id="ai-engine" style={{
        padding: '80px 40px 100px',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: `1px solid ${C.border}`,
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: '1px' }}>
            AI-POWERED COPILOT
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            Contextual AI Outreach Engine
          </h2>
          <p style={{ fontSize: '14px', color: C.textDim, lineHeight: '1.7', margin: 0 }}>
            Generate highly personalized cold emails, LinkedIn connection requests, or follow-up notes using the target lead\'s title, organization, and your own personal profile summary.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Custom Outreach Templates</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Choose between LinkedIn DM notes, connection requests, or full-length cold email formats instantly.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18 }}>🔑</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Self-Hosted Keys for Unlimited Usage</h4>
                <p style={{ fontSize: 12, color: C.textDim, margin: 0, lineHeight: 1.5 }}>Add your own Gemini or Cohere API keys in Profile Settings to unlock unlimited generation actions, bypassing free-tier caps.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Mock of AI Generator */}
        <div style={{
          ...S.card,
          width: '100%',
          maxWidth: '380px',
          padding: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          background: C.surface,
          borderColor: C.border,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted }}>AI COMPOSER</span>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 10, color: C.accent, fontFamily: F.mono }}>
            Selected: Naman Khetawat (Founder)
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, fontSize: 10, lineHeight: 1.5, color: C.textDim }}>
            "Hi Naman, noticed your work at Balistro. As a developer with projects in your space, I would love to connect..."
          </div>
          <button style={{ ...S.btn.primary, fontSize: 10, padding: '6px 12px' }}>Copy Message</button>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '40px 20px',
        textAlign: 'center',
        background: C.surface,
      }}>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, margin: 0 }}>
          ⊙ JOBHUNT.AI — RELEASED UNDER MIT OPEN SOURCE LICENSE. BUILD AND RUN LOCALLY.
        </p>
      </footer>

    </div>
  )
}
