import express from 'express';
import cors from 'cors';
import { getCollection } from './db.js';
import camelCase from 'lodash.camelcase';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET: Fetch CMS data for a project
app.get('/api/cms/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const collection = await getCollection('cms_data');
    const sections = await collection.find({ projectId }).toArray();

    if (!sections || sections.length === 0) {
      return res.status(404).json({ error: `No CMS data found for project ${projectId}` });
    }

    // Sort by index to maintain ordering
    sections.sort((a, b) => {
      const idxA = a.metadata?.index || 0;
      const idxB = b.metadata?.index || 0;
      return idxA - idxB;
    });

    // Reconstruct db_records and resolved_cms
    const db_records = [];
    const resolved_cms = {};

    for (const sec of sections) {
      const record = {
        metadata: sec.metadata,
        elements: sec.elements
      };
      db_records.push(record);

      // Map to resolved_cms format (camelCase key of sectionName)
      const sectionName = sec.metadata.sectionName;
      // Clean section name to camelCase
      const camelKey = camelCase(sectionName);

      const elementsMap = {};
      for (const elem of sec.elements) {
        const elemName = elem.elementName;
        if (elemName) {
          elementsMap[elemName] = elem;
        }
      }
      resolved_cms[camelKey] = elementsMap;
    }

    res.json({
      db_records,
      resolved_cms
    });
  } catch (error) {
    console.error("Error fetching CMS data:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Update elements of a specific section in a project
app.post('/api/cms/:projectId/section/:sectionId/update', async (req, res) => {
  const { projectId, sectionId } = req.params;
  const { elements } = req.body;

  if (!elements || !Array.isArray(elements)) {
    return res.status(400).json({ error: "elements array is required" });
  }

  try {
    const collection = await getCollection('cms_data');
    
    const result = await collection.updateOne(
      { projectId, "metadata.sectionId": sectionId },
      { $set: { elements: elements } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `Section ${sectionId} not found in project ${projectId}` });
    }

    res.json({ success: true, message: "Section elements updated successfully" });
  } catch (error) {
    console.error("Error updating section elements:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express CMS server running on port ${PORT}`);
});
