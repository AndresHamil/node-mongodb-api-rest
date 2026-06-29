/*
  Script base de inicialización para MongoDB / mongosh / MongoDB Compass Playground.

  Qué hace:
  1. Selecciona la base de datos objetivo.
  2. Garantiza la existencia de las colecciones mínimas del proyecto.
  3. Permite arrancar el sistema antes de aplicar validadores y semillas específicas.

  Este archivo representa el bootstrap mínimo del proyecto.
  La configuración detallada del módulo usuarios vive en db/gestion/usuarios.mongodb.js.
*/

const DATABASE_NAME = "valianDB";
const BASE_COLLECTIONS = ["usuarios", "sesiones"];

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