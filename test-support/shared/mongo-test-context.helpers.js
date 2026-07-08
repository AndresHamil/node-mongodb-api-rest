import { ObjectId } from "mongodb";
import { closeMongo, connectMongo } from "../../src/db.js";

export const createTrackedIds = () => {
    const ids = new Set();

    return {
        hasIds: () => ids.size > 0,
        trackId: (id) => {
            ids.add(id.toString());
        },
        toObjectIds: () => Array.from(ids, (id) => new ObjectId(id)),
        clear: () => {
            ids.clear();
        },
    };
};

export const createMongoTestContext = ({ parentContext, cleanupOwnData }) => {
    const setupDatabase = async () => {
        if (parentContext) {
            await parentContext.setupDatabase();
            return;
        }

        await connectMongo();
    };

    const cleanupTestData = async () => {
        await cleanupOwnData();

        if (parentContext) {
            await parentContext.cleanupTestData();
        }
    };

    const teardownDatabase = async () => {
        await cleanupTestData();

        if (parentContext) {
            await parentContext.teardownDatabase();
            return;
        }

        await closeMongo();
    };

    return {
        setupDatabase,
        cleanupTestData,
        teardownDatabase,
    };
};