import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarSucursalesFormulario = async (req, res) => {
    let { 
        nombre = null 
    } = req.body ?? {};

    const tableDb = "sucursales";

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
                sucursales.id,
                sucursales.nombre
            FROM ${tableDb}
        `;

        const queryParams = [];
        const conditions = [];

        if (nombre) {
            conditions.push(`(sucursales.nombre LIKE ?)`);
            queryParams.push(`%${nombre}%`, `%${nombre}%`);
        }

        conditions.push(`sucursales.estado = 1`);
        query += ` WHERE ` + conditions.join(" AND ");
        query += ` ORDER BY sucursales.nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
            dataRes = result.map((sucursal) => {
                return {
                    id: sucursal.id,
                    nombre: sucursal.nombre
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