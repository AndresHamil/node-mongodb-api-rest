import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const editarPerfil = async (req, res) => {
    let { 
        id = null, 
        nombre = null, 
        descripcion = null, 
        estado = null
    } = req.body ?? {};

    const tableDb = "perfiles";

    let successRes = true,
        messageRes = "Edición exitosa",
        errorRes = null,
        dataRes = null;

    try {
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(nombre, "El", "nombre", "string");
        methods.validarTipoDato(descripcion, "La", "descripcion", "string");
        methods.validarTipoDato(estado, "El", "estado", "bool");
        // ------------------------------------------------------- [VALIDAR CONTENIDO]
        methods.validarRequeridoEdicion(nombre, "El", "nombre");
        // ------------------------------------------------------- [VALIDAR TIPO CONTENIDO]
        methods.validarContenidoString(nombre, "El", "nombre");
        // // ------------------------------------------------------- [LIMPIAR CONTENIDO]
        nombre = methods.limpiarEspacios(nombre);
        descripcion = methods.limpiarEspacios(descripcion);
        // ------------------------------------------------------- [CAPITALIZAR CONTENIDO]
        nombre = methods.capitalizarTexto(nombre);
        descripcion = methods.capitalizarTexto(descripcion);
        // ------------------------------------------------------- [ACTUALIZAR REGISTRO]
        const queryActualizacion = `
            UPDATE ${tableDb} 
            SET 
                nombre = CASE 
                    WHEN ? IS NULL THEN nombre  
                    WHEN ? = '' THEN nombre 
                    ELSE ?  
                END,
                descripcion = CASE 
                    WHEN ? IS NULL THEN descripcion 
                    WHEN ? = '' THEN NULL 
                    ELSE ?   
                END,
                estado = CASE 
                    WHEN ? IS NULL THEN estado 
                    ELSE ? 
                END
            WHERE id = ?
        `;
        const queryParamsActualizacion = [
            nombre, nombre, nombre,
            descripcion, descripcion, descripcion,
            estado, estado, 
            id
        ];

        const [result] = await pool.query(queryActualizacion, queryParamsActualizacion);
        // ------------------------------------------------------- [SELECCIONAR REGISTRO ACTUALIZADO]
        if (result.affectedRows) {
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
            const queryParamsSeleccion = [id];

            const [updatedRecord] = await pool.query(querySeleccion, queryParamsSeleccion);

            dataRes = updatedRecord.map((perfil) => {
                return {
                    id: perfil.id,
                    nombre: perfil.nombre,
                    descripcion: perfil.descripcion,
                    fechaRegistro: methods.formatearFecha(perfil.fechaRegistro),
                    fechaActualizacion: methods.formatearFecha(perfil.fechaActualizacion),
                    estado: perfil.estado === 1 ? true : false      
                };
            });

        } else {
            successRes = false;
            messageRes = `El registro con id '${id}' no existe en la tabla '${tableDb}'.`;
            errorRes = `No record found for id '${id}' in table '${tableDb}'.`;
        }
    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false
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