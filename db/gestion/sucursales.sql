-- CREAR TABLA
BEGIN
    CREATE TABLE sucursales (
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
    DESCRIBE sucursales;
END;
-- MOSTRAR TODOS LOS REGISTROS
BEGIN
    SELECT 
        sucursales.id,
        sucursales.nombre,
        sucursales.descripcion,
        sucursales.estado,
        sucursales.fecha_registro AS fechaRegistro,
        sucursales.fecha_actualizacion AS fechaActualizacion
    FROM 
        sucursales
END;
-- INSERTAR REGISTRO
BEGIN
    INSERT INTO sucursales (
        nombre,
        descripcion
    ) VALUES (
        'Gomez palacio', 
        'Codigo postal 35000' 
    );
END;
-- FILTRAR REGISTROS
BEGIN
    SELECT
        sucursales.id,
        sucursales.nombre,
        sucursales.descripcion,
        sucursales.estado,
        sucursales.fecha_registro AS fechaRegistro,
        sucursales.fecha_actualizacion AS fechaActualizacion
    FROM sucursales
    WHERE sucursales.nombre LIKE '%Gomez%';
    ORDER BY sucursales.nombre ASC LIMIT 20
END;
-- EDITAR TODOS LOS CAMPOS DE UN REGISTRO POR ID
BEGIN
    UPDATE sucursales SET 
        sucursales.nombre = "Lerdoo",
        sucursales.descripcion = "Codigo postal 35000",
        sucursales.estado = false
    WHERE sucursales.id = 3;       
END;
-- ELIMINAR UN REGISTRO POR ID
BEGIN
    DELETE FROM sucursales
    WHERE id = 1;
END;
-- BORRAR TODOS LOS REGISTROS
BEGIN
    TRUNCATE TABLE sucursales;
END;
-- ELIMINAR TABLA
BEGIN
    DROP TABLE sucursales;
END;
