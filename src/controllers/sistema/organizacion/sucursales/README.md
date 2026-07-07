# Sucursales

## Proposito

Gestiona el registro de sucursales asociadas a una empresa del arbol organizacional.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js publica el contrato del recurso.
- registrarSucursal.controller.js orquesta HTTP y seguridad.
- methods/ concentra validaciones de negocio, acceso a MongoDB y construccion de respuesta.
- La jerarquia se valida contra la empresa padre.
- El mismo endpoint acepta `empresas[]` para registrar la misma sucursal en varias empresas.

## Operaciones actuales

- registrarSucursal: implementada.
- consultarSucursales: pendiente.
- consultarSucursal: pendiente.
- consultarSucursalesFiltros: pendiente.
- consultarSucursalesFormulario: pendiente.
- editarSucursal: pendiente.
- eliminarSucursal: pendiente.

## Entrada de registro

```json
{
  "empresaId": "6a4c27b32ed92b8fffc191b3",
  "nombre": "Sucursal Centro",
  "descripcion": "Operacion central",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Entrada masiva

```json
{
  "empresas": [
    "6a4c27b32ed92b8fffc191b3",
    "6a4c27b32ed92b8fffc191b4"
  ],
  "nombre": "Sucursal Centro",
  "descripcion": "Operacion central",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Incluye empresaId para mantener la referencia normalizada a la empresa.

Cuando el request usa `empresas[]`, la respuesta devuelve un arreglo con una sucursal registrada por cada empresa.
