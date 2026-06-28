import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const consultarSucursal = async (req, res) => {
    const { id } = req.body;
    const tableDb = "sucursales";

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
                sucursales.id,
                sucursales.nombre,
                sucursales.descripcion,
                sucursales.fecha_registro AS fechaRegistro,
                sucursales.fecha_actualizacion AS fechaActualizacion,
                sucursales.estado
            FROM ${tableDb}
            WHERE sucursales.id = ?
        `;
        const queryParamsConsulta = [id];

        const [result] = await pool.query(queryConsulta, queryParamsConsulta);

        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
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