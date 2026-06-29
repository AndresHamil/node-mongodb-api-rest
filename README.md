# API REST Usuarios · Node.js + MongoDB

Backend REST construido con Node.js, Express y MongoDB. Hoy el proyecto esta documentado y enfocado alrededor del modulo de usuarios, que funciona como referencia completa para autenticacion por sesiones, CRUD, consultas y despliegue en Vercel.

## Vision rapida

- API REST con Express.
- Persistencia en MongoDB Atlas.
- Autenticacion por sesiones activas.
- Despliegue compatible con Vercel.
- Modulo de usuarios como slice principal del proyecto.

## Stack

- Node.js
- Express
- MongoDB Driver
- dotenv
- bcrypt
- nodemon
- supertest
- Node Test Runner

## Arranque en 2 minutos

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el archivo de entorno

Windows:

```bash
copy .env.example .env
```

macOS o Linux:

```bash
cp .env.example .env
```

### 3. Completar la conexion a MongoDB

En .env agrega tu URI real y revisa el nombre de la base:

```env
MONGO_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/valianDB?retryWrites=true&w=majority&appName=ValianDB
DB_DATABASE=valianDB
```

### 4. Crear indices de usuarios

```bash
npm run db:indexes:usuarios
```

### 5. Iniciar la API

```bash
npm run dev
```

### 6. Probar salud de la API

```bash
GET /
GET /health
```

## Variables de entorno

El repositorio no sube .env real. Solo sube .env.example con la estructura base.

Variables principales del proyecto:

