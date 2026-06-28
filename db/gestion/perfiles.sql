-- CREAR TABLA PERFILES
BEGIN
    CREATE TABLE perfiles (
        id INT AUTO_INCREMENT PRIMARY KEY,  
        nombre VARCHAR(50) NOT NULL, 
        descripcion VARCHAR(200),
        estado BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        fecha_actualizacion TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
        UNIQUE (nombre)
    );
END;
-- INFORMACION DE LA TABLA
BEGIN
    DESCRIBE perfiles;
END;
-- MOSTRAR TODOS LOS REGISTROS
BEGIN
    SELECT 
        *
    FROM 
        perfiles
END;
-- INSERTAR REGISTRO
BEGIN
    INSERT INTO perfiles (
        nombre,
        descripcion
    ) VALUES (
        'Sistemas', 
        'Perfil para el desarrollo de productos digitales.' 
    );
END;
-- FILTRAR REGISTROS
BEGIN
    SELECT
        perfiles.id,
        perfiles.nombre,
        perfiles.descripcion,
        perfiles.estado
    FROM perfiles
    WHERE perfiles.estado = TRUE
    ORDER BY perfiles.nombre ASC LIMIT 20
END;
-- EDITAR TODOS LOS CAMPOS DE UN REGISTRO POR ID
BEGIN
    UPDATE perfiles
    SET 
        nombre = 'Sistemas',
        descripcion = "Perfil para el desarrollo de productos digitales.",
        estado = TRUE
    WHERE id = 1;
END;
-- ELIMINAR UN REGISTRO POR ID
BEGIN
    DELETE FROM perfiles
    WHERE id = 1;
END;
-- BORRAR TODOS LOS REGISTROS
BEGIN
    TRUNCATE TABLE perfiles;
END;
-- ELIMINAR TABLA
BEGIN
    DROP TABLE perfiles;
END;
