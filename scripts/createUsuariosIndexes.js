import { connectMongo } from "../src/db.js";

const run = async () => {
    const db = await connectMongo();
    const usuariosCollection = db.collection("usuarios");

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