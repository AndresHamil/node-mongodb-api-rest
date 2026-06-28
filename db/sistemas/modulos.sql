-- CREAR TABLA MODULOS
BEGIN
    CREATE TABLE modulos (
        id INT AUTO_INCREMENT PRIMARY KEY,  
        nombre VARCHAR(50) NOT NULL UNIQUE, 
        descripcion VARCHAR(50),
        tipo BOOLEAN,
        estado BOOLEAN DEFAULT TRUE
    );
END;
-- INFORMACION DE LA TABLA
BEGIN
    DESCRIBE modulos;
END;
-- MOSTRAR TODOS LOS REGISTROS
BEGIN
    SELECT * FROM modulos;
END;
-- INSERTAR REGISTRO
BEGIN
    INSERT INTO modulos (
        nombre,
        descripcion,
        tipo 
    ) VALUES (
        'Sistemas', 
        'Modulo para la administracion del sistema en general',
        true
    );
END;
-- EDITAR TODOS LOS CAMPOS DE UN REGISTRO POR ID
BEGIN
    UPDATE modulos
    SET 
        nombre = 'NuevoNombre',
        descripcion = 'Nueva descripcion',
        tipo = false,
        estado = false
    WHERE id = 1;
END;
-- ELIMINAR UN REGISTRO POR ID
BEGIN
    DELETE FROM modulos
    WHERE id = 1;
END;
-- BORRAR TODOS LOS REGISTROS
BEGIN
    TRUNCATE TABLE modulos;
END;
-- ELIMINAR TABLA
BEGIN
    DROP TABLE modulos;
END;
