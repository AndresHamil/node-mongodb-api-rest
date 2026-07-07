# Perfiles

## Proposito

Gestiona perfiles de acceso del sistema.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js expone el contrato publico del recurso.
- registrarPerfil.controller.js resuelve HTTP, validacion de sesion y respuesta.
- methods/ concentra validaciones de negocio y persistencia.
- La ruta canonica del recurso vive en sistema/accesos/perfiles y la ruta legacy de gestion reutiliza este mismo slice.
- Los permisos y accesos se asignan despues desde procesos especificos del dominio de accesos.

## Operaciones actuales

- registrarPerfil: implementada.
- consultarPerfiles: placeholder.
- consultarPerfil: placeholder.
- consultarPerfilesFiltros: placeholder.
- consultarPerfilesFormulario: placeholder.
- editarPerfil: placeholder.
- eliminarPerfil: placeholder.

## Entrada de registro

```json
{
  "nombre": "Administrador ERP",
  "descripcion": "Gestiona usuarios y estructura",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Devuelve el recurso en `data.perfil`, con permisos vacios, accesos vacios y metadatos de auditoria.
