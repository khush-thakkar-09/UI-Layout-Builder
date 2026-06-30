import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData }) {
  const { heroHeadline, heroSubheadline, primaryCta, secondaryCta, dynamicVisual, techStackBadges } = cmsData;

  return (
    <section className="section-1">
      <div className="container">
        <div className="content-wrapper">
          <div className="text-section">
            <h1 data-field-id={heroHeadline?.fieldId}>{heroHeadline?.content}</h1>
            <p className="subheadline" data-field-id={heroSubheadline?.fieldId}>{heroSubheadline?.content}</p>
            
            <div className="cta-group">
              <button className="btn-primary" data-field-id={primaryCta?.fieldId}>
                {primaryCta?.content}
              </button>
              <button className="btn-secondary" data-field-id={secondaryCta?.fieldId}>
                {secondaryCta?.content}
              </button>
            </div>

            <div className="tech-badges">
              {techStackBadges?.loop?.map((badge) => (
                <div key={badge.fieldId1} className="badge">
                  <img 
                    src={`https://placehold.co/24x24/1a1a2e/00d4ff?text=${badge.field1.charAt(0)}`} 
                    alt={`${badge.field1} icon`}
                    className="badge-icon"
                  />
                  <span data-field-id={badge.fieldId1}>{badge.field1}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="visual-section">
            <div className="visual-container">
              <img 
                src={`https://placehold.co/600x600/1a1a2e/00d4ff?text=${dynamicVisual?.content}`} 
                alt="Neural Network Animation"
                className="dynamic-visual"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Project Showcase ---

function ProjectShowcase({ cmsData }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState(cmsData.projectList?.loop || []);

  const filters = useMemo(() => {
    const allFilters = ['All', ...(cmsData.projectFilters?.loop?.map(f => f.field1) || [])];
    return allFilters;
  }, [cmsData]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredProjects(cmsData.projectList?.loop || []);
    } else {
      setFilteredProjects(
        cmsData.projectList?.loop?.filter(project => 
          project.field3?.toLowerCase().includes(filter.toLowerCase()) ||
          project.field2?.toLowerCase().includes(filter.toLowerCase())
        ) || []
      );
    }
  };

  return (
    <section className="section-2">
      <div className="container">
        {/* Header */}
        <header className="showcase-header">
          <h1 data-field-id={cmsData.showcaseHeader?.fieldId}>{cmsData.showcaseHeader?.content}</h1>
          <p className="showcase-description">
            Demonstrating technical proficiency through tangible AI/ML implementations
          </p>
        </header>

        {/* Filter Toggles */}
        <div className="filter-container">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterChange(filter)}
              data-field-id={index === 0 ? null : cmsData.projectFilters?.loop?.[index - 1]?.fieldId1}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="card-image">
                <img 
                  src={`https://placehold.co/600x400/1a1a2e/e94560?text=${encodeURIComponent(project.field1)}`}
                  alt={project.field1}
                  className="project-thumb"
                />
              </div>
              
              <div className="card-content">
                <h3 data-field-id={project.fieldId1}>{project.field1}</h3>
                
                <div className="tech-tags">
                  {project.field3?.split(',').map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="tech-tag"
                      data-field-id={project.fieldId3}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                
                <p className="project-description" data-field-id={project.fieldId2}>
                  {project.field2}
                </p>
                
                <div className="action-links">
                  <button className="btn case-study-btn">
                    View Case Study
                  </button>
                  <button className="btn github-btn">
                    GitHub Repo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Professional Biography ---

function ProfessionalBiography({ cmsData }) {
  const skillTags = cmsData.skillTagCloud?.loop || [];
  const quickFacts = cmsData.quickFactsGrid?.loop || [];
  
  const randomGradient = useMemo(() => 
    `linear-gradient(135deg, rgba(0, 200, 255, 0.08), rgba(138, 43, 226, 0.08))`, 
  []);

  return (
    <section className="section-3" style={{ background: randomGradient }}>
      <div className="container">
        <div className="biography-grid">
          {/* Left Column: Profile Image */}
          <div className="profile-column">
            <div className="profile-image-wrapper">
              <img 
                src={cmsData.profileImage?.content || "https://placehold.co/400x400/1a1a2e/00c8ff"} 
                alt="Professional Portrait" 
                className="profile-image"
              />
              <div className="profile-glow" />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="content-column">
            <h1 data-field-id={cmsData.bioHeading?.fieldId} className="biography-heading">
              {cmsData.bioHeading?.content}
            </h1>
            
            <div 
              className="biography-body" 
              dangerouslySetInnerHTML={{ 
                __html: cmsData.bioBodyText?.content?.replace(/\n/g, '<br />') || '' 
              }}
              data-field-id={cmsData.bioBodyText?.fieldId}
            />
            
            {/* Skill Tag Cloud */}
            <div className="skill-tag-cloud">
              {skillTags.map((tag, index) => (
                <span 
                  key={index} 
                  className="skill-tag"
                  data-field-id={tag.fieldId1}
                >
                  {tag.field1}
                </span>
              ))}
            </div>
            
            {/* Quick Facts Grid */}
            <div className="quick-facts-grid">
              {quickFacts.map((fact, index) => (
                <div key={index} className="quick-fact-card">
                  <div className="fact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="fact-content">
                    <span className="fact-value" data-field-id={fact.fieldId1}>{fact.field1}</span>
                    <span className="fact-label" data-field-id={fact.fieldId2}>{fact.field2}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Resume CTA */}
            <div className="resume-cta-container">
              <a 
                href="#" 
                className="resume-button"
                data-field-id={cmsData.resumeCta?.fieldId}
              >
                {cmsData.resumeCta?.content}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Contact Section ---

function ContactSection({ cmsData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const socialLinks = useMemo(() => cmsData.socialLinks?.loop || [], [cmsData]);
  const toastMessage = useMemo(() => cmsData.statusToast?.content || 'Message sent successfully!', [cmsData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setStatus(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section className="section-4">
      {/* Background particles container */}
      <div className="particles-container">
        <div className="particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ top: '60%', left: '80%', animationDelay: '1.5s' }}></div>
        <div className="particle" style={{ top: '30%', left: '70%', animationDelay: '3s' }}></div>
        <div className="particle" style={{ top: '80%', left: '20%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ top: '40%', left: '40%', animationDelay: '0.5s' }}></div>
      </div>

      <div className="contact-container">
        {/* Left Column */}
        <div className="contact-left">
          <h1 data-field-id={cmsData.contactHeader?.fieldId}>{cmsData.contactHeader?.content}</h1>
          <p className="subheadline" data-field-id={cmsData.contactSubheadline?.fieldId}>
            {cmsData.contactSubheadline?.content}
          </p>
          
          <div className="social-links">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.field2}
                target={link.field2.startsWith('http') ? '_blank' : '_self'}
                rel={link.field2.startsWith('http') ? 'noopener noreferrer' : ''}
                className="social-link"
                aria-label={link.field1}
              >
                <span className="social-icon">
                  {link.field1 === 'LinkedIn' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {link.field1 === 'GitHub' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  {link.field1 === 'Email' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  )}
                </span>
                <span className="social-label">{link.field1}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="contact-right">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Your name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`form-input ${errors.subject ? 'error' : ''}`}
                placeholder="Project inquiry"
              />
              {errors.subject && <span className="error-text">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`form-input ${errors.message ? 'error' : ''}`}
                placeholder="Tell me about your project..."
                rows="5"
              />
              {errors.message && <span className="error-text">{errors.message}</span>}
            </div>

            <button 
              type="submit" 
              className={`submit-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Status Toast */}
      {status === 'success' && (
        <div className="toast success">
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  return (
    <div className="generated-page-container">
      <HeroSection cmsData={cmsData.heroSection} />
      <ProjectShowcase cmsData={cmsData.projectShowcase} />
      <ProfessionalBiography cmsData={cmsData.professionalBiography} />
      <ContactSection cmsData={cmsData.contactSection} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "18a9caed-bbdb-4c7e-ac5f-fe80bccb333e";

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
          {editMode ? '✍️ Edit Mode Active (Double Click Text to Edit)' : '👁️ Preview Mode'}
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