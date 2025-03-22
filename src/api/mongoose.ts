import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

mongoose.connect(uri);

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Failed to connect to MongoDB', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

export default db;