import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root workspace directory (one level up from server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables!");
}

const client = new MongoClient(uri);

let dbConnection;

export async function connectToMongoDB() {
  try {
    if (dbConnection) return dbConnection;
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    dbConnection = client.db("UI-Layout-DB");
    return dbConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function getCollection(collectionName) {
  const db = await connectToMongoDB();
  return db.collection(collectionName);
}