```env
MONGO_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/valianDB?retryWrites=true&w=majority&appName=ValianDB
DB_DATABASE=valianDB

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

Notas importantes:

- Para Vercel usa una sola variable de conexion: MONGO_URI.
- PORT es opcional en local y no se configura en Vercel.
- No subas .env a Git.
- No dupliques MONGO_URI y MONGODB_URI salvo que tengas una razon concreta.

## Scripts basicos

```bash
npm run dev
```

Levanta la API en desarrollo con recarga automatica.

```bash
npm start
```

Levanta la API en modo Node normal.

```bash
npm run db:indexes:usuarios
```

Crea los indices unicos del modulo usuarios.

```bash
npm test
```

Ejecuta las pruebas automatizadas del modulo usuarios.

## MongoDB Atlas

### Configuracion minima

Para que la API conecte correctamente con MongoDB Atlas debes revisar dos cosas:

- Database Access: usuario y contraseña vigentes.
- Network Access: permisos de red para la maquina local o Vercel.

### Regla de red para Vercel

Si vas a desplegar en Vercel, MongoDB Atlas no va a recibir la conexion desde la IP de tu PC. Para este proyecto, la forma mas directa de permitir el acceso es agregar en Network Access:

```text
0.0.0.0/0
```

Esto permite conexiones desde cualquier IP, incluida la salida de Vercel.

Flujo recomendado:

1. Entra a MongoDB Atlas.
2. Abre tu proyecto.
3. Ve a Network Access.
4. Pulsa Add IP Address.
5. Elige Allow Access from Anywhere.
6. Guarda el cambio.

Nota de seguridad:

- 0.0.0.0/0 es practico para despliegues y pruebas rapidas.
- Si el proyecto crece, conviene endurecer esta politica y rotar credenciales con frecuencia.

## Despliegue en Vercel

El proyecto ya incluye compatibilidad basica para Vercel mediante una entrada serverless.

### Variables que debes capturar en Vercel

- MONGO_URI
- DB_DATABASE
- SESSION_DURATION_HOURS
- SESSION_INACTIVITY_MINUTES
- SESSION_RENEWAL_THRESHOLD_MINUTES
- SESSION_MAX_ACTIVE
- DB_COLLECTION_USUARIOS
- DB_COLLECTION_SESIONES
- DB_COLLECTION_SUCURSALES
- DB_COLLECTION_DEPARTAMENTOS
- DB_COLLECTION_PERFILES

### Variables que no necesitas capturar en Vercel

- PORT
- DB_USER
- DB_PASSWORD
- AUTHORIZED_IP
- MONGODB_URI si ya estas usando MONGO_URI

### Flujo de despliegue

1. Subir cambios a Git.
2. Conectar el repositorio en Vercel.
3. Configurar las variables de entorno del proyecto.
4. Verificar que Atlas permita el acceso desde Vercel con 0.0.0.0/0.
5. Ejecutar Deploy o Redeploy.
6. Probar GET / y GET /health.

## Flujo funcional del modulo usuarios

El acceso a usuarios sigue este orden:

1. Iniciar sesion.
2. Obtener token.
3. Enviar token en requests protegidos.
4. Consumir endpoints del modulo usuarios.

## Endpoints principales

### Salud

```http
GET /
GET /health
```

### Sesiones

```http
POST /sesiones/iniciarSesion
POST /sesiones/cerrarSesion
```

Payload minimo de inicio de sesion:

```json
{
	"usuario": "correo.o.usuario",
	"password": "Abc12345!",
	"dispositivo": "Chrome en Windows"
}
```

### Usuarios

Todos los endpoints bajo /gestion/usuarios requieren sesion activa.

```http
POST /gestion/usuarios/registrarUsuario
PUT /gestion/usuarios/editarUsuario
DELETE /gestion/usuarios/eliminarUsuario
GET /gestion/usuarios/consultarUsuarios
GET /gestion/usuarios/:id
POST /gestion/usuarios/consultarUsuario
POST /gestion/usuarios/consultarUsuariosFormulario
POST /gestion/usuarios/consultarUsuariosFiltros
```

Payload base para registrar usuario:

```json
{
	"nombre": "Luis",
	"apellido": "Rodriguez",
	"email": "luis@test.local",
	"telefono": "1234567890",
	"password": "Abc12345!"
}
```

Reglas visibles del registro:

- nombre y apellido deben ser texto valido
- email debe tener formato correcto
- telefono debe tener 10 digitos si se envia
- password debe tener al menos 8 caracteres
- password debe incluir minuscula, mayuscula, numero y caracter especial
- email y usuario no pueden duplicarse

Payload base para editar usuario:

```json
{
	"id": "OBJECT_ID",
	"nombre": "Luis",
	"apellido": "Rodriguez",
	"email": "nuevo@test.local",
	"telefono": "1234567890"
}
```

Si vas a cambiar contraseña, debes enviar tambien:

```json
{
	"currentPassword": "Abc12345!",
	"newPassword": "Nueva123!"
}
```

## Comandos de trabajo diario

Instalar dependencias:

```bash
npm install
```

Crear indices de usuarios:

```bash
npm run db:indexes:usuarios
```

Levantar en desarrollo:

```bash
npm run dev
```

Correr pruebas:

```bash
npm test
```

Subir cambios a Git:

```bash
git status
git add .
git commit -m "tu mensaje"
git push
```

## Estructura del proyecto

```text
.
|-- api/
|-- scripts/
|-- src/
|-- test/
|-- test-support/
|-- .env.example
|-- package.json
|-- README.md
|-- vercel.json
```

### api

Entrada serverless para Vercel.

### scripts

Scripts auxiliares. Hoy el mas importante es la creacion de indices para usuarios.

### src

Codigo fuente principal de la API.

Archivos clave:

- src/index.js: arranque local del servidor.
- src/app.js: composicion de Express y rutas globales.
- src/config.js: lectura de variables de entorno.
- src/db.js: conexion Mongo reutilizable para local y Vercel.

Directorios clave:

- src/controllers/gestion/usuarios: logica del modulo usuarios.
- src/controllers/otros/sesiones: autenticacion y cierre de sesion.
- src/routes/gestion/usuarios.routes.js: endpoints protegidos de usuarios.
- src/routes/otros/sesiones.routes.js: endpoints de login y logout.
- src/middlewares: validacion de sesion activa.
- src/utils: helpers de validacion, respuestas, errores, sesiones y Mongo.

### test

Pruebas del modulo usuarios.

### test-support

Helpers compartidos para preparar datos y sesiones de prueba.

## Enfoque actual del proyecto

Este repositorio todavia conserva rastros del proyecto original, pero la parte viva y util para desarrollo y despliegue actual es:

- autenticacion por sesiones
- modulo usuarios en MongoDB
- despliegue en Vercel
- pruebas del flujo de usuarios

## Recomendaciones finales

- Usa .env.example como contrato de configuracion.
- Mantén fuera de Git cualquier credencial real.
- Si expones una URI o contraseña, rotala inmediatamente en Atlas.
- Antes de culpar al codigo en Vercel, revisa primero variables de entorno y Network Access en Atlas.

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
