# API REST Node.js + MongoDB

Este proyecto es una API REST construida con Node.js, Express y MongoDB.

Su objetivo actual es servir como base para una arquitectura por modulos, donde el recurso de usuarios ya funciona como referencia completa para futuros endpoints. El repositorio conserva parte de la estructura y scripts SQL del proyecto original, pero el flujo activo de la API ya trabaja con MongoDB.

## Tecnologias usadas

- Node.js
- Express
- MongoDB
- dotenv
- bcrypt
- Node Test Runner
- supertest

## Requisitos previos

Antes de arrancar el proyecto necesitas tener instalado:

- Node.js
- npm
- MongoDB local o acceso a una instancia remota de MongoDB

## Instalacion del proyecto

Clona o descarga el proyecto y luego instala las dependencias:

```bash
npm install
```

## Variables de entorno

Este proyecto utiliza un archivo .env en la raiz.

El repositorio incluye un archivo .env.example con la estructura base. En cualquier equipo nuevo debes copiar ese archivo, renombrarlo a .env y despues completar tus valores reales de conexion.

Ejemplo:

```bash
copy .env.example .env
```

Variables usadas por la aplicacion:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017
DB_DATABASE=ValianDB

SESSION_DURATION_HOURS=12
SESSION_INACTIVITY_MINUTES=60
SESSION_RENEWAL_THRESHOLD_MINUTES=2
SESSION_MAX_ACTIVE=5

