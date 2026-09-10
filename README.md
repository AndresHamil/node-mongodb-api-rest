# 🚀 API REST Usuarios · Node.js + MongoDB

> **Backend robusto, escalable y profesional** construido con Node.js, Express y MongoDB.
> 
> Proyecto enfocado en autenticación por sesiones, gestión de usuarios y despliegue en Vercel.

---

## 📋 Tabla de contenidos

- [Visión General](#-visión-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arranque Rápido](#-arranque-rápido-5-minutos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Inicialización de Base de Datos](#-inicialización-de-base-de-datos)
- [Endpoints Principales](#-endpoints-principales)
- [Flujo de Desarrollo](#-flujo-de-desarrollo-día-a-día)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Actualización Continua](#-actualización-continua)
- [Crear una Nueva API](#-crear-una-nueva-api)
- [Guía de Referencia](#-guía-de-referencia)

---

## 👁 Visión General

Este proyecto es una **referencia profesional** de cómo construir un backend REST moderno:

✅ **Autenticación segura** por sesiones con tokens  
✅ **Base de datos NoSQL** con MongoDB y validación JSON Schema  
✅ **CRUD completo** del módulo usuarios  
✅ **Pruebas automatizadas** con Node Test Runner y Supertest  
✅ **Despliegue serverless** compatible con Vercel  
✅ **Documentación profesional** paso a paso  

**Ideal para:**
- Aprender arquitectura REST moderna
- Usar como base para tu próximo proyecto
- Comprender flujos de autenticación
- Implementar MongoDB con validadores
- Desplegar en producción

---

## 📦 Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Runtime** | Node.js | 22.x+ |
| **Framework** | Express.js | 4.x |
| **Base de Datos** | MongoDB | 6.x+ |
| **Autenticación** | bcrypt | 5.x |
| **Entorno** | dotenv | 16.x |
| **Testing** | Node Test Runner + Supertest | Built-in |
| **Dev Tools** | nodemon | 3.x |
| **Despliegue** | Vercel | Serverless |

---

## ⚡ Arranque Rápido (5 minutos)

### Paso 1: Clonar y preparar

```bash
# Clonar o descargar el proyecto
cd tu-proyecto

# Instalar dependencias
npm install
```

### Paso 2: Configurar base de datos

El archivo `.env` ya está configurado para MongoDB local:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE_NAME=valian
```

**Si usas MongoDB Atlas (cloud):**
Reemplaza en `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
MONGODB_DATABASE_NAME=valian
```

### Paso 3: Inicializar base de datos

```bash
# Crear colecciones mínimas del proyecto
npm run db:init

# Crear usuarios, sesiones, índices y usuario admin
npm run db:init:usuarios
```

**Credenciales del admin inicial:**
- Email: `admin@valian.local`
- Usuario: `admin.root.001`
- Contraseña: `Admin123!`

### Paso 4: Iniciar desarrollo

```bash
npm run dev
```

Abre en tu navegador: `http://localhost:3000`

### Paso 5: Verificar que funciona

```bash
# Salud de la API
GET http://localhost:3000/health

# Login (obtener token)
POST http://localhost:3000/sesiones/iniciarSesion
Content-Type: application/json

{
  "usuario": "admin@valian.local",
  "password": "Admin123!",
  "dispositivo": "Mi Computadora"
}
```

---

## 🏗 Estructura del Proyecto

```
proyecto/
├── api/                          # Entrada serverless para Vercel
│   └── index.js                 # Handler de Vercel
│
├── db/                          # Scripts de base de datos
│   ├── build.mongodb.js         # Bootstrap mínimo (colecciones base)
│   └── gestion/
│       └── usuarios.mongodb.js  # Inicialización completa de usuarios
│
├── src/                         # Código fuente principal
│   ├── index.js                # Arranque local del servidor
│   ├── app.js                  # Configuración Express
│   ├── config.js               # Variables de entorno
│   ├── db.js                   # Conexión MongoDB reutilizable
│   │
│   ├── controllers/            # Lógica de negocio
│   │   ├── gestion/
│   │   │   └── usuarios/       # CRUD de usuarios
│   │   └── otros/
│   │       └── sesiones/       # Login y logout
│   │
│   ├── routes/                 # Definición de endpoints
│   │   ├── index.js            # Rutas globales
│   │   ├── gestion/
│   │   │   └── usuarios.routes.js
│   │   └── otros/
│   │       └── sesiones/
│   │
│   ├── middlewares/            # Funciones intermedias
│   │   └── validarSesionActiva.middleware.js
│   │
│   └── utils/                  # Funciones auxiliares
│       ├── logger.js           # Logs del sistema
│       ├── methods.js          # Helpers compartidos
│       └── notImplemented.js   # Endpoints no implementados
│
├── test/                       # Pruebas automatizadas
│   ├── sistema/
│   │   └── accesos/usuarios/   # Tests de usuarios
│   └── otros/sesiones/         # Tests de login
│
├── test-support/              # Helpers para testing
│   └── shared/
│       └── mongo-test-context.helpers.js
│
├── scripts/                   # Scripts operativos
│   ├── sync-branch-env.js     # Sincronización de env
│   └── createUsuariosIndexes.js
│
├── .env                       # Variables de entorno (GIT IGNORED)
├── .gitignore                 # Archivos ignorados por Git
├── package.json               # Dependencias y scripts
├── vercel.json               # Configuración de Vercel
└── README.md                 # Esta documentación
```

### Explicación de directorios clave

**`api/`** → Permite que Vercel ejecute tu API como función serverless  
**`db/`** → Scripts MongoDB ejecutables con mongosh. Aquí se inicializa todo  
**`src/controllers/`** → Toda la lógica de negocio separada por módulo  
**`src/routes/`** → Definición de rutas y endpoints disponibles  
**`src/middlewares/`** → Validaciones que se ejecutan antes de los controladores  
**`src/utils/`** → Funciones reutilizables (logs, helpers, validaciones)  

---

## ⚙️ Variables de Entorno

El archivo `.env` en la raíz del proyecto controla toda la configuración:

```env
# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE_NAME=valian

# Puerto del servidor (opcional, Vercel lo ignora)
PORT=3000
```

### Para diferentes ambientes

**Desarrollo local (MongoDB local):**
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE_NAME=valian
PORT=3000
```

**Desarrollo con MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE_NAME=valian
PORT=3000
```

**Producción (Vercel):**
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE_NAME=valian
# Vercel ignora PORT, lo asigna automáticamente
```

⚠️ **Importante:** Nunca subas `.env` a Git. El archivo ya está en `.gitignore`.

---

## 🗄 Inicialización de Base de Datos

### Script 1: Bootstrap base (`npm run db:init`)

Ejecuta: `db/build.mongodb.js`

**Qué hace:**
- Crea la base de datos objetivo
- Crea las colecciones mínimas: usuarios, sesiones, empresas, sucursales, departamentos, etc.
- Prepare el proyecto para arrancar

**Cuándo usarlo:**
- Primera vez que configuras el proyecto
- Cuando limpias la base de datos completamente

```bash
npm run db:init
```

### Script 2: Inicialización completa (`npm run db:init:usuarios`)

Ejecuta: `db/gestion/usuarios.mongodb.js`

**Qué hace:**
- ✅ Crea colecciones `usuarios` y `sesiones` con esquemas JSON Schema
- ✅ Aplica validadores estrictos en MongoDB
- ✅ Crea índices únicos (email, usuario, token)
- ✅ Crea índices compuestos (para búsquedas rápidas)
- ✅ Siembra el usuario administrador inicial
- ✅ Si el admin existe, resincroniza sus credenciales

**Qué datos inserta:**
```json
{
  "nombre": "Admin",
  "apellido": "Principal",
  "usuario": "admin.root.001",
  "email": "admin@valian.local",
  "password": "Admin123!",
  "estado": true,
  "sesion": false
}
```

**Cuándo usarlo:**
- Después de `npm run db:init`
- Para resetear el admin si olvidaste la contraseña
- Para resincronizar índices

```bash
npm run db:init:usuarios
```

### Ejecución en MongoDB Compass

Si prefieres ejecutar desde **MongoDB Compass Playground**:

1. Abre MongoDB Compass
2. Conéctate a tu instancia (local o Atlas)
3. Ve a la pestaña **>_Playground**
4. Copia todo el contenido de `db/gestion/usuarios.mongodb.js`
5. Pégalo en el Playground
6. Haz clic en **Run** (Ctrl + Enter)

Verás la salida completa con todos los checkmarks ✓.

---

## 🔌 Endpoints Principales

### 1️⃣ Salud de la API (sin autenticación)

```http
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "message": "API funcionando correctamente"
}
```

---

### 2️⃣ Autenticación: Login (sin autenticación)

```http
POST /sesiones/iniciarSesion
Content-Type: application/json

{
  "usuario": "admin@valian.local",
  "password": "Admin123!",
  "dispositivo": "Chrome en Windows"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Sesión iniciada correctamente",
  "fkUsuarioId": "507f1f77bcf86cd799439011"
}
```

**Errores posibles:**
- `401` → Usuario o contraseña incorrectos
- `400` → Datos incompletos

---

### 3️⃣ Autenticación: Logout (requiere sesión)

```http
POST /sesiones/cerrarSesion
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

### 4️⃣ Usuarios: Registrar nuevo usuario (requiere sesión admin)

```http
POST /gestion/usuarios/registrarUsuario
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@test.local",
  "telefono": "1234567890",
  "password": "Abc12345!"
}
```

**Validaciones:**
- ✅ Email único y formato válido
- ✅ Usuario autogenerado único
- ✅ Contraseña mínimo 8 caracteres
- ✅ Contraseña debe tener: minúscula, mayúscula, número, carácter especial
- ✅ Teléfono 10 dígitos (opcional)

---

### 5️⃣ Usuarios: Obtener todos (requiere sesión)

```http
GET /gestion/usuarios/consultarUsuarios
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "total": 2,
  "usuarios": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Admin",
      "apellido": "Principal",
      "usuario": "admin.root.001",
      "email": "admin@valian.local",
      "estado": true,
      "sesion": false
    },
    { ... }
  ]
}
```

---

### 6️⃣ Usuarios: Obtener uno por ID (requiere sesión)

```http
GET /gestion/usuarios/:id
Authorization: Bearer {token}
```

---

### 7️⃣ Usuarios: Editar usuario (requiere sesión)

```http
PUT /gestion/usuarios/editarUsuario
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011",
  "nombre": "Juan",
  "apellido": "García",
  "email": "juan.nuevo@test.local",
  "telefono": "9876543210"
}
```

**Para cambiar contraseña, agregar:**
```json
{
  "currentPassword": "Abc12345!",
  "newPassword": "Nueva123!"
}
```

---

### 8️⃣ Usuarios: Eliminar usuario (requiere sesión admin)

```http
DELETE /gestion/usuarios/eliminarUsuario
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011"
}
```

---

## 📚 Flujo de Desarrollo (Día a día)

### Mañana típica: Empezar a trabajar

```bash
# 1. Descargar cambios del equipo
git pull origin main

# 2. Instalar dependencias si hay nuevas
npm install

# 3. Iniciar desarrollo
npm run dev
```

### Durante el desarrollo: Hacer cambios

1. **Modifica archivos** en `src/controllers/`, `src/routes/`, etc.
2. **nodemon reinicia** automáticamente el servidor
3. **Prueba en Postman o VS Code REST Client**

Ejemplo: Crear un nuevo endpoint

**1. Crear el controlador** (`src/controllers/gestion/ejemplo/index.js`)
```javascript
exports.obtenerDatos = async (req, res) => {
  try {
    res.json({ message: "Datos obtenidos" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**2. Crear la ruta** (`src/routes/gestion/ejemplo.routes.js`)
```javascript
const express = require("express");
const controller = require("../../controllers/gestion/ejemplo");
const router = express.Router();

router.get("/", controller.obtenerDatos);

module.exports = router;
```

**3. Registrar en rutas globales** (`src/routes/index.js`)
```javascript
app.use("/gestion/ejemplo", require("./gestion/ejemplo.routes"));
```

### Antes de terminar: Verificar cambios

```bash
# Ver qué cambió
git status

# Ver cambios específicos
git diff

# Ejecutar pruebas
npm test
```

### Guardar progreso: Commit

```bash
# Agregar cambios
git add .

# Describir qué hiciste
git commit -m "feat: agregar endpoint de usuarios"

# Subir a repositorio
git push origin main
```

**Mensajes de commit claros:**
- `feat:` Nueva característica
- `fix:` Corrección de bug
- `refactor:` Reorganización de código
- `docs:` Cambios en documentación
- `test:` Agregar o actualizar tests

---

## 🚀 Despliegue en Vercel

### Preparación inicial (una sola vez)

#### 1. Crear cuenta en Vercel

Visita [vercel.com](https://vercel.com) y crea una cuenta gratuita.

#### 2. Conectar repositorio Git

1. En Vercel, haz clic en **New Project**
2. Selecciona **Import Git Repository**
3. Elige tu repositorio GitHub
4. Vercel detectará automáticamente que es un proyecto Node.js

#### 3. Configurar variables de entorno en Vercel

En el panel de Vercel:

1. Ve a **Settings → Environment Variables**
2. Agrega estas variables:

```
MONGODB_URI = mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE_NAME = valian
```

⚠️ **Importante:** La URI debe incluir usuario y contraseña.

#### 4. Verificar permisos en MongoDB Atlas

En MongoDB Atlas:

1. Ve a **Network Access**
2. Haz clic en **Add IP Address**
3. Selecciona **Allow Access from Anywhere**
4. Guardar (Vercel necesita conectar desde su infraestructura)

### Despliegue: Primera vez

```bash
# Hacer commit de todos los cambios
git add .
git commit -m "Preparado para despliegue"

# Subir a main
git push origin main

# Vercel detecta automáticamente y despliega
# Monitorea en: https://vercel.com/dashboard
```

Vercel te mostrará una URL como: `https://api-nombre.vercel.app`

### Despliegue: Después de cambios

Simplemente haz **git push** y Vercel lo despliega automáticamente:

```bash
# Hacer cambios
# ... editar archivos ...

# Guardar
git add .
git commit -m "fix: corregir validación de email"
git push origin main

# Vercel despliega automáticamente
# Monitorea en: https://vercel.com/dashboard
```

### Despliegue manual

Si quieres desplegar sin cambios en Git:

En panel de Vercel → **Deployments** → **Redeploy**

### Verificar que funciona en producción

```bash
# Probar salud
GET https://api-nombre.vercel.app/health

# Probar login
POST https://api-nombre.vercel.app/sesiones/iniciarSesion
```

### Rollback (volver a versión anterior)

En Vercel → **Deployments** → Selecciona versión anterior → **Redeploy**

---

## 🔄 Actualización Continua

### Flujo recomendado después de cada sesión de trabajo

**1. Al terminar tu sesión de desarrollo:**

```bash
# Ver cambios
git status

# Revisar qué modificaste
git diff

# Si todo está bien, guardar
git add .
git commit -m "Descripción clara del cambio"
git push origin main
```

**2. Vercel se actualiza automáticamente**

```
✅ Tu API en producción tiene los cambios
```

**3. Próxima sesión: Descargar cambios**

```bash
# Obtener últimos cambios
git pull origin main

# Reinstalar dependencias si hay nuevas
npm install

# Iniciar desarrollo
npm run dev
```

### Workflow recomendado con ramas

Para cambios grandes, usa ramas:

```bash
# Crear rama para nueva característica
git checkout -b feature/nueva-funcionalidad

# ... hacer cambios ...

# Guardar en rama
git add .
git commit -m "feat: implementar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# En GitHub: Crear Pull Request
# Una vez aprobado:
git checkout main
git pull origin main
git merge feature/nueva-funcionalidad
git push origin main
# Vercel despliega automáticamente
```

---

## 🆕 Crear una Nueva API

Si necesitas comenzar un nuevo proyecto desde cero:

### Opción 1: Usar este proyecto como referencia

```bash
# Clonar
git clone <tu-repo> nuevo-proyecto
cd nuevo-proyecto

# Cambiar nombre y remoto
git remote rename origin upstream
git remote add origin <nuevo-repo>

# Modificar package.json
# "name": "nueva-api"
# "description": "Tu descripción"

# Cambiar credenciales y .env
# Personalizar según necesidades

# Subir
git push -u origin main
```

### Opción 2: Crear desde cero

```bash
# Crear carpeta
mkdir mi-api
cd mi-api

# Inicializar Node
npm init -y

# Instalar dependencias principales
npm install express dotenv mongodb bcrypt nodemon

# Instalar dependencias de desarrollo
npm install --save-dev supertest

# Crear estructura básica
mkdir -p src/{controllers,routes,middlewares,utils}
mkdir -p db
mkdir -p test test-support
mkdir -p api

# Crear archivos principales
# ... copiar estructura de este proyecto ...
```

### Estructura mínima recomendada

```
src/
├── index.js          # Arranque
├── app.js            # Configuración Express
├── config.js         # Variables
├── db.js             # Conexión MongoDB
├── controllers/      # Lógica
├── routes/          # Endpoints
├── middlewares/     # Validaciones
└── utils/           # Helpers

db/
├── build.mongodb.js  # Bootstrap
└── gestion/
    └── tu-modulo.mongodb.js

test/
└── tu-modulo/
    └── tu-modulo.test.js

package.json
.env
.gitignore
vercel.json
README.md
```

---

## 📖 Guía de Referencia

### Scripts disponibles

```bash
npm run dev                  # Iniciar desarrollo (auto-reload)
npm run db:init            # Crear colecciones base
npm run db:init:usuarios   # Inicializar usuarios y sesiones
npm run start              # Iniciar producción
npm test                   # Ejecutar pruebas
npm run db:indexes:usuarios  # Recrear índices
```

### Comandos Git útiles

```bash
git status                 # Ver cambios
git diff                   # Ver qué cambió
git add .                  # Agregar todo
git commit -m "mensaje"    # Guardar
git push                   # Subir
git pull                   # Descargar
git log --oneline          # Ver historial
git revert <commit>        # Deshacer commit
```

### Pruebas en Postman

Importa esta colección en Postman:

```json
{
  "info": {
    "name": "API Usuarios",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/sesiones/iniciarSesion",
        "body": {
          "mode": "raw",
          "raw": "{\"usuario\":\"admin@valian.local\",\"password\":\"Admin123!\",\"dispositivo\":\"Postman\"}"
        }
      }
    },
    {
      "name": "Usuarios",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/gestion/usuarios",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ]
}
```

### Recursos útiles

- **Express.js**: https://expressjs.com
- **MongoDB**: https://www.mongodb.com
- **Vercel**: https://vercel.com/docs
- **REST API Best Practices**: https://restfulapi.net
- **Git**: https://git-scm.com/doc

---

## ✨ Próximos pasos

Ahora que tienes el proyecto configurado:

1. **✅ Hacer el login** y obtener un token
2. **✅ Crear usuarios** nuevos
3. **✅ Explorar los endpoints** disponibles
4. **✅ Ejecutar las pruebas** (`npm test`)
5. **✅ Hacer cambios** y subirlos a Git
6. **✅ Desplegar en Vercel** cuando esté listo

---

## 🤝 Soporte

Si tienes preguntas o problemas:

1. Revisa esta documentación
2. Consulta los comentarios en el código
3. Revisa los tests para ejemplos de uso
4. Busca en la documentación oficial de las herramientas

---

**Última actualización:** Septiembre 2026  
**Versión del proyecto:** 2.0  
**Estado:** Listo para producción ✅
