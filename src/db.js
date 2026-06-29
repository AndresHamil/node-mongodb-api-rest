import {
    MONGO_URI,
    DB_DATABASE,
} from './config.js';
import { MongoClient, ServerApiVersion } from "mongodb";

const normalizedMongoUri = MONGO_URI?.trim?.();
const normalizedDatabaseName = DB_DATABASE?.trim?.() || 'ValianDB';

let client = null;
let clientPromise = null;

let dbInstance = null;

const createMongoClient = () => {
    return new MongoClient(normalizedMongoUri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: false,
            deprecationErrors: true,
        },
        tls: true,
        retryWrites: true,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });
};

export const connectMongo = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    if (!normalizedMongoUri) {
        throw new Error("MONGO_URI is not configured.");
    }

    if (!client) {
        client = createMongoClient();
    }

    if (!clientPromise) {
        clientPromise = client.connect().catch((error) => {
            clientPromise = null;
            client = null;
            dbInstance = null;
            throw error;
        });
    }

    await clientPromise;
    dbInstance = client.db(normalizedDatabaseName);

    return dbInstance;
};

export const getCollection = async (collectionName) => {
    const db = await connectMongo();
    return db.collection(collectionName);
};

export const closeMongo = async () => {
    if (!client) {
        return;
    }

    await client.close();
    dbInstance = null;
    clientPromise = null;
    client = null;
};

export { client };