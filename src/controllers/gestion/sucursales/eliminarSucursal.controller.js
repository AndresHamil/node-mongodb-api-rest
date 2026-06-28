import { pool } from "../../../db.js";
import * as methods from "../../../utils/methods.js";

export const eliminarSucursal = async (req, res) => {
    const { id } = req.body;

    const tableDb = "sucursales";

    let successRes = true,
        messageRes = "Sucursal eliminada.",
        errorRes = null,
        dataRes = null;

    try {
        // ------------------------------------------------------- [VALIDAR CONTENIDO]
        methods.validarRequerido(id, "El", "id");
        // ------------------------------------------------------- [VALIDAR TIPO DATO]
        methods.validarTipoDato(id, "El", "id", "int");
        // ------------------------------------------------------- [ELIMINAR REGISTRO]
        const [result] = await pool.query(`DELETE FROM ${tableDb} WHERE id = ?`,[id]);
        // ------------------------------------------------------- [VALIDA SI AFECTO REGISTRO]
        if (!result.affectedRows) {
            successRes = false;
            messageRes = `No se encontró la sucursal con ID '${id}'.`;
            errorRes = `No record found for ID '${id}' in table '${tableDb}'.`;
        }
    } catch (error) {
        // ------------------------------------------------------- [CAPTURAR ERRORES]
        successRes = false;
        messageRes = "Ocurrió un error en el servidor";
        errorRes = error.message;

        if (error.customMessage) {
            messageRes = error.customMessage; 
        }
        else if (error.code === "ER_ROW_IS_REFERENCED_2") {
            messageRes ="No se puede eliminar esta sucursal porque tiene registros dependientes.";
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