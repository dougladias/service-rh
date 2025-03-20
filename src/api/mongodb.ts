import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(process.env.MONGODB_DB);
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

export { connectToDatabase, client };