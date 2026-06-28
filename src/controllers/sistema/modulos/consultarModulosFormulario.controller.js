import { pool } from "../../../db.js";

export const consultarModulosFormulario = async (req, res) => {
    const { nombre } = req.body;

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = [];

    try {
        // Construir la consulta con la condición de estado
        let query = `
            SELECT 
                id,
                nombre
            FROM modulos
            WHERE estado = 1
        `;
        const queryParams = [];

        if (nombre) {
            query += ` AND nombre LIKE ?`;
            queryParams.push(`${nombre}%`);
        }

        query += ` ORDER BY nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        dataRes = result;
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