import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---

function HeroSection({ cmsData }) {
  const techStack = cmsData.techStackTicker?.loop || [];

  // Generate random positions for the neural network nodes only once
  const nodePositions = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2
    }));
  }, []);

  return (
    <section className="section-1">
      <div className="hero-container">
        {/* Left Column: Text Content */}
        <div className="hero-text">
          <h1 data-field-id={cmsData.heroHeadline?.fieldId}>
            {cmsData.heroHeadline?.content}
          </h1>
          <p className="hero-subheadline" data-field-id={cmsData.heroSubheadline?.fieldId}>
            {cmsData.heroSubheadline?.content}
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary" data-field-id={cmsData.primaryCta?.fieldId}>
              {cmsData.primaryCta?.content}
            </button>
            <button className="btn-secondary" data-field-id={cmsData.secondaryCta?.fieldId}>
              {cmsData.secondaryCta?.content}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Visual Element */}
        <div className="hero-visual">
          <div className="neural-network-canvas">
            {nodePositions.map((node, index) => (
              <div
                key={index}
                className="node"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: `${node.size}px`,
                  height: `${node.size}px`,
                  animationDuration: `${2 / node.speed}s`
                }}
              />
            ))}
            {nodePositions.map((node, i) =>
              nodePositions.slice(i + 1).map((otherNode, j) => {
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 35) {
                  return (
                    <div
                      key={`link-${i}-${j}`}
                      className="connection-line"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${distance}%`,
                        transform: `rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`,
                        opacity: 1 - distance / 35
                      }}
                    />
                  );
                }
                return null;
              })
            )}
          </div>
        </div>
      </div>

      {/* Tech Stack Ticker */}
      <div className="tech-stack-ticker">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="tech-badge"
                data-field-id={tech.fieldId1}
              >
                {tech.field1}
              </span>
            ))}
            {/* Duplicate for infinite scroll effect */}
            {techStack.map((tech, index) => (
              <span
                key={`dup-${index}`}
                className="tech-badge"
                data-field-id={tech.fieldId1}
              >
                {tech.field1}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Project Showcase ---

function ProjectShowcase({ cmsData }) {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filterTabs = cmsData.filterTabs?.loop || [];
  const projectList = cmsData.projectList?.loop || [];
  
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projectList;
    return projectList.filter(project => 
      project.field1.toLowerCase().includes(activeFilter.toLowerCase()) ||
      project.field2.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [activeFilter, projectList]);

  return (
    <section className="section-2">
      <div className="container">
        {/* Header Section */}
        <div className="header-section">
          <h1 data-field-id={cmsData.showcaseHeadline?.fieldId}>
            {cmsData.showcaseHeadline?.content}
          </h1>
          <p className="subheadline" data-field-id={cmsData.showcaseSubheadline?.fieldId}>
            {cmsData.showcaseSubheadline?.content}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-container">
          <button 
            className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          {filterTabs.map((tab, index) => (
            <button
              key={index}
              className={`filter-btn ${activeFilter === tab.field1 ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.field1)}
              data-field-id={tab.fieldId1}
            >
              {tab.field1}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="card-image">
                <img 
                  src={`https://placehold.co/600x400/1a1a21/6366f1?text=${encodeURIComponent(project.field1)}`}
                  alt={project.field1}
                  className="project-image"
                />
                <div className="card-overlay">
                  <a href="#" className="icon-btn" aria-label="GitHub Repository">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </a>
                  <a href="#" className="icon-btn" aria-label="Live Demo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="card-content">
                <h3 data-field-id={project.fieldId1} className="project-title">
                  {project.field1}
                </h3>
                <div className="tech-stack" data-field-id={project.fieldId2}>
                  {project.field2.split(',').map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech.trim()}</span>
                  ))}
                </div>
                <p className="project-description" data-field-id={project.fieldId3}>
                  {project.field3}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="cta-section">
          <button className="view-all-btn" data-field-id={cmsData.viewAllCta?.fieldId}>
            {cmsData.viewAllCta?.content}
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Professional Experience ---
function ProfessionalExperience({ cmsData }) {
  const experienceList = cmsData.experienceList?.loop || [];

  return (
    <section className="section-3">
      <div className="container">
        <header className="section-header">
          <h2 data-field-id={cmsData.experienceHeadline?.fieldId}>
            {cmsData.experienceHeadline?.content}
          </h2>
          <p 
            className="subheadline"
            data-field-id={cmsData.experienceSubheadline?.fieldId}
          >
            {cmsData.experienceSubheadline?.content}
          </p>
        </header>

        <div className="timeline">
          <div className="timeline-spine"></div>
          
          {experienceList.map((item, index) => (
            <ExperienceCard key={index} item={item} />
          ))}
        </div>

        <div className="cta-container">
          <a 
            href="#"
            className="resume-cta"
            data-field-id={cmsData.downloadResumeCta?.fieldId}
          >
            {cmsData.downloadResumeCta?.content}
          </a>
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ item }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse metadata
  const roleMetadata = item.field1?.split('|').map(part => part.trim());
  const jobTitle = roleMetadata?.[0] || '';
  const company = roleMetadata?.[1] || '';
  const dates = roleMetadata?.[2] || '';
  
  // Parse tech stack
  const techStack = item.field2?.split(',').map(tag => tag.trim()) || [];
  
  // Parse achievements (assuming field3 contains the first achievement, and we might need more fields)
  // For this implementation, we'll treat field3 as the first achievement and assume additional achievements
  // could be in field5, field7, etc. But based on the schema, only field3 is provided.
  // We'll use a fallback to create a list with one item.
  const achievements = [item.field3].filter(Boolean);

  return (
    <div className={`experience-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-content">
        <div className="card-header">
          <div className="role-info">
            <h3 data-field-id={item.fieldId1}>{jobTitle}</h3>
            <div className="company-dates">
              <span>{company}</span>
              <span className="separator">•</span>
              <span>{dates}</span>
            </div>
          </div>
          
          <div className="tech-stack">
            {techStack.map((tech, idx) => (
              <span 
                key={idx} 
                className="tech-tag"
                data-field-id={item.fieldId2}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        <div className="achievements">
          {achievements.map((achievement, idx) => (
            <p 
              key={idx} 
              className="achievement-item"
              data-field-id={item.fieldId3}
            >
              {achievement}
            </p>
          ))}
        </div>
        
        <button 
          className="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
        >
          <span data-field-id={item.fieldId4}>
            {isExpanded ? "Hide Details" : item.field4 || "View Details"}
          </span>
          <span className={`arrow-icon ${isExpanded ? 'rotated' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="expanded-content">
          <p className="expanded-text">
            Detailed project description would appear here. This section expands to show 
            comprehensive information about the role, responsibilities, and specific 
            contributions to AI/ML projects. The content would be dynamically populated 
            from additional CMS fields when available.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Section 4: Contact Footer ---
function ContactFooter({ cmsData }) {
  return (
    <section className="section-4">
      <div className="container">
        <div className="content-wrapper">
          <h1 data-field-id={cmsData.contactHeading?.fieldId}>
            {cmsData.contactHeading?.content}
          </h1>
          <p className="subheadline" data-field-id={cmsData.contactSubheadline?.fieldId}>
            {cmsData.contactSubheadline?.content}
          </p>
          <a 
            href="mailto:contact@example.com" 
            className="cta-button"
            data-field-id={cmsData.emailCta?.fieldId}
          >
            {cmsData.emailCta?.content}
          </a>
          
          <div className="social-links">
            {cmsData.socialLinks?.loop?.map((item, index) => (
              <a 
                key={index} 
                href={item.field2} 
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span data-field-id={item.fieldId1}>{item.field1}</span>
              </a>
            ))}
          </div>
        </div>
        
        <div className="copyright" data-field-id={cmsData.copyrightText?.fieldId}>
          {cmsData.copyrightText?.content}
        </div>
      </div>
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  return (
    <div className="generated-page-container">
      <HeroSection cmsData={cmsData.heroSection} />
      <ProjectShowcase cmsData={cmsData.projectShowcase} />
      <ProfessionalExperience cmsData={cmsData.professionalExperience} />
      <ContactFooter cmsData={cmsData.contactFooter} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "a31aa36c-79ee-4fc2-b0a0-fb6e08aaeaaf";

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