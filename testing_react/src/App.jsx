import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Navigation & Hero Section ---

function NavigationHeroSection({ cmsData }) {
  const navLinks = cmsData.navLinks?.loop || [];
  const logo = cmsData.navLogo?.content || '';
  const heroHeading = cmsData.heroHeading?.content || '';
  const heroSubtitle = cmsData.heroSubtitle?.content || '';
  const heroVisual = cmsData.heroVisual?.content || '';

  const randomValues = useMemo(() => Array.from({ length: 3 }, () => Math.random()), []);

  return (
    <section className="section-1">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo" data-field-id={cmsData.navLogo?.fieldId}>
            {logo}
          </a>
          <div className="nav-links">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.field2}
                className="nav-link"
                data-field-id={link.fieldId1}
              >
                {link.field1}
              </a>
            ))}
          </div>
          <div className="auth-buttons">
            <button className="auth-button ghost" data-field-id="log-in-field-id">
              Log In
            </button>
            <button className="auth-button primary" data-field-id="get-started-field-id">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-heading" data-field-id={cmsData.heroHeading?.fieldId}>
            {heroHeading}
          </h1>
          <p className="hero-subtitle" data-field-id={cmsData.heroSubtitle?.fieldId}>
            {heroSubtitle}
          </p>
          <div className="cta-group">
            <button className="cta-button primary" data-field-id="primary-cta-field-id">
              Start Free Trial
            </button>
            <button className="cta-button secondary" data-field-id="secondary-cta-field-id">
              <svg className="play-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
              </svg>
              Watch Demo
            </button>
          </div>
          <div className="social-proof" data-field-id="social-proof-field-id">
            <span className="badge-icon">✓</span>
            <span>Trusted by 500+ engineering teams</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src={heroVisual}
            alt="Product dashboard screenshot"
            className="hero-image"
            data-field-id={cmsData.heroVisual?.fieldId}
          />
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Feature Highlights Grid ---
function FeatureHighlightsGrid({ cmsData }) {
  const headerContent = cmsData.featureSectionHeader?.content || '';
  const [title, subtitle] = headerContent.split('. ').map(s => s.trim());
  const features = cmsData.featureGrid?.loop || [];

  return (
    <section className="section-2">
      <div className="container">
        <div className="header-wrapper">
          <h2 data-field-id={cmsData.featureSectionHeader?.fieldId}>{title}</h2>
          <h3 className="subtitle" data-field-id={`${cmsData.featureSectionHeader?.fieldId}-sub`}>{subtitle}</h3>
        </div>
        
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="icon-container">
                <img 
                  src={`https://placehold.co/64x64/4f46e5/ffffff?text=${index + 1}`} 
                  alt={feature.field2 || 'Feature icon'}
                  className="feature-icon"
                />
              </div>
              <h4 className="feature-title" data-field-id={feature.fieldId2}>{feature.field2}</h4>
              <p className="feature-description" data-field-id={feature.fieldId3}>{feature.field3}</p>
              <a href="#" className="learn-more-link">Learn more →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Pricing & Social Proof Section ---
function PricingSocialProofSection({ cmsData }) {
  const pricingTiers = cmsData.pricingTiers?.loop || [];
  const testimonials = cmsData.testimonialList?.loop || [];

  return (
    <section className="section-3">
      {/* Header Section */}
      <div className="section-3-header">
        <h2 data-field-id={cmsData.pricingHeader?.fieldId}>{cmsData.pricingHeader?.content}</h2>
        <div className="billing-toggle">
          <span className="billing-label">Monthly</span>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
          <span className="billing-label">Yearly <span className="discount-badge">-20%</span></span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="pricing-grid">
        {pricingTiers.map((tier, index) => {
          const isRecommended = tier.field1 === "Pro";
          return (
            <div 
              key={index} 
              className={`pricing-card ${isRecommended ? 'recommended' : ''}`}
            >
              <h3 data-field-id={tier.fieldId1}>{tier.field1}</h3>
              <div className="price" data-field-id={tier.fieldId2}>{tier.field2}</div>
              <ul className="feature-list">
                {tier.field3.split(',').map((feature, idx) => (
                  <li key={idx} data-field-id={tier.fieldId3}>
                    <span className="checkmark">✓</span>
                    {feature.trim()}
                  </li>
                ))}
              </ul>
              <button className={`cta-button ${isRecommended ? 'primary' : 'secondary'}`}>
                Start Free Trial
              </button>
            </div>
          );
        })}
      </div>

      {/* Social Proof Bar */}
      <div className="social-proof">
        <p className="trust-header">Trusted by 500+ engineering teams</p>
        <div className="logo-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="logo-placeholder">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" rx="4" fill="#e5e7eb" />
                <text x="60" y="24" textAnchor="middle" fill="#6b7280" fontSize="14" fontFamily="sans-serif">
                  Company {i}
                </text>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials">
        <h3 className="testimonials-heading">What engineering leaders say</h3>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="quote-text" data-field-id={testimonial.fieldId1}>{testimonial.field1}</p>
              <div className="author-profile">
                <div className="avatar-placeholder">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="20" fill="#e5e7eb" />
                    <circle cx="24" cy="18" r="6" fill="#d1d5db" />
                    <path d="M10 40C10 34.4772 14.4772 30 20 30H28C33.5228 30 38 34.4772 38 40" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="author-info">
                  <span className="author-name" data-field-id={testimonial.fieldId2}>{testimonial.field2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Footer ---
function Footer({ cmsData }) {
  const { brandIdentity, navigationGroups, newsletterSignup, socialLinks, copyrightLegal } = cmsData;

  return (
    <section className="section-4">
      <div className="footer-container">
        {/* Brand Identity & Social Links Column */}
        <div className="footer-col brand-col">
          <h3 className="brand-title">RemoteFlow</h3>
          <p className="brand-mission" data-field-id={brandIdentity?.fieldId}>
            {brandIdentity?.content}
          </p>
          
          <div className="social-links">
            {socialLinks?.loop?.map((item, idx) => (
              <a 
                key={idx} 
                href={item.field2} 
                className="social-link"
                aria-label={item.field1}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  {item.field1 === 'GitHub' && (
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  )}
                  {item.field1 === 'LinkedIn' && (
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  )}
                  {item.field1 === 'Twitter' && (
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  )}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationGroups?.loop?.map((group, idx) => (
          <div className="footer-col nav-col" key={idx}>
            <h4 className="nav-heading" data-field-id={group.fieldId1}>{group.field1}</h4>
            <ul className="nav-list">
              {group.field2.split(',').map((link, linkIdx) => (
                <li key={linkIdx} className="nav-item">
                  <a href="#" className="nav-link">{link.trim()}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Signup */}
        <div className="footer-col newsletter-col">
          <h4 className="newsletter-heading">Stay Updated</h4>
          <p className="newsletter-desc" data-field-id={newsletterSignup?.fieldId}>
            {newsletterSignup?.content}
          </p>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Copyright & Legal */}
      <div className="footer-bottom">
        <hr className="footer-divider" />
        <p className="copyright" data-field-id={copyrightLegal?.fieldId}>
          {copyrightLegal?.content}
        </p>
      </div>
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  return (
    <div className="generated-page-container">
      <NavigationHeroSection cmsData={cmsData.navigationHeroSection} />
      <FeatureHighlightsGrid cmsData={cmsData.featureHighlightsGrid} />
      <PricingSocialProofSection cmsData={cmsData.pricingSocialProofSection} />
      <Footer cmsData={cmsData.footer} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "c5949aed-2d12-462a-ac41-4a58a2c1634f";

  useEffect(() => {
    fetch(`http://localhost:5001/api/cms/${projectId}`)
      .then(res => {
        if (!res.ok) throw new Error("Server not running or project not found");
        return res.json();
      })
      .then(data => {
        if (data.resolved_cms) {
          setCmsData(data.resolved_cms);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using local cms_data.json fallback:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleDblClick = (e) => {
      if (!editMode) return;
      const fieldId = e.target.getAttribute('data-field-id');
      if (fieldId) {
        e.target.contentEditable = 'true';
        e.target.focus();
      }
    };

    const handleBlur = (e) => {
      const fieldId = e.target.getAttribute('data-field-id');
      if (fieldId) {
        const newText = e.target.innerText.trim();
        setPendingChanges(prev => ({ ...prev, [fieldId]: newText }));
        setHasChanges(true);
      }
    };

    document.addEventListener('dblclick', handleDblClick);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('dblclick', handleDblClick);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [editMode]);

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/cms/${projectId}`);
      if (!res.ok) throw new Error("Failed to contact server for saving");
      const data = await res.json();
      const records = data.db_records;

      let updatedCount = 0;
      for (const record of records) {
        let sectionUpdated = false;
        
        for (const elem of record.elements) {
          if (pendingChanges[elem.fieldId] !== undefined) {
            elem.content = pendingChanges[elem.fieldId];
            sectionUpdated = true;
            updatedCount++;
          }
          if (elem.loop && Array.isArray(elem.loop)) {
            for (const item of elem.loop) {
              for (let i = 1; i <= 10; i++) {
                const fId = item[`fieldId${i}`];
                if (fId && pendingChanges[fId] !== undefined) {
                  item[`field${i}`] = pendingChanges[fId];
                  sectionUpdated = true;
                  updatedCount++;
                }
              }
            }
          }
        }

        if (sectionUpdated) {
          const sectionId = record.metadata.sectionId;
          const updateRes = await fetch(`http://localhost:5001/api/cms/${projectId}/section/${sectionId}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elements: record.elements })
          });
          if (!updateRes.ok) throw new Error(`Failed to update section ${sectionId}`);
        }
      }

      alert(`Successfully saved ${updatedCount} changes to MongoDB!`);
      setHasChanges(false);
      setPendingChanges({});
      
      const refreshRes = await fetch(`http://localhost:5001/api/cms/${projectId}`);
      const refreshData = await refreshRes.json();
      setCmsData(refreshData.resolved_cms);
    } catch (err) {
      console.error(err);
      alert("Error saving changes: " + err.message);
    }
  };

  return (
    <div className={`app-wrapper ${editMode ? 'edit-mode-active' : ''}`}>
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        background: '#1e293b',
        border: '1px solid #38bdf8',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 'bold' }}>
          {editMode ? 'Edit Mode Active (Double Click Text to Edit)' : 'Preview Mode'}
        </span>
        <button 
          onClick={() => setEditMode(!editMode)}
          style={{
            background: editMode ? '#ef4444' : '#38bdf8',
            color: '#0f172a',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
        >
          {editMode ? 'Disable Edit' : 'Enable Edit'}
        </button>
        {hasChanges && (
          <button 
            onClick={handleSave}
            style={{
              background: '#22c55e',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            Save to MongoDB
          </button>
        )}
      </div>

      <style>{`
        .edit-mode-active [data-field-id] {
          outline: 1px dashed #38bdf8 !important;
          cursor: text !important;
          position: relative !important;
          z-index: 10000 !important;
        }
        .edit-mode-active [data-field-id]:hover {
          background: rgba(56, 189, 248, 0.1) !important;
        }
        .edit-mode-active [data-field-id]:focus {
          outline: 2px solid #38bdf8 !important;
          background: rgba(56, 189, 248, 0.15) !important;
        }
      `}</style>

      <GeneratedPage cmsData={cmsData} />
    </div>
  );
}