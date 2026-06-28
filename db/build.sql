----------------------------------------------------------------------------------------------------------------------- [ BUILD ]
DROP DATABASE empresa;
CREATE DATABASE  IF NOT EXISTS empresa;
USE empresa;
SHOW tables;
----------------------------------------------------------------------------------------------------------------------- [ SUCURSALES TABLA ]
CREATE TABLE sucursales (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL, 
    descripcion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    fecha_actualizacion TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    estado BOOLEAN DEFAULT TRUE,
    UNIQUE (nombre)
);
INSERT INTO sucursales (nombre, descripcion) 
    VALUES (
        'Torreón', 
        'Codigo postal 36000'
    ),(
        'Gomez palacio', 
        'Codigo postal 35000'
    );
----------------------------------------------------------------------------------------------------------------------- [ DEPARTAMENTOS TABLA ]
CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL, 
    descripcion VARCHAR(200),
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    fecha_actualizacion TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    UNIQUE (nombre)
);
INSERT INTO departamentos (nombre, descripcion) 
    VALUES (
        'Sistemas', 
        'Departamento para el desarrollo de productos digitales.'
    ),(
        'Recursos humanos', 
        'Departamento para la gestion corporativa.'
    );
----------------------------------------------------------------------------------------------------------------------- [ PERFILES TABLA ]
CREATE TABLE perfiles (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL, 
    descripcion VARCHAR(200),
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    fecha_actualizacion TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    UNIQUE (nombre)
);
INSERT INTO perfiles (nombre, descripcion) 
    VALUES (
        'Desarrollador Frontend', 
        'Perfil para el desarrollo de productos digitales del lado del cliente.'
    ),(
        'Desarrollador Backend', 
        'Perfil para el desarrollo de productos digitales del lado del servidor.'
    );
----------------------------------------------------------------------------------------------------------------------- [ USUARIOS TABLA ]
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL, 
    apellido VARCHAR(50) NOT NULL, 
    usuario VARCHAR(50) NOT NULL UNIQUE, 
    email VARCHAR(100) UNIQUE, 
    telefono VARCHAR(15), 
    password VARCHAR(255) NOT NULL, 
    fk_sucursal_id INT NOT NULL,
    fk_departamento_id INT NOT NULL,
    fk_perfil_id INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE, 
    sesion BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    fecha_actualizacion TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (fk_sucursal_id) REFERENCES sucursales(id) 
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (fk_departamento_id) REFERENCES departamentos(id) 
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (fk_perfil_id) REFERENCES perfiles(id) 
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    UNIQUE (fk_sucursal_id, fk_departamento_id, fk_perfil_id, nombre, apellido),
    UNIQUE (usuario, email)
);
INSERT INTO usuarios (nombre, apellido, usuario, email, telefono, password, fk_sucursal_id, fk_departamento_id, fk_perfil_id) 
    VALUES (
        'Luis Andres',
        'Rodriguez Campos',
        'luis.rodriguez.3152552959',
        'luis.rodriguesz@gmailss.com',
        '8713465734',
        '$2b$10$bXYGNi1U7qBxnkodOl32nOhem1AQQysl5pQsANdc9NlqhVLqBnUmK',
        1,
        1,
        1
    ),(
        'Francisco Eduardo',
        'Rodriguez Campos',
        'francisco.rodriguez.3152552959',
        'francisco.rodriguez@gmail.com	',
        '8713465734',
        '$2b$10$RFvHH.gROrAOXmfMWgGOzey2Fe7bYcupUSePYPp5Okno8E3STMVSa',
        1,
        1,
        1
    );

































----------------------------------------------------------------------------------------------------------------------- [ SESIONES TABLA ]
CREATE TABLE sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    fk_user_id INT NOT NULL, 
    dispositivo VARCHAR(255) NULL,
    token VARCHAR(255) NOT NULL, 
    session_start DATETIME NOT NULL,
    session_expiry DATETIME NOT NULL,
    FOREIGN KEY (fk_user_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE INDEX idx_token (token)
);
----------------------------------------------------------------------------------------------------------------------- [ SESIONES FUNSIONES ]
SELECT * FROM sesiones;
DESCRIBE sesiones;
DROP TABLE sesiones;
TRUNCATE TABLE sesiones;
----------------------------------------------------------------------------------------------------------------------- [ SESIONES INTERACTUAR ]
INSERT INTO sesiones(
	fk_usuario_id,
	dispositivo, 
    token
) VALUES (
	1,
	'Chrome', 
    'kdgflhsgdfkjaghsdawljhsd;jhfk'
);
----------------------------------------------------------------------------------------------------------------------- [ MODULOS TABLA ]
CREATE TABLE modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL UNIQUE, 
    descripcion VARCHAR(50),
    tipo BOOLEAN,
    estado BOOLEAN DEFAULT TRUE
);
----------------------------------------------------------------------------------------------------------------------- [ MODULOS FUNSIONES ]
SELECT * FROM modulos;
DESCRIBE modulos;
DROP TABLE modulos;
TRUNCATE TABLE modulos;
----------------------------------------------------------------------------------------------------------------------- [ MODULOS INTERACTUAR ]
INSERT INTO modulos(
	nombre,
    descripcion,
	tipo 
) VALUES (
	'Sistemas', 
    'Modulo para la administracion del sistema en general',
    true
);
----------------------------------------------------------------------------------------------------------------------- [ PROCESOS TABLA ]
CREATE TABLE procesos (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL UNIQUE, 
    url  VARCHAR(50) NOT NULL UNIQUE, 
    fk_modulo_id INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fk_modulo_id) REFERENCES modulos(id) ON DELETE CASCADE ON UPDATE CASCADE
);
----------------------------------------------------------------------------------------------------------------------- [ PROCESOS FUNSIONES ]
SELECT * FROM procesos;
DESCRIBE procesos;
DROP TABLE procesos;
TRUNCATE TABLE procesos;
----------------------------------------------------------------------------------------------------------------------- [ PROCESOS INTERACTUAR ]
INSERT INTO procesos(
	nombre,
	url,
    fk_modulo_id
) VALUES (
	'Modulos', 
    'modulos/modulos',
    1
);