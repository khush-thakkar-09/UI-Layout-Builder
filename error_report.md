# Error Report — React Portfolio Project
> Generated: 2026-06-29  
> Files analysed: `page.jsx`, `page.css`, `cms_data.json`  
> Missing files: `App.jsx`, `App.css`, `index.css`

---

## Legend
- 🔴 **Critical** — will crash the app or cause a blank screen
- 🟡 **Warning** — won't crash but causes incorrect behaviour or visual issues
- 🔵 **Info** — not a bug, but worth knowing / best practice

---

## CRITICAL ERRORS 🔴

---

### ERROR 1 — `useState` is not imported
**File:** `page.jsx`  
**Line:** 1

**Problem:**  
`ExperienceSkillsShowcase` uses `useState` for the skill filter button:
```jsx
const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');
```
But the import at the top is:
```jsx
import React from 'react';
```
`useState` is never imported. React will throw:
```
ReferenceError: useState is not defined
```
The entire app crashes immediately on load.

**Fix:**
```jsx
import React, { useState } from 'react';
```

---

### ERROR 2 — `page.css` is never imported
**File:** `page.jsx`  
**Affects:** All 4 sections

**Problem:**  
`page.css` contains every single class used in `page.jsx` — `.section-1`, `.hero-container`, `.hero-headline`, `.section-2-card`, `.section-3__grid`, `.section-4`, etc. But `page.css` is not imported anywhere in `page.jsx`, and there is no `App.jsx` yet that could import it instead.

Result: the page renders as completely unstyled raw HTML — no layout, no colours, no fonts, no animations.

**Fix (Option A — import inside page.jsx):**
```jsx
import React, { useState } from 'react';
import './page.css';   // ← add this line at the top
```

**Fix (Option B — import inside App.jsx):**
```jsx
import './page.css';
```
Either works. Option A is cleaner since the CSS belongs to `page.jsx`.

---

### ERROR 3 — CMS data shape mismatch (wrong accessor pattern across all 4 sections)
**File:** `page.jsx`  
**Affects:** `HeroSection`, `ExperienceSkillsShowcase`, `ProjectsGrid`, `ContactFooter`

**Problem:**  
Every section component uses `.elements.find()` to look up CMS content:
```jsx
const headline = cmsData.elements.find(el => el.elementName === 'heroHeadline')?.content || '';
```
This pattern works against `db_records` (the array format in `cms_data.json`), where each record has an `elements` array.

However, `page.jsx` (bottom of file) passes props from `resolved_cms`:
```jsx
<HeroSection cmsData={cmsData.heroSection} />
```
`cmsData.heroSection` comes from `resolved_cms.heroSection`, which is a **flat object** with direct keys:
```json
{
  "heroHeadline": { "content": "Architecting Intelligence..." },
  "heroSubheadline": { "content": "Turning raw data..." },
  ...
}
```
This object has **no `.elements` property**. So `cmsData.elements` is `undefined`, and calling `.find()` on `undefined` throws:
```
TypeError: Cannot read properties of undefined (reading 'find')
```

This crash affects all 4 sections simultaneously.

**Fix — use flat key access to match `resolved_cms` structure:**

*HeroSection (replace all `.find()` calls):*
```jsx
const headline   = cmsData.heroHeadline?.content || '';
const subheadline = cmsData.heroSubheadline?.content || '';
const primaryCta  = cmsData.primaryCta?.content || '';
const secondaryCta = cmsData.secondaryCta?.content || '';
const techStack   = cmsData.techStackMarquee?.loop || [];
```

*ExperienceSkillsShowcase:*
```jsx
const header       = cmsData.experienceSectionHeader;
const experienceList = cmsData.experienceList;
const skillBadgeList = cmsData.skillBadgeList;
const skillFilterBar = cmsData.skillFilterBar;
```

*ProjectsGrid:*
```jsx
const header      = cmsData.projectsSectionHeader;
const filterTabs  = cmsData.projectFilterTabs;
const projectList = cmsData.projectList;
```

*ContactFooter:*
```jsx
const contactHeading      = cmsData.contactHeading;
const contactDescription  = cmsData.contactDescription;
const contactActionButton = cmsData.contactActionButton;
const socialLinks         = cmsData.socialLinks;
const footerNavigation    = cmsData.footerNavigation;
const copyrightText       = cmsData.copyrightText;
```

---

### ERROR 4 — `App.jsx` does not exist (entire app cannot start)
**File:** Missing — needs to be created at `src/App.jsx`

**Problem:**  
`main.jsx` (the entry point Vite generates by default) imports and renders `<App />`. Without `App.jsx`, the dev server throws a module-not-found error and the app never starts.

