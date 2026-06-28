import { pool } from "../../../db.js";

export const editarModulo = async (req, res) => {
    const { id, nombre, descripcion, tipo, estado } = req.body;

    const tableDb = "modulos";

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
                tipo = IFNULL(?, tipo), 
                estado = IFNULL(?, estado) 
            WHERE id = ?
            `,
            [nombre, descripcion, tipo, estado, id]
        );

        if (result.affectedRows) {
            const [updatedRecord] = await pool.query(
                `SELECT * FROM ${tableDb} WHERE id = ?`,
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
        messageRes =
            error.code === "ER_DUP_ENTRY"
                ? "Ya existe un registro con el mismo nombre."
                : "Ocurrió un error en el servidor.";
    }

    res.json({
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    });
};