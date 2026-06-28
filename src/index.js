// ----------------------------------------------------- [ IMPORTACIONES ]
import { PORT } from './config.js';
import { connectMongo } from "./db.js";
import { app } from "./app.js";
// ----------------------------------------------------- [ SALIDA DE CONSOLA ]
connectMongo()
    .then(() => {
        app.listen(PORT)
        console.log("Database connection established successfully.")
        console.log("Running server on port: ", PORT)
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message)
        process.exit(1)
    })