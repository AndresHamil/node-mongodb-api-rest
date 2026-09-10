import {
    IS_LOCAL_MONGODB,
    MONGODB_URI,
    MONGODB_DATABASE_NAME,
} from './config.js';
import { MongoClient, ServerApiVersion } from "mongodb";

const normalizedMongoUri = MONGODB_URI?.trim?.();
const normalizedDatabaseName = MONGODB_DATABASE_NAME?.trim?.() || 'ValianDB';

let client = null;
let clientPromise = null;

let dbInstance = null;

const createMongoClient = () => {
    return new MongoClient(normalizedMongoUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        ...(!IS_LOCAL_MONGODB ? {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: false,
                deprecationErrors: true,
            },
            tls: true,
            retryWrites: true,
        } : {}),
    });
};

export const connectMongo = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    if (!normalizedMongoUri) {
        throw new Error("MONGODB_URI is not configured.");
    }

    console.log("[MongoDB] Conectando a:", {
        uri: normalizedMongoUri,
        database: normalizedDatabaseName,
        isLocal: IS_LOCAL_MONGODB,
    });

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

    console.log("[MongoDB] Conectado exitosamente a base de datos:", normalizedDatabaseName);

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