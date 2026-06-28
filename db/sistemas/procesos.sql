-- CREAR TABLA PROCESOS
BEGIN
    CREATE TABLE procesos (
        id INT AUTO_INCREMENT PRIMARY KEY,  
        nombre VARCHAR(50) NOT NULL, 
        descripcion VARCHAR(200),
        fk_modulo_id INT NOT NULL,
        estado BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (fk_modulo_id) REFERENCES modulos(id) 
            ON DELETE RESTRICT
            ON UPDATE CASCADE,
        UNIQUE (nombre, fk_modulo_id)
    );
END;
-- INFORMACION DE LA TABLA
BEGIN
    DESCRIBE procesos;
END;
-- MOSTRAR TODOS LOS REGISTROS
BEGIN
    SELECT 
        procesos.id,
        procesos.nombre,
        modulos.nombre AS modulo,
        procesos.fk_modulo_id,
        procesos.estado
    FROM 
        procesos
    JOIN 
        modulos ON procesos.fk_modulo_id = modulos.id;
END;
-- INSERTAR REGISTRO
BEGIN
    INSERT INTO procesos (
        nombre,
        fk_modulo_id
    ) VALUES (
        'Modulos', 
        1 
    );
END;
-- FILTRAR REGISTROS
BEGIN
    SELECT
        procesos.id,
        procesos.nombre,
        procesos.descripcion,
        modulos.nombre AS modulo,
        procesos.estado
    FROM procesos
    INNER JOIN modulos ON procesos.fk_modulo_id = modulos.id
    WHERE procesos.estado = 1
    ORDER BY procesos.nombre ASC LIMIT 20
END;
-- EDITAR TODOS LOS CAMPOS DE UN REGISTRO POR ID
BEGIN
    UPDATE procesos
    SET 
        nombre = 'NuevoProceso',
        fk_modulo_id = 2,
        estado = FALSE
    WHERE id = 1;
END;
-- ELIMINAR UN REGISTRO POR ID
BEGIN
    DELETE FROM procesos
    WHERE id = 1;
END;
-- BORRAR TODOS LOS REGISTROS
BEGIN
    TRUNCATE TABLE procesos;
END;
-- ELIMINAR TABLA
BEGIN
    DROP TABLE procesos;
END;
