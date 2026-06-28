import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarSucursalesFiltros = async (req, res) => {
    let { 
        id = null, 
        nombre = null, 
        descripcion = null, 
        fechaRegistro = null, 
        fechaActualizacion = null, 
        estado = null 
    } = req.body ?? {};

    const tableDb = "sucursales";

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
                sucursales.id,
                sucursales.nombre,
                sucursales.descripcion,
                sucursales.fecha_registro AS fechaRegistro,
                sucursales.fecha_actualizacion AS fechaActualizacion,
                sucursales.estado
            FROM 
                ${tableDb}
        `;

        const queryParams = [];
        const conditions = [];

        if (id != null) {
            conditions.push(`sucursales.id = ?`);
            queryParams.push(id);
        }
        if (nombre) {
            conditions.push(`sucursales.nombre LIKE ?`);
            queryParams.push(`%${nombre}%`);
        }
        if (descripcion) {
            conditions.push(`sucursales.descripcion LIKE ?`);
            queryParams.push(`%${descripcion}%`);
        }
        if (fechaRegistro) {
            conditions.push(`DATE(sucursales.fecha_registro) = ?`);
            queryParams.push(fechaRegistro);
        }
        if (fechaActualizacion) {
            conditions.push(`DATE(sucursales.fecha_actualizacion) = ?`);
            queryParams.push(fechaActualizacion);
        }
        if (estado != null) {
            conditions.push(`sucursales.estado = ?`);
            queryParams.push(estado);
        }
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` ORDER BY sucursales.nombre ASC LIMIT 20`;

        const [result] = await pool.query(query, queryParams);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
            resultConutRes = 0;
        } else {
            dataRes = result.map((sucursal) => ({
                id: sucursal.id,
                nombre: sucursal.nombre,
                descripcion: sucursal.descripcion,
                fechaRegistro: methods.formatearFecha(sucursal.fechaRegistro),
                fechaActualizacion: methods.formatearFecha(sucursal.fechaActualizacion),
                estado: sucursal.estado === 1 ? true : false      
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
