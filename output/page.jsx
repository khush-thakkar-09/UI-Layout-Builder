import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData }) {
  const { heroMainHeading, heroSubheading, primaryCtaButton, secondaryCtaButton, heroImage, trustBadgeStrip } = cmsData;

  const badges = trustBadgeStrip?.loop || [];

  return (
    <section className="section-1">
      <div className="hero-container">
        <div className="hero-content">
          <div className="trust-badges">
            {badges.map((badge) => (
              <div key={badge.fieldId1} className="trust-badge">
                <img 
                  src={badge.field2 || 'https://placehold.co/24x24/f97316/ffffff?text=✓'} 
                  alt="" 
                  className="badge-icon"
                  loading="lazy"
                />
                <span data-field-id={badge.fieldId1} className="badge-text">
                  {badge.field1}
                </span>
              </div>
            ))}
          </div>
          
          <h1 
            className="hero-headline"
            data-field-id={heroMainHeading?.fieldId}
          >
            {heroMainHeading?.content}
          </h1>
          
          <p 
            className="hero-subheading"
            data-field-id={heroSubheading?.fieldId}
          >
            {heroSubheading?.content}
          </p>
          
          <div className="cta-group">
            <button className="cta-primary">
              {primaryCtaButton?.content}
            </button>
            <a href="#" className="cta-secondary">
              {secondaryCtaButton?.content}
            </a>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-image-container">
            <img 
              src={heroImage?.content || 'https://placehold.co/800x600/1e293b/f8fafc?text=Transformation+Visual'} 
              alt="Fitness transformation showcase"
              className="hero-image"
              loading="eager"
            />
            <div className="hero-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Training Programs Grid ---
function TrainingProgramsGrid({ cmsData }) {
  const [activeFilter, setActiveFilter] = useState('Beginner');

  const filters = [
    { label: cmsData.difficultyFilterBeginner?.content || 'Beginner', value: 'Beginner' },
    { label: cmsData.difficultyFilterIntermediate?.content || 'Intermediate', value: 'Intermediate' },
    { label: cmsData.difficultyFilterAdvanced?.content || 'Advanced', value: 'Advanced' }
  ];

  const programCards = cmsData.programCards?.loop || [];

  const filteredPrograms = useMemo(() => {
    return programCards.filter(card => {
      const difficulty = card.field3?.includes('★') ? 
        (card.field3.match(/★/g).length === 1 ? 'Beginner' : 
         card.field3.match(/★/g).length === 2 ? 'Intermediate' : 'Advanced') : 
        'Beginner';
      return difficulty === activeFilter;
    });
  }, [programCards, activeFilter]);

  return (
    <section className="section-2">
      <div className="container">
        <div className="header-section">
          <h2 data-field-id={cmsData.trainingProgramsSectionTitle?.fieldId}>
            {cmsData.trainingProgramsSectionTitle?.content}
          </h2>
          <p className="subtitle" data-field-id={cmsData.trainingProgramsSectionSubtitle?.fieldId}>
            {cmsData.trainingProgramsSectionSubtitle?.content}
          </p>
        </div>

        <div className="filter-tabs">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`filter-tab ${activeFilter === filter.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="programs-grid">
          {filteredPrograms.map((card, index) => {
            const difficulty = card.field3?.includes('★') ? 
              (card.field3.match(/★/g).length === 1 ? 'Beginner' : 
               card.field3.match(/★/g).length === 2 ? 'Intermediate' : 'Advanced') : 
              'Beginner';
            
            const difficultyColor = {
              'Beginner': 'var(--accent-color)',
              'Intermediate': 'var(--accent-color)',
              'Advanced': '#ef4444'
            }[difficulty];

            const difficultyLabel = {
              'Beginner': 'Beginner',
              'Intermediate': 'Intermediate',
              'Advanced': 'Advanced'
            }[difficulty];

            return (
              <div key={index} className="program-card">
                <div className="card-image">
                  <img 
                    src={card.field6 || 'https://placehold.co/600x400/e0e0e0/333333?text=Workout'} 
                    alt={card.field1 || 'Program thumbnail'} 
                  />
                  <div className="difficulty-badge" style={{ backgroundColor: difficultyColor }}>
                    {card.field3}
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 data-field-id={card.fieldId1}>{card.field1}</h3>
                  <p className="duration" data-field-id={card.fieldId2}>{card.field2}</p>
                  
                  <div className="what-included">
                    <ul>
                      {card.field5?.split(',').map((item, i) => (
                        <li key={i} data-field-id={card.fieldId5}>
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className="cta-button">
                    {card.field4}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Coach Profile Section ---
function CoachProfileSection({ cmsData }) {
  return (
    <section className="section-3">
      <div className="container">
        <h2 data-field-id={cmsData.coachProfileSectionTitle?.fieldId}>
          {cmsData.coachProfileSectionTitle?.content}
        </h2>

        <div className="coach-grid">
          <div className="coach-left">
            <div className="coach-headshot-wrapper">
              <img
                src={cmsData.coachHeadshot?.content}
                alt="Coach headshot"
                className="coach-headshot"
              />
            </div>

            <div className="coach-info">
              <h3 className="coach-name" data-field-id={cmsData.coachNameAndCredentials?.fieldId}>
                {cmsData.coachNameAndCredentials?.content}
              </h3>

              <p className="coach-bio" data-field-id={cmsData.coachBioParagraph?.fieldId}>
                {cmsData.coachBioParagraph?.content}
              </p>
            </div>

            <div className="coach-cta">
              <a href="#" className="btn-primary" data-field-id={cmsData.viewFullBioButton?.fieldId}>
                {cmsData.viewFullBioButton?.content}
              </a>

              <div className="social-links">
                <a href="#" className="social-link" data-field-id={cmsData.instagramLinkLabel?.fieldId}>
                  Instagram
                </a>
                <a href="#" className="social-link" data-field-id={cmsData.linkedinLinkLabel?.fieldId}>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="coach-right">
            <div className="certifications-grid">
              {cmsData.certificationsList?.loop?.map((item, index) => (
                <div key={index} className="certification-badge">
                  <span data-field-id={item.fieldId1}>
                    {item.field1}
                  </span>
                  <span data-field-id={item.fieldId2}>
                    {item.field2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Client Testimonials Carousel ---

function ClientTestimonialsCarousel({ cmsData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = cmsData.testimonialsList?.loop || [];
  const paginationDots = cmsData.testimonialsCarouselPaginationDots?.loop || [];
  const header = cmsData.testimonialsSectionHeader?.content || '';
  const navLeft = cmsData.testimonialsCarouselNavLeft?.content || '←';
  const navRight = cmsData.testimonialsCarouselNavRight?.content || '→';

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const currentTestimonial = testimonials[currentIndex] || {};

  return (
    <section className="section-4">
      <div className="section-4__container">
        <div className="section-4__header">
          <h2 data-field-id={cmsData.testimonialsSectionHeader?.fieldId}>{header}</h2>
          <p className="section-4__subtitle">Hear from those who transformed their fitness journey</p>
        </div>

        <div className="section-4__carousel-wrapper">
          <button 
            className="section-4__nav-btn section-4__nav-btn--left"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            data-field-id={cmsData.testimonialsCarouselNavLeft?.fieldId}
          >
            {navLeft}
          </button>

          <div className="section-4__carousel-track">
            <div 
              className={`section-4__carousel-slide ${isTransitioning ? 'section-4__slide--transitioning' : ''}`}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="section-4__card">
                  <div className="section-4__card-content">
                    <div className="section-4__client-info">
                      <img 
                        src={testimonial.field1} 
                        alt={testimonial.field2} 
                        className="section-4__client-photo"
                        data-field-id={testimonial.fieldId1}
                      />
                      <div className="section-4__client-details">
                        <span className="section-4__client-name" data-field-id={testimonial.fieldId2}>
                          {testimonial.field2}
                        </span>
                      </div>
                    </div>

                    <div className="section-4__before-after">
                      {testimonial.field3?.split('|').map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Before/After ${idx + 1}`}
                          className="section-4__thumbnail"
                          data-field-id={testimonial.fieldId3}
                        />
                      ))}
                    </div>

                    <div className="section-4__quote">
                      <p className="section-4__quote-text" data-field-id={testimonial.fieldId4}>
                        "{testimonial.field4}"
                      </p>
                    </div>

                    <div className="section-4__results">
                      <span className="section-4__result-badge" data-field-id={testimonial.fieldId5}>
                        {testimonial.field5}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="section-4__nav-btn section-4__nav-btn--right"
            onClick={handleNext}
            aria-label="Next testimonial"
            data-field-id={cmsData.testimonialsCarouselNavRight?.fieldId}
          >
            {navRight}
          </button>
        </div>

        <div className="section-4__pagination">
          {paginationDots.map((dot, index) => (
            <button
              key={index}
              className={`section-4__dot ${index === currentIndex ? 'section-4__dot--active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              data-field-id={dot.fieldId1}
            >
              {dot.field1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 5: Enrollment CTA Section ---

function EnrollmentCtaSection({ cmsData }) {
  const snapshotCards = useMemo(() => cmsData.programSnapshotCards?.loop || [], []);
  const socialProofItems = useMemo(() => cmsData.socialProofBanner?.loop || [], []);
  
  return (
    <section className="section-5">
      <div className="container">
        {/* Heading & Subheading */}
        <div className="header-content">
          <h1 data-field-id={cmsData.enrollmentSectionHeading?.fieldId}>
            {cmsData.enrollmentSectionHeading?.content}
          </h1>
          <p data-field-id={cmsData.enrollmentSectionSubheading?.fieldId}>
            {cmsData.enrollmentSectionSubheading?.content}
          </p>
        </div>

        {/* Program Snapshot Cards */}
        <div className="snapshot-grid">
          {snapshotCards.map((card, index) => (
            <div key={index} className="snapshot-card">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {index === 0 && <path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
                  {index === 1 && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                  {index === 2 && <path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
                </svg>
              </div>
              <h3 data-field-id={card.fieldId1}>{card.field1}</h3>
              <p data-field-id={card.fieldId2}>{card.field2}</p>
            </div>
          ))}
        </div>

        {/* Social Proof Banner */}
        <div className="social-proof-banner">
          {socialProofItems.map((item, index) => (
            <div key={index} className="proof-badge" data-field-id={item.fieldId1}>
              {item.field1}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="cta-container">
          <a href="#" className="primary-cta" data-field-id={cmsData.primaryCtaButton?.fieldId}>
            {cmsData.primaryCtaButton?.content}
          </a>
          <p className="risk-reversal" data-field-id={cmsData.riskReversalText?.fieldId}>
            {cmsData.riskReversalText?.content}
          </p>
        </div>
      </div>
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  return (
    <div className="generated-page-container">
      <HeroSection cmsData={cmsData.heroSection} />
      <TrainingProgramsGrid cmsData={cmsData.trainingProgramsGrid} />
      <CoachProfileSection cmsData={cmsData.coachProfileSection} />
      <ClientTestimonialsCarousel cmsData={cmsData.clientTestimonialsCarousel} />
      <EnrollmentCtaSection cmsData={cmsData.enrollmentCtaSection} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "2219195f-850b-4712-9d2b-500fb16ad99b";

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

    const handleClick = (e) => {
      if (!editMode) return;
      const fieldId = e.target.getAttribute('data-field-id');
      if (fieldId) {
        e.preventDefault();
      }
    };

    document.addEventListener('dblclick', handleDblClick);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('dblclick', handleDblClick);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('click', handleClick, true);
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