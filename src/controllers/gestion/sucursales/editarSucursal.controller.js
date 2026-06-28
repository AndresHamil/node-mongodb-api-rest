import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const editarSucursal = async (req, res) => {
    let { 
        id = null, 
        nombre = null, 
        descripcion = null, 
        estado = null
    } = req.body ?? {};

    const tableDb = "sucursales";

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
                    sucursales.id,
                    sucursales.nombre,
                    sucursales.descripcion,
                    sucursales.fecha_registro AS fechaRegistro,
                    sucursales.fecha_actualizacion AS fechaActualizacion,
                    sucursales.estado
                FROM ${tableDb} 
                WHERE sucursales.id = ?
            `;
            const queryParamsSeleccion = [id];

            const [updatedRecord] = await pool.query(querySeleccion, queryParamsSeleccion);

            dataRes = updatedRecord.map((sucursal) => {
                return {
                    id: sucursal.id,
                    nombre: sucursal.nombre,
                    descripcion: sucursal.descripcion,
                    fechaRegistro: methods.formatearFecha(sucursal.fechaRegistro),
                    fechaActualizacion: methods.formatearFecha(sucursal.fechaActualizacion),
                    estado: sucursal.estado === 1 ? true : false      
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
            if (error.sqlMessage.includes("sucursales.nombre")) {
                messageRes = "Ya existe una sucursal con el mismo nombre.";
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