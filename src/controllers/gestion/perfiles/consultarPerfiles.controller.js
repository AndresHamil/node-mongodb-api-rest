import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarPerfiles = async (req, res) => {
    const tableDb = "perfiles"; 

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null,
        totalCountRes = 0;

    try {
        const [result] = await pool.query(`
            SELECT 
                perfiles.id,
                perfiles.nombre,
                perfiles.descripcion,
                perfiles.fecha_registro AS fechaRegistro,
                perfiles.fecha_actualizacion AS fechaActualizacion,
                perfiles.estado
            FROM 
                ${tableDb}
            ORDER BY perfiles.id DESC
            LIMIT 20;
        `);

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

        const [[{ totalCount: count }]] = await pool.query(`SELECT COUNT(*) AS totalCount FROM ${tableDb};`);
        
        totalCountRes = count;

    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;
    }
    // ------------------------------------------------------- [RESPUESTA DEL SERIVODR]
    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
        totalCount: totalCountRes
    };

    res.json(response);
};