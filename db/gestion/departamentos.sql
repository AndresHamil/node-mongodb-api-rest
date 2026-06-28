-- CREAR TABLA DEPARTAMENTOS
BEGIN
    CREATE TABLE departamentos (
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
    DESCRIBE departamentos;
END;
-- MOSTRAR TODOS LOS REGISTROS
BEGIN
    SELECT 
        *
    FROM 
        departamentos
END;
-- INSERTAR REGISTRO
BEGIN
    INSERT INTO departamentos (
        nombre,
        descripcion
    ) VALUES (
        'Sistemas', 
        'Departamento para el desarrollo de productos digitales.' 
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
    UPDATE departamentos
    SET 
        id = 2
    WHERE id = 3;
END;
-- ELIMINAR UN REGISTRO POR ID
BEGIN
    DELETE FROM departamentos
    WHERE id = 4;
END;
-- BORRAR TODOS LOS REGISTROS
BEGIN
    TRUNCATE TABLE departamentos;
END;
-- ELIMINAR TABLA
BEGIN
    DROP TABLE departamentos;
END;
