# Usuarios

## Proposito

Gestiona usuarios del sistema, sus datos base, sus asignaciones organizacionales y, cuando se solicita, su arbol de accesos.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js expone el contrato publico del recurso.
- Los controladores resuelven HTTP, validacion de sesion y respuestas.
- methods/ concentra validaciones, persistencia y construccion de respuestas.
- El alta de usuarios vive en la ruta canonica sistema/accesos/usuarios.
- Las relaciones con empresa, sucursal, departamento y perfil se mantienen normalizadas por id.

## Operaciones actuales

- registrarUsuario: implementada.
- editarUsuario: implementada.
- eliminarUsuario: implementada.
- consultarUsuarios: implementada.
- consultarUsuario: implementada.
- consultarUsuariosFiltros: implementada.
- consultarUsuariosFormulario: implementada.

## Entrada de registro

```json
{
  "nombre": "Luis",
  "apellido": "Perez",
  "fechaNacimiento": "1995-08-21",
  "telefono": "1234567890",
  "email": "luis@test.local",
  "password": "Abc12345!",
  "empresaId": "6a4c27b32ed92b8fffc191b3",
  "sucursalId": "6a4c280f2ed92b8fffc191b4",
  "departamentoId": "6a4c28182ed92b8fffc191b5",
  "perfilId": "6a4c28202ed92b8fffc191b6",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

`fechaNacimiento` es opcional.

## Respuesta

`registrarUsuario` devuelve el recurso en `data.usuario`.

Las operaciones de consulta y edición conservan sus contratos actuales fuera de esta convención.
