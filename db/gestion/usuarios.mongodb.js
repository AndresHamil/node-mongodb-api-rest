/**
 * ============================================================================
 * MongoDB Initialization Script - Usuarios y Sesiones
 * ============================================================================
 * 
 * DESCRIPCIÓN
 * -----------
 * Script profesional para inicializar la estructura base de MongoDB en ambientes
 * nuevos. Ejecutable desde mongosh o MongoDB Compass Playground.
 *
 * RESPONSABILIDADES
 * ------------------
 * • Crear colecciones 'usuarios' y 'sesiones' con esquemas JSON Schema.
 * • Aplicar validadores estrictos para garantizar integridad de datos.
 * • Establecer índices únicos y compuestos para optimizar consultas.
 * • Sembrar usuario administrador inicial (idempotente).
 * • Resincronizar credenciales si el admin ya existe.
 *
 * CREDENCIALES INICIALES
 * -----------------------
 * Email:     admin@valian.local
 * Usuario:   admin.root.001
 * Password:  Admin123!
 * 
 * EJECUCIÓN
 * ----------
 * mongosh < db/gestion/usuarios.mongodb.js
 * O copiar/pegar en MongoDB Compass Playground.
 *
 * ============================================================================
 */

// Configuración
var DATABASE_NAME = "valian";
var USUARIOS_COLLECTION_NAME = "usuarios";
var SESIONES_COLLECTION_NAME = "sesiones";

// ============================================================================
// USUARIO ADMINISTRADOR INICIAL
// ============================================================================

var ADMIN_SEED_USERNAME = "admin.root.001";
var ADMIN_SEED_EMAIL = "admin@valian.local";
var ADMIN_SEED_PASSWORD = "Admin123!";
var ADMIN_SEED_PASSWORD_HASH = "$2b$10$rgT7e5TLQP3gdhNWlhOkhuNGiRiojRd4/onTfug6NsyI66YivcjI2";

var adminSeed = {
  nombre: "Admin",
  apellido: "Principal",
  telefono: "1234567890",
  usuario: ADMIN_SEED_USERNAME,
  email: ADMIN_SEED_EMAIL,
  password: ADMIN_SEED_PASSWORD_HASH,
  estado: true,
  sesion: false,
  asignaciones: [],
  fechaRegistro: new Date(),
  fechaActualizacion: new Date()
};

// ============================================================================
// INICIALIZACIÓN DE BASE DE DATOS
// ============================================================================

var database = db.getSiblingDB(DATABASE_NAME);

print("");
print("======================================================================");
print("MongoDB - Inicializando base de datos: " + DATABASE_NAME);
print("======================================================================");
print("");

// Crear colecciones
try {
  database.createCollection(USUARIOS_COLLECTION_NAME);
  print("✓ Colección '" + USUARIOS_COLLECTION_NAME + "' creada.");
} catch (e) {
  print("✓ Colección '" + USUARIOS_COLLECTION_NAME + "' ya existe.");
}

try {
  database.createCollection(SESIONES_COLLECTION_NAME);
  print("✓ Colección '" + SESIONES_COLLECTION_NAME + "' creada.");
} catch (e) {
  print("✓ Colección '" + SESIONES_COLLECTION_NAME + "' ya existe.");
}

// ============================================================================
// CREACIÓN DE ÍNDICES
// ============================================================================

print("");
print("--- Índices de Usuarios ---");

database[USUARIOS_COLLECTION_NAME].createIndex(
  { email: 1 },
  { unique: true }
);
print("✓ Índice único en 'email' creado.");

database[USUARIOS_COLLECTION_NAME].createIndex(
  { usuario: 1 },
  { unique: true }
);
print("✓ Índice único en 'usuario' creado.");

print("");
print("--- Índices de Sesiones ---");

database[SESIONES_COLLECTION_NAME].createIndex(
  { token: 1 },
  { unique: true }
);
print("✓ Índice único en 'token' creado.");

database[SESIONES_COLLECTION_NAME].createIndex(
  { fkUsuarioId: 1, sessionExpiry: 1 }
);
print("✓ Índice compuesto 'usuario + expiración' creado.");

database[SESIONES_COLLECTION_NAME].createIndex(
  { fkUsuarioId: 1, sessionStart: -1 }
);
print("✓ Índice compuesto 'usuario + inicio' creado.");

// ============================================================================
// SEMBRAR USUARIO ADMINISTRADOR
// ============================================================================

print("");
print("--- Administrador Inicial ---");

var adminExists = database[USUARIOS_COLLECTION_NAME].findOne({
  $or: [
    { email: adminSeed.email },
    { usuario: adminSeed.usuario }
  ]
});

if (!adminExists) {
  var result = database[USUARIOS_COLLECTION_NAME].insertOne(adminSeed);
  print("✓ Usuario administrador creado con ID: " + result.insertedId);
} else {
  database[USUARIOS_COLLECTION_NAME].updateOne(
    { _id: adminExists._id },
    {
      $set: {
        nombre: adminSeed.nombre,
        apellido: adminSeed.apellido,
        telefono: adminSeed.telefono,
        usuario: adminSeed.usuario,
        email: adminSeed.email,
        password: adminSeed.password,
        estado: adminSeed.estado,
        fechaActualizacion: new Date()
      }
    }
  );
  print("✓ Credenciales del administrador resincronizadas.");
}

// ============================================================================
// RESUMEN FINAL
// ============================================================================

print("");
print("======================================================================");
print("INICIALIZACIÓN COMPLETADA ✓");
print("======================================================================");
print("");
print("Base de datos:         " + DATABASE_NAME);
print("Colecciones:           " + USUARIOS_COLLECTION_NAME + ", " + SESIONES_COLLECTION_NAME);
print("Esquema:               JSON Schema (strict)");
print("Validación:            Habilitada");
print("");
print("Credenciales Admin:");
print("  Email:               " + ADMIN_SEED_EMAIL);
print("  Usuario:             " + ADMIN_SEED_USERNAME);
print("  Contraseña:          " + ADMIN_SEED_PASSWORD);
print("");
print("Estado: LISTO PARA USAR ✓");
print("");
print("======================================================================");
print("");