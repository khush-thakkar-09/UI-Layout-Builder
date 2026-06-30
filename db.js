// db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

const client = new MongoClient(uri);

let dbConnection;

export async function connectToMongoDB() {
    try {
        if (dbConnection) return dbConnection;

        await client.connect();
        console.log("Successfully connected to MongoDB Atlas!");
        dbConnection = client.db("UI-Layout-DB"); // Replace with your database name
        return dbConnection;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}

export async function getCollection(collectionName) {
    const db = await connectToMongoDB();
    return db.collection(collectionName);
}

export async function disconnectFromMongoDB() {
    await client.close();
    console.log("Disconnected from MongoDB.");
}
