import {
    MONGO_URI,
    DB_DATABASE,
} from './config.js';
import { MongoClient } from "mongodb";

const client = new MongoClient(MONGO_URI);

let dbInstance = null;

export const connectMongo = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not configured.");
    }

    await client.connect();
    dbInstance = client.db(DB_DATABASE);

    return dbInstance;
};

export const getCollection = async (collectionName) => {
    const db = await connectMongo();
    return db.collection(collectionName);
};

export const closeMongo = async () => {
    if (!dbInstance) {
        return;
    }

    await client.close();
    dbInstance = null;
};

export { client };