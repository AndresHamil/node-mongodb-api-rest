import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarPerfilesFormulario = async (req, res) => {
    let { 
        nombre = null 
    } = req.body ?? {};

    const tableDb = "perfiles";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null;

    try {
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(nombre, "El", "nombre", "string");
        // ------------------------------------------------------- [LIMPIAR CONTENIDO]
        nombre = methods.limpiarEspacios(nombre);

        let query = `
            SELECT 
                perfiles.id,
                perfiles.nombre
            FROM ${tableDb}
        `;

        const queryParams = [];
        const conditions = [];

        if (nombre) {
            conditions.push(`(perfiles.nombre LIKE ?)`);
            queryParams.push(`%${nombre}%`, `%${nombre}%`);
        }

        conditions.push(`perfiles.estado = 1`);
        query += ` WHERE ` + conditions.join(" AND ");
        query += ` ORDER BY perfiles.nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
            dataRes = result.map((perfil) => {
                return {
                    id: perfil.id,
                    nombre: perfil.nombre
                };
            });
        }
    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;

        if (error.customMessage) {
            messageRes = error.customMessage;       
        } 
    }
    // ------------------------------------------------------- [RESPUESTA DEL SERIVODR]
    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    };

    res.json(response);
};