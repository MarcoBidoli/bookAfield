import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookafield';
if (!uri) {
    throw new Error('MONGO_URI is missing from environment variables (.env).');
}
const client = new MongoClient(uri);

let db;

export async function connectDB() {
    if(!db) {
        await client.connect();
        db = client.db();
        console.log('MongoDB connected successfully.');
    }
    return db;
}

export function getDB() {
    if(!db) {
        throw new Error('Database not initialized. Call connect_db first.');
    }
    return db;
}

export async function closeDB() {
    await client.close();
    db = null;
    console.log('MongoDB disconnected successfully.');
}

export {client};