DB_COLLECTION_USUARIOS=usuarios
DB_COLLECTION_SESIONES=sesiones
DB_COLLECTION_SUCURSALES=sucursales
DB_COLLECTION_DEPARTAMENTOS=departamentos
DB_COLLECTION_PERFILES=perfiles
```

Notas:

- MONGO_URI apunta al servidor de MongoDB.
- DB_DATABASE define el nombre de la base de datos que usara la API.
- Las variables DB_COLLECTION_* permiten cambiar los nombres de las colecciones sin tocar el codigo.
- Si no defines algunas variables, la aplicacion usa valores por defecto desde src/config.js.

## Preparacion de MongoDB

Antes de iniciar la API debes asegurarte de que MongoDB este corriendo.

Ejemplo si trabajas en local:

```bash
mongod
```

Despues de eso, ejecuta el script de indices para la coleccion de usuarios:

```bash
npm run db:indexes:usuarios
```

Ese script crea indices unicos para:

- email
- usuario

Esto es importante porque el modulo usuarios depende de esas restricciones para evitar duplicados.

## Arranque del proyecto

### Desarrollo

```bash
npm run dev
```

Este comando levanta el servidor con nodemon usando:

- src/index.js como punto de entrada
- recarga automatica al detectar cambios

### Produccion

```bash
npm start
```

## Pruebas

Para ejecutar las pruebas automatizadas:

```bash
npm test
```

Actualmente las pruebas visibles del proyecto estan concentradas en el modulo de usuarios, que es el ejemplo mas completo del repositorio.

## Flujo basico para arrancar desde cero

Si descargas el proyecto por primera vez, este es el orden recomendado:

1. Instalar dependencias con npm install.
2. Copiar .env.example a .env.
3. Completar en .env las conexiones y credenciales reales de MongoDB.
4. Levantar MongoDB local o verificar acceso a tu instancia remota.
5. Ejecutar npm run db:indexes:usuarios.
6. Iniciar la API con npm run dev.
7. Probar endpoints o correr la suite con npm test.

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor en modo desarrollo con nodemon.

```bash
npm start
```

Inicia el servidor en modo normal con Node.js.

```bash
npm run db:indexes:usuarios
```

Crea los indices necesarios para la coleccion de usuarios en MongoDB.

```bash
npm test
```

Ejecuta las pruebas automatizadas del proyecto.

## Estructura del proyecto

```text
.
|-- db/
|-- scripts/
|-- src/
|-- test/
|-- test-support/
|-- .env
|-- .gitignore
|-- package.json
|-- README.md
```

### Raiz del proyecto

- package.json: define dependencias, scripts y configuracion general del proyecto.
- README.md: documentacion general de instalacion, arranque y estructura.
- .env: variables de entorno globales.
- .gitignore: archivos y carpetas que no deben subirse al repositorio.

### db

Esta carpeta conserva scripts SQL del proyecto original.

- build.sql: script principal para crear la base relacional y sus tablas.
- gestion/: scripts SQL de sucursales, departamentos, perfiles y usuarios.
- sistemas/: scripts SQL de modulos y procesos.

Importante:

- Esta carpeta no controla el flujo actual de la API en ejecucion.
- Se mantiene como referencia del modelo anterior basado en SQL.

### scripts

Contiene scripts auxiliares para tareas manuales o de mantenimiento.

- createUsuariosIndexes.js: crea indices unicos en MongoDB para la coleccion de usuarios.

### src

Contiene todo el codigo fuente de la API.

#### Archivos base

- src/index.js: punto de entrada del servidor. Primero conecta a MongoDB y luego levanta Express.
- src/app.js: configura la app de Express, habilita JSON y monta todas las rutas.
- src/config.js: lee variables de entorno y expone configuracion global.
- src/db.js: administra la conexion a MongoDB y el acceso a colecciones.

#### src/controllers

Contiene la logica de negocio de cada endpoint.

Se organiza por dominios:

- gestion/
- otros/
- sistema/

Cada recurso suele dividirse en controladores especializados, por ejemplo:

- registrar
- consultar uno
- consultar varios
- filtros
- formulario
- editar
- eliminar

##### gestion

Agrupa recursos operativos del negocio:

- departamentos/
- perfiles/
- sucursales/
- usuarios/

El modulo usuarios es el ejemplo mas completo del proyecto y ya esta migrado a MongoDB.

Dentro de usuarios se encuentran:

- controladores del CRUD y consultas
- un index.js que reexporta el modulo
- una carpeta methods/ con logica reutilizable especifica del recurso

##### otros

Agrupa modulos auxiliares del sistema.

Actualmente destaca:

- sesiones/

Aqui viven controladores como:

- iniciarSesion
- cerrarSesion

##### sistema

Agrupa recursos tecnicos o estructurales del sistema, por ejemplo:

- modulos/
- procesos/

### src/routes

Define los endpoints HTTP y conecta cada ruta con su controlador.

- index.js: centraliza y reexporta todos los routers.
- gestion/: rutas de departamentos, perfiles, sucursales y usuarios.
- otros/: rutas de sesiones.
- sistema/: rutas de modulos y procesos.

Ejemplo real del proyecto:

- el router de usuarios protege el prefijo /gestion/usuarios con validacion de sesion activa
- luego registra endpoints para registrar, editar, eliminar y consultar usuarios

### src/middlewares

Contiene logica intermedia reutilizable entre rutas y controladores.

- validarSesionActiva.middleware.js: valida el token, revisa si la sesion sigue activa y carga el usuario autenticado en la request.

Esto permite proteger endpoints privados sin duplicar validaciones en cada controlador.

### src/schemas

Actualmente esta vacia.

Esta carpeta queda disponible para colocar esquemas de validacion o contratos de datos si el proyecto evoluciona hacia una validacion mas formal.

### src/utils

Contiene utilidades globales compartidas por toda la aplicacion.

- methods.js: archivo central de helpers del proyecto. Incluye validaciones, normalizacion, respuestas API, manejo de errores, criptografia y helpers de sesiones y MongoDB.
- logger.js: imprime errores estructurados en consola para facilitar depuracion.
- notImplemented.js: devuelve respuestas 501 para endpoints pendientes de implementar o migrar.

### test

Contiene las pruebas automatizadas.

Actualmente la cobertura visible esta orientada a usuarios:

- consultasUsuario.test.js
- registrarUsuario.test.js
- editarUsuario.test.js
- eliminarUsuario.test.js

Estas pruebas verifican autenticacion, validaciones, respuestas correctas y errores esperados del modulo usuarios.

### test-support

Contiene helpers para pruebas.

- usuarios.helpers.js: prepara contexto de prueba, crea usuarios, crea sesiones actor, limpia datos temporales y cierra la conexion a MongoDB al terminar.

## Estado actual del proyecto

Hoy el proyecto tiene una estructura mixta:

- mantiene scripts SQL del proyecto original
- ya usa MongoDB como flujo real de ejecucion
- tiene el modulo usuarios como referencia completa para nuevos recursos
- cuenta con autenticacion basada en sesiones activas
- ya incluye pruebas automatizadas para usuarios

## Recomendacion de uso para nuevos modulos

Si vas a crear nuevos recursos en MongoDB, el mejor punto de referencia es el modulo de usuarios, porque ya muestra:

- estructura de rutas
- controladores separados por responsabilidad
- helpers propios del recurso
- validaciones
- manejo de errores
- proteccion por sesion
- pruebas automatizadas