Additionally, `App.jsx` is the only place that can:
- Import `cms_data.json`
- Pass `cmsData.resolved_cms` (not the root JSON) to `<GeneratedPage />`
- Import global styles

**Required `App.jsx` content:**
```jsx
import './App.css'
import './page.css'              // if not imported in page.jsx
import cmsRaw from './cms_data.json'
import GeneratedPage from './page.jsx'

function App() {
  return (
    <div className="app-wrapper">
      <GeneratedPage cmsData={cmsRaw.resolved_cms} />
    </div>
  )
}

export default App
```

> ⚠️ **Critical note on the prop:** Pass `cmsRaw.resolved_cms`, NOT `cmsRaw` directly.  
> `page.jsx` accesses `cmsData.heroSection`, `cmsData.projectsGrid`, etc., which only exist under `resolved_cms`. Passing the root object means all four sections receive `undefined` and crash.

---

### ERROR 5 — `index.css` does not exist (browser default styles bleed in)
**File:** Missing — needs to be created at `src/index.css`

**Problem:**  
Vite's `main.jsx` imports `./index.css` by default. If the file doesn't exist, Vite throws a build error. Even if you remove that import, without a CSS reset, browsers apply their own default `margin`, `padding`, `box-sizing`, and `font-family`, which will break the layout.

**Required minimum `index.css` content:**
```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0f172a;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### ERROR 6 — `App.css` does not exist
**File:** Missing — needs to be created at `src/App.css`

**Problem:**  
`App.jsx` will import `./App.css`. If this file doesn't exist, Vite throws a build error.

**Required minimum `App.css` content:**
```css
.app-wrapper {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}
```

---

## WARNINGS 🟡

---

### WARNING 1 — `Math.random()` called on every render (particle positions change on every state update)
**File:** `page.jsx`  
**Component:** `HeroSection`  
**Lines:** particle and connection-line style blocks

**Problem:**  
```jsx
style={{
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3}s`,
  animationDuration: `${4 + Math.random() * 4}s`
}}
```
`Math.random()` runs on every render. When `ExperienceSkillsShowcase` (which is a sibling component) updates state via the filter buttons, React may re-render the whole tree, causing particles to teleport to new random positions. This creates a jarring visual jump.

**Fix — generate values once using `useMemo`:**
```jsx
const particles = useMemo(() =>
  Array.from({ length: 12 }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${4 + Math.random() * 4}s`,
  })), []
);

// Then in JSX:
{particles.map((style, i) => (
  <div key={i} className="particle" style={style} />
))}
```
Add `useMemo` to your import: `import React, { useState, useMemo } from 'react';`

---

### WARNING 2 — Tech tags in `ProjectsGrid` are hardcoded, not from CMS
**File:** `page.jsx`  
**Component:** `ProjectsGrid`

**Problem:**  
The tech tags on each project card are hardcoded:
```jsx
<span className="section-3__tech-tag">PyTorch</span>
<span className="section-3__tech-tag">FastAPI</span>
<span className="section-3__tech-tag">AWS</span>
```
These show the same three tags on every single project card regardless of what the project actually is. The CMS `projectList` loop only has `field1` (name), `field2` (description), and `field3` (link) — there is no field for tech tags in the current data.

**Fix (Option A — add a `field4` to the CMS JSON for tags per project):**  
Update `cms_data.json` to add `field4` with a comma-separated tag list, then parse it in the component.

**Fix (Option B — keep hardcoded but make it an array you can easily update):**
```jsx
const techTags = ['PyTorch', 'FastAPI', 'AWS'];
// then map over them
```

---

### WARNING 3 — Filter buttons in `ProjectsGrid` have no active state
**File:** `page.jsx`  
**Component:** `ProjectsGrid`

**Problem:**  
The project filter tabs (Computer Vision, LLMs, Data Pipelines) are rendered as buttons but have no `onClick` handler and no state to track which is active. Clicking them does nothing. There is also no filtering logic — all projects always show regardless of which tab is selected.

`ExperienceSkillsShowcase` correctly implements this pattern with `useState` and `.filter()`. `ProjectsGrid` is missing the same treatment.

**Fix — mirror the pattern from `ExperienceSkillsShowcase`:**
```jsx
const [activeTab, setActiveTab] = useState('All');

// Add onClick to each button:
<button
  key={index}
  className={`section-3__filter-btn ${activeTab === tab.field1 ? 'active' : ''}`}
  onClick={() => setActiveTab(tab.field1)}
>
  {tab.field1}
