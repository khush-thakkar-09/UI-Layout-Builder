import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData = {} }) {
  return (
    <section className="section-1">
      <div className="hero-wrapper">
        <div className="hero-background">
          <img 
            src={cmsData.heroBackgroundImage?.content} 
            alt="Signature dish presentation" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <h1 
            className="hero-heading" 
            data-field-id={cmsData.heroPrimaryHeading?.fieldId}
          >
            {cmsData.heroPrimaryHeading?.content}
          </h1>
          
          <p 
            className="hero-subtitle" 
            data-field-id={cmsData.heroSubtitle?.fieldId}
          >
            {cmsData.heroSubtitle?.content}
          </p>
          
          <div className="hero-cta-group">
            <a 
              href="#reservation"
              className="hero-primary-cta"
            >
              {cmsData.heroPrimaryCtaLabel?.content}
            </a>
            <a 
              href="#menu"
              className="hero-secondary-cta"
            >
              {cmsData.heroSecondaryCtaLabel?.content}
            </a>
          </div>
        </div>
        
        <div className="hero-scroll-indicator">
          <span data-field-id={cmsData.heroScrollIndicator?.fieldId}>
            {cmsData.heroScrollIndicator?.content}
          </span>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Curated Menu Section ---

function CuratedMenuSection({ cmsData = {} }) {
  const heading = cmsData.curatedMenuSectionHeading?.content || '';
  const tabsRaw = cmsData.menuCategoryTabs?.content || '';
  const tabs = useMemo(() => tabsRaw.split(',').map(t => t.trim()), [tabsRaw]);
  const menuCards = cmsData.menuCards?.loop || [];
  const ctaLabel = cmsData.viewFullMenuCtaLabel?.content || 'View Full Menu';

  const [activeTab, setActiveTab] = useState('All');
  const [filteredCards, setFilteredCards] = useState(menuCards);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'All') {
      setFilteredCards(menuCards);
    } else {
      setFilteredCards(menuCards.filter(card => {
        const tags = card.field4?.split(',').map(t => t.trim().toLowerCase()) || [];
        return tags.includes(tab.toLowerCase()) || 
               card.field1.toLowerCase().includes(tab.toLowerCase()) ||
               card.field2.toLowerCase().includes(tab.toLowerCase());
      }));
    }
  };

  const getTags = (tagString) => {
    if (!tagString) return [];
    return tagString.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  return (
    <section className="section-2">
      <div className="container">
        <h1 data-field-id={cmsData.curatedMenuSectionHeading?.fieldId} className="section-heading">
          {heading}
        </h1>

        <div className="category-tabs">
          <button 
            className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => handleTabChange('All')}
          >
            All
          </button>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
              data-field-id={cmsData.menuCategoryTabs?.fieldId}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredCards.length > 0 ? (
            filteredCards.map((card, index) => {
              const tags = getTags(card.field4);
              return (
                <div key={index} className="menu-card">
                  <div className="card-image">
                    <img 
                      src="https://placehold.co/600x400/F8F5F0/2B3A42?text=Dish+Image" 
                      alt={card.field1}
                      loading="lazy"
                    />
                    {tags.includes("chef's recommendation") && (
                      <span className="badge">Chef's Recommendation</span>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 data-field-id={card.fieldId1} className="card-title">
                      {card.field1}
                    </h3>
                    <p data-field-id={card.fieldId2} className="card-description">
                      {card.field2}
                    </p>
                    <div className="card-footer">
                      <span data-field-id={card.fieldId3} className="card-price">
                      {card.field3}
                      </span>
                      {tags.length > 0 && (
                        <div className="card-tags">
                          {tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <p>No menu items found for this category.</p>
            </div>
          )}
        </div>

        <div className="cta-container">
          <button className="cta-button">
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Chef’s Story Section ---
function ChefSStorySection({ cmsData = {} }) {
  const galleryItems = cmsData.chefLifestyleGallery?.loop || [];

  return (
    <section className="section-3">
      <div className="container">
        <h1 data-field-id={cmsData.chefStorySectionHeading?.fieldId}>
          {cmsData.chefStorySectionHeading?.content}
        </h1>

        <div className="layout-grid">
          <div className="left-column">
            <div className="chef-portrait-wrapper">
              <img
                src={cmsData.chefPortraitImage?.content}
                alt="Chef Portrait"
                className="chef-portrait"
                data-field-id={cmsData.chefPortraitImage?.fieldId}
              />
            </div>

            {galleryItems.length > 0 && (
              <div className="gallery-grid">
                {galleryItems.map((item, index) => (
                  <div key={index} className="gallery-card">
                    <img
                      src={item.field2}
                      alt={item.field1}
                      className="gallery-image"
                    />
                    <p className="gallery-caption" data-field-id={item.fieldId1}>
                      {item.field1}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="right-column">
            <div
              className="narrative-text"
              data-field-id={cmsData.chefBiographicalNarrative?.fieldId}
              dangerouslySetInnerHTML={{
                __html: cmsData.chefBiographicalNarrative?.content
                  ?.replace(/\*([^*]+)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br />') || ''
              }}
            />

            <blockquote
              className="philosophy-quote"
              data-field-id={cmsData.chefSignaturePhilosophyStatement?.fieldId}
            >
              {cmsData.chefSignaturePhilosophyStatement?.content}
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Reservation & Location Section ---
function ReservationLocationSection({ cmsData = {} }) {
  const heading = cmsData.reservationLocationSectionHeading?.content || "Reserve Your Table & Find Us";
  const ctaLabel = cmsData.confirmReservationCtaLabel?.content || "Confirm Reservation";
  const mapSrc = cmsData.embeddedMap?.content || "";
  const mapCta = cmsData.mapCtaLink?.content || "Open in Google Maps";
  const formFields = cmsData.reservationForm?.loop || [];
  const contactInfo = cmsData.contactHoursCard?.loop || [];

  return (
    <section className="section-4">
      <div className="container">
        <h2 data-field-id={cmsData.reservationLocationSectionHeading?.fieldId} className="section-heading">
          {heading}
        </h2>

        <div className="layout-grid">
          {/* Left Column: Reservation Form */}
          <div className="form-column">
            <form className="reservation-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                {formFields.map((field, index) => (
                  <div key={index} className="form-group">
                    <label htmlFor={`field-${index}`} className="form-label">
                      <span data-field-id={field.fieldId1}>{field.field1}</span>
                    </label>
                    <input
                      type={index === 0 ? "date" : index === 1 ? "time" : index === 2 ? "number" : "text"}
                      id={`field-${index}`}
                      className="form-input"
                      placeholder={field.field2}
                      aria-label={field.field3}
                    />
                    <span className="form-feedback" aria-live="polite"></span>
                  </div>
                ))}
              </div>

              <div className="form-group full-width">
                <label htmlFor="special-requests" className="form-label">
                  <span data-field-id={formFields[5]?.fieldId1}>Special Requests</span>
                </label>
                <textarea
                  id="special-requests"
                  className="form-input textarea"
                  rows="3"
                  placeholder={formFields[5]?.field2}
                  aria-label={formFields[5]?.field3}
                ></textarea>
                <span className="form-feedback" aria-live="polite"></span>
              </div>

              <button
                type="submit"
                className="cta-button"
                data-field-id={cmsData.confirmReservationCtaLabel?.fieldId}
              >
                {ctaLabel}
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info & Map */}
          <div className="info-column">
            <div className="contact-card">
              <ul className="info-list">
                {contactInfo.map((item, idx) => (
                  <li key={idx} className="info-item">
                    <span className="info-label" data-field-id={item.fieldId1}>{item.field1}:</span>
                    <span className="info-value" data-field-id={item.fieldId2}>{item.field2}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="contact-link" data-field-id={contactInfo[3]?.fieldId2}>
                {contactInfo[3]?.field2}
              </a>
            </div>

            <div className="map-container">
              <iframe
                src={mapSrc}
                title="Restaurant Location"
                className="map-embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent("Ginza, Tokyo")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-cta-link"
                data-field-id={cmsData.mapCtaLink?.fieldId}
              >
                {mapCta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GeneratedPage({ cmsData }) {
  if (!cmsData) return null;
  return (
    <div className="generated-page-container">
      <HeroSection cmsData={cmsData.heroSection || cmsData.herosection || {}} />
      <CuratedMenuSection cmsData={cmsData.curatedMenuSection || cmsData.curatedmenusection || {}} />
      <ChefSStorySection cmsData={cmsData.chefSStorySection || cmsData.chefsStorySection || cmsData.chefsstorysection || {}} />
      <ReservationLocationSection cmsData={cmsData.reservationLocationSection || cmsData.reservationlocationsection || {}} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "d0ba56bb-40b2-420d-bbbe-4a33a230b30b";

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