import { pool } from "../../../db.js";

export const editarProceso = async (req, res) => {
    const { id, nombre, descripcion, fkModuloId , estado } = req.body;

    const tableDb = "procesos";

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Se requiere un ID.",
            error: null,
            data: null,
        });
    }

    let successRes = true,
        messageRes = "Edición exitosa",
        errorRes = null,
        dataRes = null;

    try {
        const [result] = await pool.query(
            `
            UPDATE ${tableDb} 
            SET 
                nombre = IFNULL(?, nombre), 
                descripcion = IFNULL(?, descripcion),
                fk_modulo_id = IFNULL(?, fk_modulo_id), 
                estado = IFNULL(?, estado) 
            WHERE id = ?
            `,
            [nombre, descripcion, fkModuloId, estado, id]
        );

        if (result.affectedRows) {
            const [updatedRecord] = await pool.query(
                `SELECT  
                    procesos.id,
                    procesos.nombre,
                    procesos.descripcion,
                    modulos.nombre AS modulo,
                    procesos.fk_modulo_id AS fkModuloId,
                    procesos.estado
                FROM ${tableDb} 
                JOIN modulos ON procesos.fk_modulo_id = modulos.id
                WHERE procesos.id = ?`,
                [id]
            );
            dataRes = updatedRecord;
        } else {
            successRes = false;
            messageRes = `El registro con id '${id}' no existe en la tabla '${tableDb}'.`;
            errorRes = `No record found for id '${id}' in table '${tableDb}'.`;
        }
    } catch (error) {
        successRes = false;
        errorRes = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            messageRes = "El proceso ya existe en el modulo";
        }else if (error.code === 'ER_NO_REFERENCED_ROW_2'){
            messageRes = "El modulo no existe";
        } else {
            messageRes = "Error en el servidor";
        }
    }

    res.json({
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    });
};