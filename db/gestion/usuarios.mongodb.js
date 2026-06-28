/*
  Script de inicialización para MongoDB / mongosh / MongoDB Compass Playground.

  Qué hace:
  1. Usa la base de datos configurada en DATABASE_NAME.
  2. Crea las colecciones usuarios y sesiones si no existen.
  3. Aplica validadores JSON Schema profesionales.
  4. Crea índices para usuarios y sesiones.
  5. Inserta el primer usuario si todavía no existe.

  Credenciales iniciales del usuario sembrado:
  - email: admin@valian.local
  - usuario: admin.root.001
  - password real: Admin123!

  La contraseña ya está guardada como hash bcrypt.
*/

const DATABASE_NAME = "valianDB";
const USUARIOS_COLLECTION_NAME = "usuarios";
const SESIONES_COLLECTION_NAME = "sesiones";

/*
  Metodo para definir el validador estructural de la colección usuarios.

  Este esquema obliga a que cada documento conserve la forma esperada por la API:
  datos personales mínimos, credenciales persistidas como hash, banderas de estado
  y trazabilidad temporal para auditoría básica.
*/
const usuariosValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "nombre",
      "apellido",
      "usuario",
      "email",
      "password",
      "estado",
      "sesion",
      "fechaRegistro",
      "fechaActualizacion"
    ],
    properties: {
      nombre: {
        bsonType: "string",
        minLength: 1,
        maxLength: 50,
        description: "Nombre obligatorio del usuario"
      },
      apellido: {
        bsonType: "string",
        minLength: 1,
        maxLength: 50,
        description: "Apellido obligatorio del usuario"
      },
      usuario: {
        bsonType: "string",
        minLength: 3,
        maxLength: 80,
        description: "Username único del usuario"
      },
      email: {
        bsonType: "string",
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        maxLength: 100,
        description: "Correo electrónico único del usuario"
      },
      telefono: {
        bsonType: ["string", "null"],
        pattern: "^([0-9]{10})?$",
        description: "Teléfono opcional de 10 dígitos"
      },
      password: {
        bsonType: "string",
        minLength: 20,
        maxLength: 255,
        description: "Hash bcrypt de la contraseña"
      },
      estado: {
        bsonType: "bool",
        description: "Estado lógico del usuario"
      },
      sesion: {
        bsonType: "bool",
        description: "Indica si el usuario tiene sesiones activas"
      },
      fechaRegistro: {
        bsonType: "date",
        description: "Fecha de creación del documento"
      },
      fechaActualizacion: {
        bsonType: "date",
        description: "Fecha de última actualización"
      }
    }
  }
};

/*
  Metodo para definir el validador estructural de la colección sesiones.

  Este esquema protege la integridad de las sesiones activas guardadas en MongoDB,
  validando la relación con el usuario, el token único de autenticación, los datos
  del dispositivo y las fechas que controlan el inicio y la expiración de la sesión.
*/
const sesionesValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "fkUsuarioId",
      "dispositivo",
      "token",
      "sessionStart",
      "sessionExpiry",
      "estado",
      "fechaRegistro",
      "fechaActualizacion"
    ],
    properties: {
      fkUsuarioId: {
        bsonType: "objectId",
        description: "Referencia obligatoria al usuario autenticado"
      },
      dispositivo: {
        bsonType: "string",
        minLength: 1,
        maxLength: 120,
        description: "Nombre descriptivo del dispositivo"
      },
      userAgent: {
        bsonType: ["string", "null"],
        maxLength: 500,
        description: "User agent reportado por el cliente"
      },
      ip: {
        bsonType: ["string", "null"],
        maxLength: 100,
        description: "IP del cliente"
      },
      navegador: {
        bsonType: ["string", "null"],
        maxLength: 80,
        description: "Navegador detectado"
      },
      sistemaOperativo: {
        bsonType: ["string", "null"],
        maxLength: 80,
        description: "Sistema operativo detectado"
      },
      tipoDispositivo: {
        bsonType: ["string", "null"],
        maxLength: 40,
        description: "Tipo de dispositivo detectado"
      },
      idioma: {
        bsonType: ["string", "null"],
        maxLength: 20,
        description: "Idioma principal del cliente"
      },
      origen: {
        bsonType: ["string", "null"],
        maxLength: 500,
        description: "Origen o referer de la sesión"
      },
      token: {
        bsonType: "string",
        minLength: 32,
        maxLength: 255,
        description: "Token único de la sesión"
      },
      sessionStart: {
        bsonType: "date",
        description: "Fecha y hora de inicio de la sesión"
      },
      sessionExpiry: {
        bsonType: "date",
        description: "Fecha y hora de expiración de la sesión"
      },
      estado: {
        bsonType: "bool",
        description: "Estado lógico de la sesión"
      },
      fechaRegistro: {
        bsonType: "date",
        description: "Fecha de creación del documento"
      },
      fechaActualizacion: {
        bsonType: "date",
        description: "Fecha de última actualización"
      }
    }
  }
};

