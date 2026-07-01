import React, { useEffect, useMemo, useState } from 'react';
import cmsDataRaw from './cms_data.json';
import './index.css';

// --- Section 1: Hero Section ---
function HeroSection({ cmsData }) {
  return (
    <section className="section-1">
      <div className="hero-container">
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${cmsData.heroBackgroundImage?.content})` }}
        >
          <div 
            className="hero-overlay"
            style={{ background: cmsData.heroOverlayGradient?.content }}
          />
        </div>
        
        <div className="hero-content">
          <h1 
            className="hero-heading"
            data-field-id={cmsData.heroMainHeading?.fieldId}
          >
            {cmsData.heroMainHeading?.content}
          </h1>
          
          <p 
            className="hero-subheading"
            data-field-id={cmsData.heroSubheading?.fieldId}
          >
            {cmsData.heroSubheading?.content}
          </p>
          
          <div className="hero-cta-group">
            <button 
              className="hero-primary-btn"
              data-field-id={cmsData.heroPrimaryCta?.fieldId}
            >
              {cmsData.heroPrimaryCta?.content}
            </button>
            
            <button 
              className="hero-secondary-btn"
              data-field-id={cmsData.heroSecondaryCta?.fieldId}
            >
              {cmsData.heroSecondaryCta?.content}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 2: Curated Menu Section ---

function CuratedMenuSection({ cmsData }) {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = useMemo(() => {
    const tabData = cmsData.menuCategoryTabs?.loop?.[0] || {};
    return Object.values(tabData).filter((v, i) => i % 2 === 0 && typeof v === 'string');
  }, [cmsData]);

  const dishes = useMemo(() => {
    return cmsData.dishCards?.loop?.map((item) => ({
      image: item.field1,
      title: item.field2,
      description: item.field3,
      price: item.field4,
      indicator: item.field5
    })) || [];
  }, [cmsData]);

  const filteredDishes = useMemo(() => {
    // In a real app, we would filter based on activeTab
    // For now, we'll just return all dishes as the schema doesn't map tabs to dishes
    return dishes;
  }, [dishes, activeTab]);

  return (
    <section className="section-2">
      <div className="container">
        <div className="header">
          <h1 data-field-id={cmsData.curatedMenuSectionTitle?.fieldId}>
            {cmsData.curatedMenuSectionTitle?.content}
          </h1>
          <p className="subtitle" data-field-id={cmsData.curatedMenuSectionSubtitle?.fieldId}>
            {cmsData.curatedMenuSectionSubtitle?.content}
          </p>
        </div>

        <div className="tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
              data-field-id={cmsData.menuCategoryTabs?.loop?.[0][`fieldId${index + 1}`]}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="dish-grid">
          {filteredDishes.map((dish, index) => (
            <div key={index} className="dish-card">
              <div className="image-container">
                <img 
                  src={dish.image} 
                  alt={dish.title}
                  className="dish-image"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/f8f5f0/2b2926?text=Dish+Image';
                  }}
                />
                {dish.indicator && (
                  <span className="indicator-badge">
                    {dish.indicator}
                  </span>
                )}
              </div>
              <div className="card-content">
                <h3 data-field-id={dish.fieldId2}>{dish.title}</h3>
                <p className="description" data-field-id={dish.fieldId3}>{dish.description}</p>
                <div className="price-container">
                  <span className="price" data-field-id={dish.fieldId4}>{dish.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-container">
          <button className="cta-button" data-field-id={cmsData.curatedMenuCtaButton?.fieldId}>
            {cmsData.curatedMenuCtaButton?.content}
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Chef’s Story Section ---
function ChefStorySection({ cmsData }) {
  return (
    <section className="section-3">
      <div className="container">
        <h2 data-field-id={cmsData.chefStorySectionTitle?.fieldId} className="section-title">
          {cmsData.chefStorySectionTitle?.content}
        </h2>

        <div className="chef-content-grid">
          <div className="chef-portrait-wrapper">
            <img
              src={cmsData.chefPortrait?.content}
              alt="Chef Kenji Sato"
              className="chef-portrait"
              data-field-id={cmsData.chefPortrait?.fieldId}
            />
          </div>

          <div className="chef-text-content">
            <p
              className="narrative-teaser"
              data-field-id={cmsData.chefNarrativeTeaser?.fieldId}
            >
              {cmsData.chefNarrativeTeaser?.content}
            </p>

            <div
              className="biography"
              data-field-id={cmsData.chefBiography?.fieldId}
              dangerouslySetInnerHTML={{
                __html: cmsData.chefBiography?.content?.replace(/\*/g, '<em>') || ''
              }}
            />

            <div className="signature-dish-wrapper">
              <img
                src={cmsData.signatureDishImage?.content}
                alt="Signature Dish"
                className="signature-dish"
                data-field-id={cmsData.signatureDishImage?.fieldId}
              />
            </div>

            <a
              href="#reservation"
              className="cta-button"
              data-field-id={cmsData.chefStoryCtaButton?.fieldId}
            >
              {cmsData.chefStoryCtaButton?.content}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Reservation & Location Section ---
function ReservationLocationSection({ cmsData }) {
  const heading = cmsData.reservationLocationSectionHeading?.content || "Reserve Your Table & Find Us";
  const mapEmbed = cmsData.mapEmbed?.content || "";
  const formFields = cmsData.reservationForm?.loop?.[0] || {};
  const locationDetails = cmsData.locationDetailsCard?.loop?.[0] || {};

  return (
    <section className="section-4">
      <div className="container">
        <h2 data-field-id={cmsData.reservationLocationSectionHeading?.fieldId}>{heading}</h2>
        
        <div className="grid-container">
          {/* Reservation Form */}
          <div className="form-section">
            <form className="reservation-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date" data-field-id={formFields.fieldId1}>Date</label>
                  <input type="date" id="date" name="date" required />
                </div>
                <div className="form-group">
                  <label htmlFor="time" data-field-id={formFields.fieldId2}>Time</label>
                  <select id="time" name="time" required>
                    <option value="">Select time</option>
                    <option value="17:30">5:30 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="20:30">8:30 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guests" data-field-id={formFields.fieldId3}>Guests</label>
                  <select id="guests" name="guests" required>
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5 People</option>
                    <option value="6">6 People</option>
                    <option value="7">7 People</option>
                    <option value="8">8+ People</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="name" data-field-id={formFields.fieldId4}>Name</label>
                  <input type="text" id="name" name="name" placeholder="Your full name" required />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="contact" data-field-id={formFields.fieldId5}>Email or Phone</label>
                <input type="text" id="contact" name="contact" placeholder="Email or phone number" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="requests" data-field-id={formFields.fieldId6}>Special Requests</label>
                <textarea id="requests" name="requests" rows="3" placeholder="Allergies, dietary restrictions, special occasions..."></textarea>
              </div>
              
              <button type="submit" className="submit-btn" data-field-id={formFields.fieldId7}>
                {formFields.field7 || "Confirm Reservation"}
              </button>
            </form>
          </div>
          
          {/* Map & Location Details */}
          <div className="map-section">
            <div className="map-container">
              <div className="map-iframe-wrapper">
                <iframe 
                  title="Restaurant Location" 
                  srcDoc={mapEmbed} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            
            <div className="location-card">
              <div className="location-content">
                <div className="location-item">
                  <span className="label">Address</span>
                  <p data-field-id={locationDetails.fieldId1}>{locationDetails.field1}</p>
                </div>
                <div className="location-item">
                  <span className="label">Phone</span>
                  <p data-field-id={locationDetails.fieldId2}>{locationDetails.field2}</p>
                </div>
                <div className="location-item">
                  <span className="label">Hours</span>
                  <p data-field-id={locationDetails.fieldId3}>{locationDetails.field3}</p>
                </div>
              </div>
            </div>
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
      <CuratedMenuSection cmsData={cmsData.curatedMenuSection} />
      <ChefSStorySection cmsData={cmsData.chefSStorySection} />
      <ReservationLocationSection cmsData={cmsData.reservationLocationSection} />
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "bad36f5e-3c6b-4b4f-833a-6b71b2f02770";

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