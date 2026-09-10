/*
  Script base de inicialización para MongoDB / mongosh / MongoDB Compass Playground.

  Qué hace:
  1. Selecciona la base de datos objetivo.
  2. Garantiza la existencia de las colecciones mínimas del proyecto.
  3. Permite arrancar el sistema antes de aplicar validadores y semillas específicas.

  Este archivo representa el bootstrap mínimo del proyecto.
  La configuración detallada del módulo usuarios vive en db/gestion/usuarios.mongodb.js.
*/

const DEFAULT_DATABASE_NAME = "valian";
const BASE_COLLECTIONS = ["usuarios", "sesiones", "empresas", "sucursales", "departamentos", "perfiles", "modulos", "procesos"];

const fs = typeof require === "function" ? require("fs") : null;
const path = typeof require === "function" ? require("path") : null;

const readEnvValue = (key) => {
  if (!fs || !path || typeof process === "undefined" || typeof process.cwd !== "function") {
    return null;
  }

  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = envContent.match(new RegExp(`^${escapedKey}=(.*)$`, "m"));

  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^['"]|['"]$/g, "");
};

const DATABASE_NAME = readEnvValue("MONGODB_DATABASE_NAME") || DEFAULT_DATABASE_NAME;

const database = db.getSiblingDB(DATABASE_NAME);

const ensureCollection = (collectionName) => {
  const collectionExists = database.getCollectionInfos({ name: collectionName }).length > 0;

  if (collectionExists) {
    print(`Colección ${collectionName} ya existente en la base ${DATABASE_NAME}.`);
    return;
  }

  database.createCollection(collectionName);
  print(`Colección ${collectionName} creada en la base ${DATABASE_NAME}.`);
};

BASE_COLLECTIONS.forEach(ensureCollection);

print(`Inicialización base completada para ${DATABASE_NAME}.`);