// ----------------------------------------------------- [ IMPORTACIONES ]
import { MONGODB_DEPLOYMENT_LABEL, PORT } from './config.js';
import { connectMongo } from "./db.js";
import { app } from "./app.js";
// ----------------------------------------------------- [ SALIDA DE CONSOLA ]
connectMongo()
    .then(() => {
        app.listen(PORT)
        console.log(`\x1b[94m➜  MongoDB Host:\x1b[0m ${MONGODB_DEPLOYMENT_LABEL}`)
        console.log("Database connection established successfully.")
        console.log("Running server on port: ", PORT)
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message)
        process.exit(1)
    })