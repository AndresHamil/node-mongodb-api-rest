import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarPerfilesFiltros = async (req, res) => {
    let { 
        id = null, 
        nombre = null, 
        descripcion = null, 
        fechaRegistro = null, 
        fechaActualizacion = null, 
        estado = null 
    } = req.body ?? {};

    const tableDb = "perfiles";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null,
        totalCountRes = null,
        resultConutRes = null

    try {
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(id, "El", "id", "int");
        methods.validarTipoDato(nombre, "El", "nombre", "string");
        methods.validarTipoDato(descripcion, "La", "descripcion", "string");
        methods.validarTipoDato(fechaRegistro, "La", "fechaRegistro", "string");
        methods.validarTipoDato(fechaActualizacion, "La", "fechaActualizacion", "string");
        methods.validarTipoDato(estado, "El", "estado", "bool");
        // ------------------------------------------------------- [LIMPIAR CONTENIDO]
        nombre = methods.limpiarEspacios(nombre);
        descripcion = methods.limpiarEspacios(descripcion);

        let query = `
            SELECT 
                perfiles.id,
                perfiles.nombre,
                perfiles.descripcion,
                perfiles.fecha_registro AS fechaRegistro,
                perfiles.fecha_actualizacion AS fechaActualizacion,
                perfiles.estado
            FROM 
                ${tableDb}
        `;

        const queryParams = [];
        const conditions = [];

        if (id != null) {
            conditions.push(`perfiles.id = ?`);
            queryParams.push(id);
        }
        if (nombre) {
            conditions.push(`perfiles.nombre LIKE ?`);
            queryParams.push(`%${nombre}%`);
        }
        if (descripcion) {
            conditions.push(`perfiles.descripcion LIKE ?`);
            queryParams.push(`%${descripcion}%`);
        }
        if (fechaRegistro) {
            conditions.push(`DATE(perfiles.fecha_registro) = ?`);
            queryParams.push(fechaRegistro);
        }
        if (fechaActualizacion) {
            conditions.push(`DATE(perfiles.fecha_actualizacion) = ?`);
            queryParams.push(fechaActualizacion);
        }
        if (estado != null) {
            conditions.push(`perfiles.estado = ?`);
            queryParams.push(estado);
        }
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` ORDER BY perfiles.nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
            resultConutRes = 0;
        } else {
            dataRes = result.map((perfil) => ({
                id: perfil.id,
                nombre: perfil.nombre,
                descripcion: perfil.descripcion,
                fechaRegistro: methods.formatearFecha(perfil.fechaRegistro),
                fechaActualizacion: methods.formatearFecha(perfil.fechaActualizacion),
                estado: perfil.estado === 1 ? true : false      
            }));

            resultConutRes = dataRes.length; 
        }

        const [[{ totalCount: count }]] = await pool.query(`SELECT COUNT(*) AS totalCount FROM ${tableDb};`);
        
        totalCountRes = count;
        
    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false;
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
        totalCount: totalCountRes,
        resultConut: resultConutRes
    };

    res.json(response);
};