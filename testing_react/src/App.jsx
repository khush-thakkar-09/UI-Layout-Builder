import React, { useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData }) {
  const headline = cmsData.heroHeadline?.content || '';
  const subheadline = cmsData.heroSubheadline?.content || '';
  const primaryCta = cmsData.primaryCta?.content || '';
  const secondaryCta = cmsData.secondaryCta?.content || '';
  const heroVisual = cmsData.heroVisual?.content || '';
  const techStack = cmsData.techStackTicker?.loop || [];

  return (
    <section className="section-1">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-headline">{headline}</h1>
          <p className="hero-subheadline">{subheadline}</p>
          <div className="cta-group">
            <a href="#projects" className="cta-primary">
              {primaryCta}
            </a>
            <a href="#contact" className="cta-secondary">
              {secondaryCta}
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <img 
            src={heroVisual} 
            alt="AI/ML Generative Art" 
            className="hero-image"
          />
        </div>
      </div>
      <div className="tech-ticker">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {techStack.map((tech, index) => (
              <div key={`${tech.field1}-${index}`} className="tech-item">
                <span className="tech-name">{tech.field1}</span>
              </div>
            ))}
            {techStack.map((tech, index) => (
              <div key={`dup-${tech.field1}-${index}`} className="tech-item">
                <span className="tech-name">{tech.field1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Project Showcase ---

function ProjectShowcase({ cmsData }) {
  const header = cmsData.showcaseHeader?.content || 'Selected Works';
  const viewAllCta = cmsData.viewAllCta?.content || 'View All Projects';
  const categories = cmsData.filterCategories?.loop || [];
  const projects = cmsData.projectGrid?.loop || [];

  const [activeCategory, setActiveCategory] = useState(categories[0]?.field1 || 'All');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Filter projects based on active category
  useMemo(() => {
    if (activeCategory === 'All' || !activeCategory) {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => {
        // Simple keyword matching for demo purposes
        const projectText = `${project.field1} ${project.field2} ${project.field3}`.toLowerCase();
        return projectText.includes(activeCategory.toLowerCase());
      }));
    }
  }, [activeCategory, projects]);

  // Generate placeholder images with dynamic colors
  const getPlaceholderImage = (index) => {
    const colors = [
      ['1e1b4b', '818cf8'], // indigo
      ['0f172a', '38bdf8'], // slate/blue
      ['111827', '34d399'], // dark/emerald
    ];
    const [bg, fg] = colors[index % colors.length];
    return `https://placehold.co/600x400/${bg}/${fg}?text=${encodeURIComponent(projects[index]?.field1 || 'Project')}`;
  };

  return (
    <section className="section-2">
      <div className="container">
        <header className="section-header">
          <h2>{header}</h2>
          <div className="filter-container">
            <button
              className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                className={`filter-pill ${activeCategory === cat.field1 ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.field1)}
              >
                {cat.field1}
              </button>
            ))}
          </div>
        </header>

        <div className="project-grid">
          {filteredProjects.map((project, idx) => (
            <div key={idx} className="project-card">
              <div className="card-image">
                <img
                  src={getPlaceholderImage(idx)}
                  alt={project.field1}
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <h3>{project.field1}</h3>
                <p className="project-excerpt">{project.field2}</p>
                <div className="tech-stack">
                  {project.field3.split(',').map((tech, tIdx) => (
                    <span key={tIdx} className="tech-badge">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                <a href="#" className="action-link">
                  <span>View Case Study</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-cta">
          <a href="#" className="ghost-button">
            {viewAllCta}
          </a>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Professional Experience ---
function ProfessionalExperience({ cmsData }) {
  const header = cmsData.experienceHeader?.content || "Engineering Milestones";
  const experienceList = cmsData.experienceList?.loop || [];

  return (
    <section className="section-3">
      <div className="section-3-header">
        <h2>{header}</h2>
        <p className="section-3-subtitle">A chronological journey of technical impact and innovation in AI/ML engineering</p>
      </div>

      <div className="section-3-timeline">
        {experienceList.map((item, index) => (
          <div key={index} className="section-3-card">
            <div className="section-3-timeline-dot" />
            <div className="section-3-card-content">
              <div className="section-3-role-meta">
                <h3 className="section-3-role-title">{item.field1}</h3>
                <span className="section-3-company">{item.field2}</span>
                <span className="section-3-date">{item.field3}</span>
              </div>

              <div className="section-3-tech-stack">
                {item.field4.split(',').map((tech, techIndex) => (
                  <span key={techIndex} className="section-3-tech-tag">
                    {tech.trim()}
                  </span>
                ))}
              </div>

              <ul className="section-3-impact-list">
                <li>{item.field5}</li>
                <li>Architected scalable ML infrastructure supporting 1M+ daily requests.</li>
                <li>Led cross-functional team in deploying production-grade models.</li>
                <li>Optimized training pipelines, reducing compute costs by 35%.</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Section 4: Contact Footer ---
function ContactFooter({ cmsData }) {
  const heading = cmsData.contactHeading?.content || '';
  const subheadline = cmsData.contactSubheadline?.content || '';
  const ctaText = cmsData.primaryCta?.content || '';
  const email = cmsData.emailDisplay?.content || '';
  const copyright = cmsData.copyrightFooter?.content || '';
  const socialLinks = cmsData.socialLinks?.loop || [];

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    // Optional: Add toast notification here
  };

  return (
    <section className="section-4">
      <div className="contact-content">
        <h1 className="contact-heading">{heading}</h1>
        <p className="contact-subheadline">{subheadline}</p>
        <a href={`mailto:${email}`} className="cta-button">
          {ctaText}
        </a>
      </div>

      <div className="social-links-container">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.field2}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <span className="social-label">{link.field1}</span>
          </a>
        ))}
      </div>

      <div className="email-section">
        <a href={`mailto:${email}`} onClick={handleCopyEmail} className="email-link">
          {email}
        </a>
      </div>

      <hr className="divider" />
      <div className="copyright-container">
        <p className="copyright-text">{copyright}</p>
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
  return <GeneratedPage cmsData={cmsDataRaw.resolved_cms} />;
}