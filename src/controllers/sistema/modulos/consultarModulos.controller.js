import { pool } from "../../../db.js";

export const consultarModulos = async (req, res) => {
    const tableDb = "modulos";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null,
        totalCount = 0;

    try {
        const [dataResult] = await pool.query(`
            SELECT 
                id, 
                nombre, 
                descripcion,
                tipo, 
                estado
            FROM 
                ${tableDb}
            ORDER BY id DESC
            LIMIT 20;
        `);

        dataRes = dataResult;

        const [[{ totalCount: count }]] = await pool.query(`SELECT COUNT(*) AS totalCount FROM ${tableDb};`);
        totalCount = count;

    } catch (error) {
        console.error("Error al consultar modulos:", error);

        return res.status(500).json({
            success: false,
            message: "Ocurrió un error en el servidor",
            error: error.message,
            data: null,
        });
    }

    res.json({
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
        totalCount: totalCount,
    });
};
