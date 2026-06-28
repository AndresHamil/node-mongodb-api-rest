import { connectMongo } from "../src/db.js";
import { DB_COLLECTION_USUARIOS } from "../src/config.js";

const run = async () => {
    const db = await connectMongo();
    const usuariosCollection = db.collection(DB_COLLECTION_USUARIOS);

    const indexes = await usuariosCollection.createIndexes([
        {
            key: { email: 1 },
            name: "uq_usuarios_email",
            unique: true,
        },
        {
            key: { usuario: 1 },
            name: "uq_usuarios_usuario",
            unique: true,
        },
    ]);

    console.log(JSON.stringify({ success: true, indexes }, null, 2));
    process.exit(0);
};

run().catch((error) => {
    console.error(JSON.stringify({ success: false, message: error.message, stack: error.stack }, null, 2));
    process.exit(1);
});