import { pool } from "../../../db.js";

export const consultarProcesosFiltros = async (req, res) => {
    const { nombre, modulo, fkModuloId, estado } = req.body;

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
                procesos.descripcion,
                modulos.nombre AS modulo,
                procesos.estado
            FROM ${tableDb}
            INNER JOIN modulos ON procesos.fk_modulo_id = modulos.id
            WHERE procesos.estado = 1
        `;
        const queryParams = [];

        if (nombre) {
            query += ` AND procesos.nombre LIKE ?`;
            queryParams.push(`${nombre}%`);
        }
        if (modulo) {
            query += ` AND modulos.nombre LIKE ?`;
            queryParams.push(`${modulo}%`);
        }
        if (fkModuloId) {
            query += ` AND modulos.id LIKE ?`;
            queryParams.push(`${fkModuloId}%`);
        }
        if (estado != null) {
            query += ` AND procesos.estado = ?`;
            queryParams.push(estado);
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