/*
  Metodo para definir el usuario administrador inicial que se inserta como semilla.

  Este documento permite arrancar la base con un acceso administrativo controlado,
  evitando depender de inserciones manuales en ambientes nuevos o reinicializados.
*/
const adminSeed = {
  nombre: "Admin",
  apellido: "Principal",
  telefono: "1234567890",
  usuario: "admin.root.001",
  email: "admin@valian.local",
  password: "$2b$10$VZMnRhiTGyUcHDKJq3wpPewjSpKYATBfYViQcdCBaexZoh/hEhFFu",
  estado: true,
  sesion: false,
  fechaRegistro: new Date(),
  fechaActualizacion: new Date()
};

/*
  Metodo para obtener la referencia a la base de datos objetivo sin depender de la
  base activa actual de mongosh o MongoDB Compass Playground.
*/
const database = db.getSiblingDB(DATABASE_NAME);

/*
  Metodo para asegurar que una colección exista con su validador profesional aplicado.

  Si la colección todavía no existe, la crea con validación estricta desde el inicio.
  Si ya existe, actualiza su configuración mediante collMod para mantener el esquema
  alineado con la versión actual del sistema sin tener que recrear la colección.
*/
const ensureCollection = (collectionName, validator) => {
  const collectionExists = database.getCollectionInfos({ name: collectionName }).length > 0;

  if (!collectionExists) {
    database.createCollection(collectionName, {
      validator,
      validationLevel: "strict",
      validationAction: "error"
    });

    print(`Colección ${collectionName} creada en la base ${DATABASE_NAME}.`);
    return;
  }

  database.runCommand({
    collMod: collectionName,
    validator,
    validationLevel: "strict",
    validationAction: "error"
  });

  print(`Colección ${collectionName} ya existía. Validador actualizado.`);
};

// Metodo para garantizar que la colección de usuarios exista y tenga su esquema actualizado.
ensureCollection(USUARIOS_COLLECTION_NAME, usuariosValidator);

// Metodo para garantizar que la colección de sesiones exista y tenga su esquema actualizado.
ensureCollection(SESIONES_COLLECTION_NAME, sesionesValidator);

/*
  Metodo para crear un índice único sobre el email del usuario.

  Este índice evita correos duplicados y acelera búsquedas frecuentes por email,
  especialmente en flujos de autenticación, edición y validación de duplicados.
*/
database[USUARIOS_COLLECTION_NAME].createIndex(
  { email: 1 },
  {
    name: "uq_usuarios_email",
    unique: true
  }
);

/*
  Metodo para crear un índice único sobre el nombre de usuario generado.

  Esto garantiza unicidad lógica sobre el campo usuario y respalda búsquedas rápidas
  cuando el sistema autentica o consulta por nombre de usuario.
*/
database[USUARIOS_COLLECTION_NAME].createIndex(
  { usuario: 1 },
  {
    name: "uq_usuarios_usuario",
    unique: true
  }
);

/*
  Metodo para crear un índice único sobre el token de sesión.

  La unicidad del token es crítica para impedir colisiones entre sesiones y asegurar
  que cada token represente exactamente una sesión válida en el sistema.
*/
database[SESIONES_COLLECTION_NAME].createIndex(
  { token: 1 },
  {
    name: "uq_sesiones_token",
    unique: true
  }
);

/*
  Metodo para crear un índice compuesto por usuario y expiración de sesión.

  Este índice optimiza consultas de depuración, validación y limpieza de sesiones
  activas o vencidas por usuario dentro del flujo de autenticación.
*/
database[SESIONES_COLLECTION_NAME].createIndex(
  { fkUsuarioId: 1, sessionExpiry: 1 },
  {
    name: "idx_sesiones_usuario_expiry"
  }
);

/*
  Metodo para crear un índice compuesto por usuario y fecha de inicio de sesión.

  Sirve para recuperar sesiones recientes por usuario y soportar reglas operativas
  como revisión de dispositivos conectados o límites de sesiones activas.
*/
database[SESIONES_COLLECTION_NAME].createIndex(
  { fkUsuarioId: 1, sessionStart: -1 },
  {
    name: "idx_sesiones_usuario_inicio"
  }
);

/*
  Metodo para verificar si el usuario administrador sembrado ya existe previamente.

  La búsqueda contempla tanto el email como el nombre de usuario para evitar que se
  creen duplicados si alguno de esos identificadores ya fue registrado manualmente.
*/
const usuarioExistente = database[USUARIOS_COLLECTION_NAME].findOne({
  $or: [
    { email: adminSeed.email },
    { usuario: adminSeed.usuario }
  ]
});

/*
  Metodo para insertar el usuario administrador inicial solo cuando todavía no existe.

  De esta forma el script es idempotente: puede ejecutarse varias veces sin duplicar
  el usuario semilla ni romper ambientes donde el dato ya fue creado anteriormente.
*/
if (!usuarioExistente) {
  const resultado = database[USUARIOS_COLLECTION_NAME].insertOne(adminSeed);
  print(`Usuario inicial creado con id: ${resultado.insertedId}`);
} else {
  print("El usuario inicial ya existe. No se insertó duplicado.");
}

// Metodo para informar en consola que la inicialización completa finalizó correctamente.
print("Inicialización de usuarios y sesiones completada correctamente.");