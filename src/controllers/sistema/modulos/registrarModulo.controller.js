import { pool } from "../../../db.js";

export const registrarModulo = async (req, res) => {
    const { nombre, descripcion, tipo } = req.body;

    let successRes = true,
        messageRes = "Registro exitoso",
        errorRes = null,
        dataRes = [];

    try {
        // Insertar el nuevo registro
        let [result] = await pool.query(
            `INSERT INTO modulos(nombre, descripcion, tipo) 
             VALUES (?, ?, ?)`, 
            [nombre, descripcion, tipo]
        );

        // Comprobar si la inserción fue exitosa antes de obtener el id
        const id = result.insertId;

        // Seleccionar el registro recién insertado
        [result] = await pool.query(
            `SELECT 
                id, 
                nombre, 
                descripcion,
                tipo, 
                estado
             FROM modulos 
             WHERE id = ?`, 
            [id]
        );



        // Si la consulta de selección es exitosa, asignamos el resultado
        dataRes = result;

    } catch (error) {
        successRes = false;
        errorRes = error.message;
        if (error.code === 'ER_DUP_ENTRY') {
            messageRes = "El modulo ya existe";
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