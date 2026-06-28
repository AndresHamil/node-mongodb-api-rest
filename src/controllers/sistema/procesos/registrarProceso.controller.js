import { pool } from "../../../db.js";

export const registrarProceso = async (req, res) => {
    const { nombre, descripcion, fkModuloId } = req.body;

    const tableDb = "procesos";

    let successRes = true,
        messageRes = "Registro exitoso",
        errorRes = null,
        dataRes = null;

    try {
        let [result] = await pool.query(
            `INSERT INTO ${tableDb}(nombre, descripcion, fk_modulo_id) 
             VALUES (?, ?, ?)`, 
            [nombre,descripcion, fkModuloId]
        );

        
        const id = result.insertId;

        [result] = await pool.query(
            `SELECT 
                procesos.id,
                procesos.nombre,
                procesos.descripcion,
                modulos.nombre AS modulo,
                procesos.fk_modulo_id AS fkModuloId,
                procesos.estado
             FROM ${tableDb} 
             JOIN 
                modulos ON procesos.fk_modulo_id = modulos.id
             WHERE procesos.id = ?
             ORDER BY procesos.id DESC`, 
            [id]
        );

        dataRes = result;

    } catch (error) {
        successRes = false;
        errorRes = error.message;
        dataRes = null;
        if (error.code === 'ER_DUP_ENTRY') {
            messageRes = "El proceso ya existe en el modulo";
        }else if (error.code === 'ER_NO_REFERENCED_ROW_2'){
            messageRes = "El modulo no existe";
        } else {
            messageRes = "Error en el servidor";
        }

    }

    // Construir la respuesta
    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    };

    // Enviar la respuesta al cliente
    res.json(response);
};