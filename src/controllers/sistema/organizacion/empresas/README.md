# Empresas

## Proposito

Gestiona el registro de empresas dentro del arbol organizacional de sistema.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js expone el contrato publico del recurso.
- registrarEmpresa.controller.js resuelve HTTP, validacion de sesion y respuesta.
- methods/ contiene acceso a datos, validaciones y transformaciones del dominio.
- Las operaciones no implementadas se exponen como notImplemented para conservar un contrato estable.

## Operaciones actuales

- registrarEmpresa: implementada.
- consultarEmpresas: implementada.
- consultarEmpresa: pendiente.
- consultarEmpresasFiltros: pendiente.
- consultarEmpresasFormulario: pendiente.
- editarEmpresa: pendiente.
- eliminarEmpresa: pendiente.

## Consulta de empresas

`GET /sistema/organizacion/empresas/consultarEmpresas`

Devuelve la informacion completa de las empresas registradas, incluyendo metadatos de auditoria.

## Entrada de registro

```json
{
  "nombre": "Valian Holding",
  "descripcion": "Empresa principal",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Devuelve metadatos de auditoria y no expone campos auxiliares internos.
