import { MongoClient } from 'mongodb';


const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_NAME;
const client = new MongoClient(url);

// database connection
export async function connect() {
    try {
        await client.connect();
        console.error('Connected to MongoDB!');
        return client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}