import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarPerfil = async (req, res) => {
    const { id } = req.body;
    const tableDb = "perfiles";
    
    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null;

    try {
        // ------------------------------------------------------- [VALIDAR CONTENIDO]
        methods.validarRequerido(id, "El", "id");
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(id, "El", "id", "int");

        const queryConsulta = `
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
        const queryParamsConsulta = [id];

        const [result] = await pool.query(queryConsulta, queryParamsConsulta);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
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
        }
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
    };

    res.json(response);
};