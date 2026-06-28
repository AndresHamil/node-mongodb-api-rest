import { pool } from "../../../db.js";

export const consultarProcesosFormulario = async (req, res) => {
    const { nombre } = req.body;

    const tableDb = "procesos";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = [];

    try {
        // Construir la consulta con la condición de estado
        let query = `
            SELECT 
                procesos.id,
                procesos.nombre, 
                modulos.nombre AS modulo
            FROM ${tableDb}
            INNER JOIN modulos ON procesos.fk_modulo_id = modulos.id
            WHERE procesos.estado = 1
        `;
        const queryParams = [];

        if (nombre) {
            query += ` AND procesos.nombre LIKE ?`;
            queryParams.push(`${nombre}%`);
        }

        query += ` ORDER BY procesos.nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        dataRes = result.length ? result : null;
    } catch (error) {
        successRes = false;
        messageRes = "Error en el servidor";
        errorRes = error.message;
    }

    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    };
    res.json(response);
};
