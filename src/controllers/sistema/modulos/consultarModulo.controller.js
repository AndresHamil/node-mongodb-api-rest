import { pool } from "../../../db.js";

export const consultarModulo = async (req, res) => {
    const { id } = req.body;

    const tableDb = "modulos";

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
        const [result] = await pool.query(
            `
            SELECT 
                id, 
                nombre, 
                descripcion,
                tipo, 
                estado
            FROM ${tableDb} 
            WHERE id = ?`,
            [id]
        );

        if (result.length === 0) {
            successRes = false;
            messageRes = "No se encontraron registros";
            errorRes = "No records found for the provided ID.";
        } else {
            dataRes = result;
        }
    } catch (error) {
        successRes = false;
        errorRes = error.message;
        messageRes = "Ocurrió un error en el servidor";
        console.error("Error al consultar módulo:", error);
    }

    const response = {
        success: successRes,
        message: messageRes,
        error: errorRes,
        data: dataRes,
    };
    res.json(response);
};
