import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const registrarPerfil = async (req, res) => {
    let { 
        nombre = null, 
        descripcion = null 
    } = req.body ?? {};

    const tableDb = "perfiles";

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
                perfiles.id,
                perfiles.nombre,
                perfiles.descripcion,
                perfiles.fecha_registro AS fechaRegistro,
                perfiles.fecha_actualizacion AS fechaActualizacion,
                perfiles.estado
            FROM ${tableDb} 
            WHERE perfiles.id = ?
        `;

        const paramsSeleccion = [id];

        [result] = await pool.query(querySeleccion, paramsSeleccion);

        dataRes = result.map((perfil) => {
            return {
                id: perfil.id,
                nombre: perfil.nombre,
                descripcion: perfil.descripcion,
                fechaRegistro: methods.formatearFecha(perfil.fechaRegistro),
                fechaActualizacion: methods.formatearFecha(perfil.fechaActualizacion),
                estado: perfil.estado === 1 ? true : false      
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
            if (error.sqlMessage.includes("perfiles.nombre")) {
                messageRes = "Ya existe un perfil con el mismo nombre.";
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