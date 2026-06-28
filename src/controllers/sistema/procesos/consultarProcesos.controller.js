import { pool } from "../../../db.js";

export const consultarProcesos = async (req, res) => {
    const tableDb = "procesos";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null,
        totalCount = 0;

    try {
        const [dataResult] = await pool.query(`
            SELECT 
                procesos.id,
                procesos.nombre,
                modulos.nombre AS modulo,
                procesos.fk_modulo_id AS fkModuloId,
                procesos.estado
            FROM 
                ${tableDb}
            JOIN 
                modulos ON procesos.fk_modulo_id = modulos.id
            ORDER BY procesos.id DESC
            LIMIT 20;
        `);

        dataRes = dataResult.length ? dataResult : null;

        const [[{ totalCount: count }]] = await pool.query(`SELECT COUNT(*) AS totalCount FROM ${tableDb};`);
        totalCount = count;

    } catch (error) {
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
