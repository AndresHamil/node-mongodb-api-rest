# Procesos

## Proposito

Gestiona procesos asociados a un modulo del sistema.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js publica el contrato del recurso.
- registrarProceso.controller.js valida sesion y delega reglas al dominio.
- methods/ genera la url final a partir del modulo y del nombre del proceso.
- El cliente no envia ruta; el sistema calcula la direccion canonica y responde solo con url.

## Operaciones actuales

- registrarProceso: implementada.
- consultarProcesos: placeholder.
- consultarProceso: placeholder.
- consultarProcesosFiltros: placeholder.
- consultarProcesosFormulario: placeholder.
- editarProceso: placeholder.
- eliminarProceso: placeholder.

## Entrada de registro

```json
{
  "moduloId": "6a4c3b401388876d302d758b",
  "nombre": "Accesos",
  "descripcion": "Proceso para administrar accesos",
  "codigo": "ACS",
  "icono": "access-icon",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Devuelve url calculada segun el tipo y nombre del modulo.
