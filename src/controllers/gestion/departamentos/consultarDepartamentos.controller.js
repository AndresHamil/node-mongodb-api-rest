import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarDepartamentos = async (req, res) => {
    const tableDb = "departamentos"; 

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null,
        totalCountRes = 0;

    try {
        const [result] = await pool.query(`
            SELECT 
                departamentos.id,
                departamentos.nombre,
                departamentos.descripcion,
                departamentos.fecha_registro AS fechaRegistro,
                departamentos.fecha_actualizacion AS fechaActualizacion,
                departamentos.estado
            FROM 
                ${tableDb}
            ORDER BY departamentos.id DESC
            LIMIT 20;
        `);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
            dataRes = result.map((departamento) => {
                return {
                    id: departamento.id,
                    nombre: departamento.nombre,
                    descripcion: departamento.descripcion,
                    fechaRegistro: methods.formatearFecha(departamento.fechaRegistro),
                    fechaActualizacion: methods.formatearFecha(departamento.fechaActualizacion),
                    estado: departamento.estado === 1 ? true : false                
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