</button>
```
Note: you'll also need a `field2` (category) on each project in the CMS to filter against, similar to how skills have a category.

---

### WARNING 4 — CSS variable scope conflict between Section 3 and global `:root`
**File:** `page.css`

**Problem:**  
Section 3 redefines CSS variables locally on `.section-3`:
```css
.section-3 {
  --text-primary: #e0e0e0;     /* overrides global #f8fafc */
  --text-secondary: #a0a0a0;   /* overrides global #94a3b8 */
  --border-radius: 12px;        /* overrides global 8px */
  --border-radius-lg: 16px;     /* same as global, redundant */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', ...;
  --bg-dark: #121212;
  --bg-card: #1a1a1a;
  --accent-primary: #00ffff;
  --accent-secondary: #00ff88;
}
```
This means inside `.section-3`, `--text-primary` is `#e0e0e0` (slightly grey), while in all other sections it's `#f8fafc` (near white). The visual difference is subtle but inconsistent. More importantly, if any child of `.section-3` uses `--border-radius` expecting `8px`, it gets `12px` instead.

This is not wrong per se — CSS variable scoping is a valid technique — but it is inconsistent with how the rest of the page uses global tokens, and will cause confusion during maintenance.

**Fix (if intentional):** Add a comment explaining the override is deliberate.  
**Fix (if unintentional):** Remove the local variable declarations from `.section-3` and use the global `:root` values, or rename the local ones (e.g. `--s3-accent`) to avoid shadowing.

---

## INFO 🔵

---

### INFO 1 — `page.css` has a duplicate `.section-3__card` rule
**File:** `page.css`

`.section-3__card` is defined twice — once for layout styles (background, border, flex), and again lower down for the fade-in animation. CSS allows this and the second rule merges with the first (later properties win if there's a conflict). There's no conflict here so it works fine, but it's cleaner to combine them into one block.

---

### INFO 2 — Google Fonts is imported twice for the same font
**File:** `page.css`

The `@import url('https://fonts.googleapis.com/css2?family=Inter...')` at the top of `page.css` loads Inter. If `index.css` also imports a Google Font, or if the HTML shell from your synthesizer pipeline adds a `<link>` tag for the same font, the font will be requested twice, adding a small unnecessary network overhead. Consolidate the font import to one place — ideally `index.css` or the `<head>` of `index.html`.

---

### INFO 3 — `Fira Code` font is referenced in CSS but never loaded
**File:** `page.css`

Section 3 defines:
```css
--font-mono: 'Fira Code', 'Courier New', monospace;
```
`Fira Code` is used for `.section-3__tech-tag` and `.section-3__card-link`. But there is no `@import` for `Fira Code` from Google Fonts. The browser will silently fall back to `Courier New`. This means the code-style font on project cards won't look as intended.

**Fix — add to the Google Fonts import at the top of `page.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap');
```

---

### INFO 4 — Copyright text says "Built with React & Framer Motion" but Framer Motion is not installed
**File:** `cms_data.json`

The `copyrightText` element reads:
```
© 2024 AI Engineer. Built with React & Framer Motion.
```
There is no Framer Motion (`framer-motion` package) used anywhere in `page.jsx`, and it doesn't appear to be in the project dependencies. Either install and use it, or update the copyright text.

---

## SUMMARY TABLE

| # | Severity | File | Issue |
|---|---|---|---|
| 1 | 🔴 Critical | `page.jsx` | `useState` not imported → instant crash |
| 2 | 🔴 Critical | `page.jsx` | `page.css` never imported → zero styles |
| 3 | 🔴 Critical | `page.jsx` | `.elements.find()` on flat object → crash in all 4 sections |
| 4 | 🔴 Critical | Missing | `App.jsx` doesn't exist → app can't start |
| 5 | 🔴 Critical | Missing | `index.css` doesn't exist → Vite build error |
| 6 | 🔴 Critical | Missing | `App.css` doesn't exist → Vite build error |
| 7 | 🟡 Warning | `page.jsx` | `Math.random()` on every render → particles jump |
| 8 | 🟡 Warning | `page.jsx` | Project tech tags hardcoded, not from CMS |
| 9 | 🟡 Warning | `page.jsx` | Project filter tabs have no logic or active state |
| 10 | 🟡 Warning | `page.css` | CSS variable conflict between Section 3 and `:root` |
| 11 | 🔵 Info | `page.css` | Duplicate `.section-3__card` rule block |
| 12 | 🔵 Info | `page.css` | Google Fonts imported twice (also in synthesizer HTML shell) |
| 13 | 🔵 Info | `page.css` | `Fira Code` referenced but never loaded → silent fallback |
| 14 | 🔵 Info | `cms_data.json` | Copyright mentions Framer Motion which is not used |

---

*Fix all 🔴 Critical errors first — the app cannot render at all until they are resolved.*
