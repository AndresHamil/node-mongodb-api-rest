import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const registrarSucursal = async (req, res) => {
    let { 
        nombre = null, 
        descripcion = null 
    } = req.body ?? {};

    const tableDb = "sucursales";

    let successRes = true,
        messageRes = "Registro exitoso",
        errorRes = null,
        dataRes = null;

    try {
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(nombre, "El", "nombre", "string");
        methods.validarTipoDato(descripcion, "La", "descripcion", "string");
        // ------------------------------------------------------- [VALIDAR CONTENIDO]
        methods.validarRequerido(nombre, "El", "nombre");
        // ------------------------------------------------------- [VALIDAR TIPO CONTENIDO]
        methods.validarContenidoString(nombre, "El", "nombre");
        // ------------------------------------------------------- [LIMPIAR CONTENIDO]
        nombre = methods.limpiarEspacios(nombre);
        descripcion = methods.limpiarEspacios(descripcion);
        // ------------------------------------------------------- [VALIDAR LONGITUD CONTENIDO]
        methods.validarLongitudString(nombre, "El", "nombre", 50);
        methods.validarLongitudString(descripcion, "La", "descripcion", 200);
        // ------------------------------------------------------- [CAPITALIZAR CONTENIDO]
        nombre = methods.capitalizarTexto(nombre);
        descripcion = methods.capitalizarTexto(descripcion);

        const queryInsercion = `
            INSERT INTO ${tableDb} (nombre, descripcion) 
            VALUES (?, ?)
        `;

        const paramsInsercion = [nombre, descripcion];

        let [result] = await pool.query(queryInsercion, paramsInsercion);

        const id = result.insertId;

        const querySeleccion = `
            SELECT 
                sucursales.id,
                sucursales.nombre,
                sucursales.descripcion,
                sucursales.fecha_registro AS fechaRegistro,
                sucursales.fecha_actualizacion AS fechaActualizacion,
                sucursales.estado
            FROM ${tableDb}
            WHERE sucursales.id = ?
        `;

        const paramsSeleccion = [id];

        [result] = await pool.query(querySeleccion, paramsSeleccion);

        dataRes = result.map((sucursal) => {
            return {
                id: sucursal.id,
                nombre: sucursal.nombre,
                descripcion: sucursal.descripcion,
                fechaRegistro: methods.formatearFecha(sucursal.fechaRegistro),
                fechaActualizacion: methods.formatearFecha(sucursal.fechaActualizacion),
                estado: sucursal.estado === 1 ? true : false   
            };
        });

    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false;
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;

        if (error.customMessage) {
            messageRes = error.customMessage; 
        } else if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes("sucursales.nombre")) {
                messageRes = "Ya existe unsa sucursal con el mismo nombre.";
            } 
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