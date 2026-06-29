import { app } from "../src/app.js";
import { connectMongo } from "../src/db.js";

export default async function handler(req, res) {
    try {
        await connectMongo();
        return app(req, res);
    } catch (error) {
        console.error("Database connection failed:", error?.message ?? error);

        return res.status(500).json({
            success: false,
            message: "No fue posible inicializar la API.",
            error: error?.message ?? "Unknown error",
            data: null,
        });
    }
}