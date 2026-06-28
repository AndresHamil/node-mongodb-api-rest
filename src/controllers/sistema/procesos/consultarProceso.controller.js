import { pool } from "../../../db.js";


export const consultarProceso = async (req, res) =>{

    const {id} = req.body;

    const tableDb = "procesos";

    let successRes = true,
        messageRes = "Consulta exitosa",
        errorRes = null,
        dataRes = null;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Se requiere un ID.",
            error: "ID field is missing in the request.",
            data: null,
        });
    }

    try {
        const [result] = await pool.query(`
            SELECT 
                procesos.id,
                procesos.nombre,
                modulos.nombre AS modulo,
                procesos.fk_modulo_id AS fkModuloId,
                procesos.estado
            FROM 
                ${tableDb}
            JOIN 
                modulos ON procesos.fk_modulo_id = modulos.id
            WHERE procesos.id = ?`,
            [id]
        );



        if (result.length === 0) {
            messageRes = "No se encontraron registros";
        } else {
            dataRes = result;
        }

    } catch (error) {
        successRes = false
        errorRes = error.message
        messageRes = "Ocurrió un error en el servidor", 
        console.error("Error al consultar modulo:", error);
    }

    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    }
    res.json(response)
}