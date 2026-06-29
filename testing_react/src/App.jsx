import React, { useState, useMemo } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData }) {
  const headline = cmsData.heroHeadline?.content || '';
  const subheadline = cmsData.heroSubheadline?.content || '';
  const primaryCta = cmsData.primaryCta?.content || '';
  const secondaryCta = cmsData.secondaryCta?.content || '';
  const techStack = cmsData.techStackMarquee?.loop || [];

  // Stable random positions — recalculated only once per mount
  const particles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${4 + Math.random() * 4}s`,
    })), []
  );
  const connections = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      transform: `rotate(${Math.random() * 360}deg)`,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      width: `${Math.random() * 100 + 50}px`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${3 + Math.random() * 3}s`,
    })), []
  );

  return (
    <section className="section-1">
      <div className="hero-container">
        {/* Left Content Area */}
        <div className="hero-content">
          <h1 className="hero-headline">{headline}</h1>
          <p className="hero-subheadline">{subheadline}</p>
          <div className="cta-group">
            <button className="btn-primary">{primaryCta}</button>
            <button className="btn-secondary">{secondaryCta}</button>
          </div>
        </div>

        {/* Right Interactive Visual Area */}
        <div className="hero-visual">
          <div className="neural-network">
            {/* Simulated canvas with CSS-only particles */}
            <div className="particles-container">
              {particles.map((style, i) => (
                <div key={i} className="particle" style={style} />
              ))}
            </div>
            <div className="connections">
              {connections.map((style, i) => (
                <div key={i} className="connection-line" style={style} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee */}
      <div className="tech-marquee">
        <div className="marquee-track">
          {[...techStack, ...techStack].map((tech, index) => (
            <span key={index} className="tech-tag">
              {tech.field1}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Experience & Skills Showcase ---
function ExperienceSkillsShowcase({ cmsData }) {
  const header = cmsData.experienceSectionHeader;
  const experienceList = cmsData.experienceList;
  const skillBadgeList = cmsData.skillBadgeList;
  const skillFilterBar = cmsData.skillFilterBar;

  const categories = skillFilterBar?.content?.split(',').map(cat => cat.trim()) || [];
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');

  const filteredSkills = activeCategory === 'All'
    ? skillBadgeList?.loop || []
    : skillBadgeList?.loop.filter(skill => skill.field2 === activeCategory) || [];

  return (
    <section className="section-2">
      <div className="section-2-container">
        {/* Header */}
        <div className="section-2-header">
          <h2 className="section-2-headline">{header?.content}</h2>
        </div>

        {/* Main Grid */}
        <div className="section-2-grid">
          {/* Experience Timeline (Left Column - 60%) */}
          <div className="section-2-experience">
            <h3 className="section-2-subtitle">Experience Timeline</h3>
            <div className="section-2-timeline">
              {experienceList?.loop.map((item, index) => (
                <div key={index} className="section-2-card">
                  <div className="section-2-card-header">
                    <h4 className="section-2-role">{item.field1}</h4>
                    <span className="section-2-date">{item.field2}</span>
                  </div>
                  <ul className="section-2-achievements">
                    <li>{item.field3}</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Sidebar (Right Column - 40%) */}
          <div className="section-2-skills">
            <div className="section-2-skills-header">
              <h3 className="section-2-subtitle">Technical Skills</h3>
              <div className="section-2-filter-bar">
                <button
                  className={`section-2-filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('All')}
                >
                  All
                </button>
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`section-2-filter-btn ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-2-skills-grid">
              {filteredSkills.map((skill, index) => (
                <div key={index} className="section-2-skill-badge">
                  <span className="section-2-skill-name">{skill.field1}</span>
                  <span className="section-2-skill-category">{skill.field2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Projects Grid ---
function ProjectsGrid({ cmsData }) {
  const header = cmsData.projectsSectionHeader;
  const filterTabs = cmsData.projectFilterTabs;
  const projectList = cmsData.projectList;
  const [activeTab, setActiveTab] = useState('All');

  return (
    <section className="section-3">
      <div className="section-3__container">
        <header className="section-3__header">
          <h2 className="section-3__title">{header.content}</h2>
          <p className="section-3__subtitle">Showcasing high-impact AI/ML engineering solutions</p>

          <div className="section-3__filters">
            <button
              className={`section-3__filter-btn ${activeTab === 'All' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            {filterTabs.loop.map((tab, index) => (
              <button
                key={index}
                className={`section-3__filter-btn ${activeTab === tab.field1 ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveTab(tab.field1)}
              >
                {tab.field1}
              </button>
            ))}
          </div>
        </header>

        <div className="section-3__grid">
          {projectList.loop.map((project, index) => (
            <div key={index} className="section-3__card">
              <div className="section-3__card-image">
                <img
                  src={`https://placehold.co/600x400/1a1a1a/00ffff?text=${encodeURIComponent(project.field1)}`}
                  alt={project.field1}
                  className="section-3__card-img"
                />
              </div>

              <div className="section-3__card-content">
                <h3 className="section-3__card-title">{project.field1}</h3>
                <p className="section-3__card-desc">{project.field2}</p>

                <div className="section-3__card-tech">
                  <span className="section-3__tech-tag">PyTorch</span>
                  <span className="section-3__tech-tag">FastAPI</span>
                  <span className="section-3__tech-tag">AWS</span>
                </div>

                <a
                  href={project.field3}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="section-3__card-link"
                >
                  <span className="section-3__link-text">View Project</span>
                  <svg
                    className="section-3__link-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Contact & Footer ---
function ContactFooter({ cmsData }) {
  const contactHeading = cmsData.contactHeading;
  const contactDescription = cmsData.contactDescription;
  const contactActionButton = cmsData.contactActionButton;
  const socialLinks = cmsData.socialLinks;
  const footerNavigation = cmsData.footerNavigation;
  const copyrightText = cmsData.copyrightText;

  return (
    <section className="section-4">
      {/* Contact Tier */}
      <div className="contact-tier">
        <h1 className="contact-heading">{contactHeading.content}</h1>
        <p className="contact-description">{contactDescription.content}</p>
        <a
          href="mailto:hello@example.com"
          className="cta-button"
        >
          {contactActionButton.content}
        </a>
      </div>

      {/* Footer Tier */}
      <div className="footer-tier">
        <div className="footer-col copyright-col">
          <p className="copyright-text">{copyrightText.content}</p>
        </div>

        <div className="footer-col nav-col">
          <nav className="footer-nav">
            <ul>
              {footerNavigation.loop.map((item, index) => (
                <li key={index}>
                  <a href={item.field2}>{item.field1}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-col social-col">
          <div className="social-links">
            {socialLinks.loop.map((item, index) => (
              <a
                key={index}
                href={item.field2}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={item.field1}
              >
                {item.field1}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  return (
    <div className="generated-page-container">
      <HeroSection cmsData={cmsData.heroSection} />
      <ExperienceSkillsShowcase cmsData={cmsData.experienceSkillsShowcase} />
      <ProjectsGrid cmsData={cmsData.projectsGrid} />
      <ContactFooter cmsData={cmsData.contactFooter} />
    </div>
  );
}

export default function App() {
  return <GeneratedPage cmsData={cmsDataRaw.resolved_cms} />;
}