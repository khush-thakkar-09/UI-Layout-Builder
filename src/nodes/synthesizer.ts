import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { GlobalState } from "../state.js";
import { logTokenUsage } from "../utils/token_tracker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSynthesizer(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const codedSections = state.coded_sections || [];
  const enhancedPrompt = state.enhanced_prompt || "";
  const userPrompt = state.user_prompt || "AI Generated UI Layout";

  if (codedSections.length === 0) {
    console.log("\n[Synthesizer] No coded sections to synthesize!");
    return {
      pipeline_status: "failed",
      failure_reason: "No coded sections found to synthesize",
    };
  }

  // Filter to only successfully coded sections
  const successfulSections = codedSections.filter((s) => s.status === "success");

  // Use theme tokens from state
  let rootCss = state.theme_css || "";
  if (!rootCss) {
    console.warn("[Synthesizer] ⚠ No theme_css in state. Using default tokens.");
    rootCss = `:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #3b82f6;
  --accent-hover: #2563eb;
  --font-family: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  --spacing-xl: 64px;
  --border-radius: 8px;
  --border-radius-lg: 16px;
}`;
  }

  console.log("\n[Synthesizer] Using pre-extracted design tokens from theme_extractor.");

  const cssBlocks = successfulSections.map(
    (secCode) => `/* Section ${secCode.section_id}: ${secCode.section_name} */\n${secCode.css}`
  );

  // Extract Google Fonts to link/import
  const allCssToScan = rootCss + "\n" + cssBlocks.join("\n");
  const fontMatches = Array.from(
    allCssToScan.matchAll(/(?:font-family|font-heading|font-mono|--font-[a-z0-9-]+):\s*['"]?([^'"`\;,\)]+)['"]?/gi)
  ).map((m) => m[1].trim());

  let googleFontsImport = "";
  if (fontMatches.length > 0) {
    const fontFamilies: string[] = [];
    const uniqueFonts = Array.from(new Set(fontMatches));
    for (let font of uniqueFonts) {
      font = font.split(",")[0].trim().replace(/['"]/g, "");
      const systemFonts = ["sans-serif", "serif", "monospace", "cursive", "system-ui", "-apple-system", "inherit", "initial", "unset"];
      if (!systemFonts.includes(font.toLowerCase()) && !font.startsWith("var(")) {
        fontFamilies.push(font.replace(/\s+/g, "+"));
      }
    }
    if (fontFamilies.length > 0) {
      const fontQuery = fontFamilies.join("|");
      googleFontsImport = `@import url('https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;600;700;800&display=swap');\n\n`;
    }
  }

  console.log("[Synthesizer] Assembling React components and stylesheets...");

  const jsxComponents: string[] = [];
  const resolvedCms: Record<string, any> = {};
  const dbRecords: any[] = [];

  for (const secCode of successfulSections) {
    const sectionId = secCode.section_id;
    const sectionName = secCode.section_name;

    // Get raw JSX, strip internal React imports to prevent duplicate or invalid imports
    const rawJsx = secCode.jsx;
    let cleanJsx = rawJsx.replace(/^\s*import\s+.*?;?\s*$/gm, "");
    cleanJsx = cleanJsx.replace("export default function", "function");
    jsxComponents.push(`// --- Section ${sectionId}: ${sectionName} ---\n${cleanJsx}`);

    // CMS Resolution
    const sectionState = (state.sections || []).find((s) => s.id === sectionId);
    if (sectionState && sectionState.cms) {
      const cms = sectionState.cms;
      dbRecords.push(cms);

      const componentKeyCamel = sectionName
        .split(/[^a-zA-Z0-9]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      const componentKey = componentKeyCamel.charAt(0).toLowerCase() + componentKeyCamel.slice(1);

      const elementsMap: Record<string, any> = {};
      for (const elem of cms.elements || []) {
        const elemName = elem.elementName;
        if (elemName) {
          elementsMap[elemName] = elem;
        }
      }
      resolvedCms[componentKey] = elementsMap;
    }
  }

  // Build combined JSX App Component
  const wrapperLines = [
    "export function GeneratedPage({ cmsData }) {",
    "  return (",
    "    <div className=\"generated-page-container\">",
  ];

  for (const secCode of successfulSections) {
    const sectionName = secCode.section_name;
    const componentName = sectionName
      .split(/[^a-zA-Z0-9]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    const propKey = componentName.charAt(0).toLowerCase() + componentName.slice(1);
    wrapperLines.push(`      <${componentName} cmsData={cmsData.${propKey}} />`);
  }

  wrapperLines.push("    </div>");
  wrapperLines.push("  );");
  wrapperLines.push("}");

  // Determine which React hooks are referenced across all generated JSX components
  const allJsxContent = jsxComponents.join("\n");
  const hooksToImport = ["useState", "useMemo", "useEffect"];
  const possibleHooks = [
    "useRef",
    "useCallback",
    "useContext",
    "useReducer",
    "useImperativeHandle",
    "useLayoutEffect",
    "useDebugValue",
  ];
  for (const hook of possibleHooks) {
    const hookRegExp = new RegExp(`\\b${hook}\\b`);
    if (hookRegExp.test(allJsxContent)) {
      hooksToImport.push(hook);
    }
  }

  const hooksImportList = Array.from(new Set(hooksToImport)).sort().join(", ");

  const projectIdVal = state.project_id || "";

  const appWrapperCode = `export default function App() {
  const [cmsData, setCmsData] = useState(cmsDataRaw.resolved_cms);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  
  const projectId = "__PROJECT_ID__";

  useEffect(() => {
    fetch(\`http://localhost:5001/api/cms/\${projectId}\`)
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
      const res = await fetch(\`http://localhost:5001/api/cms/\${projectId}\`);
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
                const fId = item[\`fieldId\${i}\`];
                if (fId && pendingChanges[fId] !== undefined) {
                  item[\`field\${i}\`] = pendingChanges[fId];
                  sectionUpdated = true;
                  updatedCount++;
                }
              }
            }
          }
        }

        if (sectionUpdated) {
          const sectionId = record.metadata.sectionId;
          const updateRes = await fetch(\`http://localhost:5001/api/cms/\${projectId}/section/\${sectionId}/update\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elements: record.elements })
          });
          if (!updateRes.ok) throw new Error(\`Failed to update section \${sectionId}\`);
        }
      }

      alert(\`Successfully saved \${updatedCount} changes to MongoDB!\`);
      setHasChanges(false);
      setPendingChanges({});
      
      const refreshRes = await fetch(\`http://localhost:5001/api/cms/\${projectId}\`);
      const refreshData = await refreshRes.json();
      setCmsData(refreshData.resolved_cms);
    } catch (err) {
      console.error(err);
      alert("Error saving changes: " + err.message);
    }
  };

  return (
    <div className={\`app-wrapper \${editMode ? 'edit-mode-active' : ''}\`}>
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

      <style>{\`
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
      \`}</style>

      <GeneratedPage cmsData={cmsData} />
    </div>
  );
}`.replace("__PROJECT_ID__", projectIdVal);

  const combinedJsx =
    `import React, { ${hooksImportList} } from 'react';\n` +
    `import cmsDataRaw from './cms_data.json';\n` +
    `import './index.css';\n\n` +
    jsxComponents.join("\n\n") + "\n\n" +
    wrapperLines.join("\n") + "\n\n" +
    appWrapperCode;

  const combinedCss = googleFontsImport + rootCss + "\n\n" + cssBlocks.join("\n\n");

  const cmsPayload = {
    db_records: dbRecords,
    resolved_cms: resolvedCms,
  };

  const projectRoot = path.join(__dirname, "..", "..");

  const outputDir = path.join(projectRoot, "output");
  fs.mkdirSync(outputDir, { recursive: true });
  const outJsxFile = path.join(outputDir, "page.jsx");
  const outCssFile = path.join(outputDir, "page.css");
  const outCmsFile = path.join(outputDir, "cms_data.json");

  const reactSrcDir = path.join(projectRoot, "testing_react", "src");
  fs.mkdirSync(reactSrcDir, { recursive: true });
  const reactJsxFile = path.join(reactSrcDir, "App.jsx");
  const reactCssFile = path.join(reactSrcDir, "index.css");
  const reactCmsFile = path.join(reactSrcDir, "cms_data.json");

  try {
    // Write to output folder
    fs.writeFileSync(outJsxFile, combinedJsx, "utf-8");
    fs.writeFileSync(outCssFile, combinedCss, "utf-8");
    fs.writeFileSync(outCmsFile, JSON.stringify(cmsPayload, null, 2), "utf-8");

    // Write to testing_react project
    fs.writeFileSync(reactJsxFile, combinedJsx, "utf-8");
    fs.writeFileSync(reactCssFile, combinedCss, "utf-8");
    fs.writeFileSync(reactCmsFile, JSON.stringify(cmsPayload, null, 2), "utf-8");

    console.log(`[Synthesizer] ✓ React components compiled to output: ${outJsxFile}`);
    console.log(`[Synthesizer] ✓ CSS stylesheet written to output: ${outCssFile}`);
    console.log(`[Synthesizer] ✓ Unified CMS JSON payload written to output: ${outCmsFile}`);
    console.log(`[Synthesizer] ✓ React components integrated into testing_react: ${reactJsxFile}`);
    console.log(`[Synthesizer] ✓ CSS stylesheet integrated into testing_react: ${reactCssFile}`);
    console.log(`[Synthesizer] ✓ CMS JSON integrated into testing_react: ${reactCmsFile}`);

    const mongodbUri = process.env.MONGODB_URI;
    if (mongodbUri) {
      try {
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db("UI-Layout-DB");
        const collection = db.collection("cms_data");

        const projectId = state.project_id || "";
        const projectName = state.user_prompt || "";

        for (const record of dbRecords) {
          const doc = {
            projectId: projectId,
            projectName: projectName,
            metadata: record.metadata || {},
            elements: record.elements || [],
          };
          await collection.insertOne(doc);
        }

        console.log(`[Synthesizer] ✓ Saved ${dbRecords.length} sections to MongoDB collection 'cms_data'`);
        await client.close();
      } catch (dbErr: any) {
        console.error(`[Synthesizer] ✗ Failed to save CMS records to MongoDB: ${dbErr.message}`);
      }
    }
  } catch (err: any) {
    console.error(`[Synthesizer] ✗ Failed to write output files: ${err.message}`);
    return {
      pipeline_status: "failed",
      failure_reason: `Writing synthesized files failed: ${err.message}`,
    };
  }

  return {
    final_html: combinedJsx,
    output_path: outJsxFile,
    pipeline_status: "complete",
  };
}
