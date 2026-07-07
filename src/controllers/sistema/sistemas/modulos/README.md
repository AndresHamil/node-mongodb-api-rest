# Modulos

## Proposito

Gestiona modulos funcionales del sistema y su clasificacion por tipo.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js expone el contrato publico del modulo.
- registrarModulo.controller.js resuelve HTTP, autenticacion y salida.
- methods/ concentra normalizacion, duplicados y persistencia.
- El tipo se normaliza a valores canonicos: gestion o sistemas.

## Operaciones actuales

- registrarModulo: implementada.
- consultarModulos: placeholder.
- consultarModulo: placeholder.
- consultarModulosFiltros: placeholder.
- consultarModulosFormulario: placeholder.
- editarModulo: placeholder.
- eliminarModulo: placeholder.

## Entrada de registro

```json
{
  "nombre": "Sistemas",
  "descripcion": "Modulo gestionar modulos y procesos",
  "tipo": 0,
  "codigo": "SIS",
  "icono": "pc-icon",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Devuelve tipo normalizado y metadatos de auditoria.
