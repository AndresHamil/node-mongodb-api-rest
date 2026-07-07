# Permisos

## Proposito

Gestiona los permisos de acceso a procesos, asignando una lectura base por perfil y excepciones por usuario cuando sea necesario.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js expone el contrato publico del recurso.
- registrarPermiso.controller.js resuelve HTTP, validacion de sesion y respuesta.
- methods/ concentra validaciones, persistencia y resolucion del modelo de permisos.
- El perfil recibe lectura base sobre el proceso.
- Los usuarios pueden tener override por proceso con tipo 0 lectura o 1 lectura y escritura.
- El login resuelve el permiso efectivo por usuario en funcion del perfil, el ambito organizacional y la excepcion individual.

## Operaciones actuales

- registrarPermiso: implementada.
- consultarPermisos: placeholder.
- consultarPermiso: placeholder.
- consultarPermisosFiltros: placeholder.
- consultarPermisosFormulario: placeholder.
- editarPermiso: placeholder.
- eliminarPermiso: placeholder.

## Entrada de asignacion

```json
{
  "procesoId": "6a4c3b641388876d302d758c",
  "sucursales": ["6a4c280f2ed92b8fffc191b4"],
  "departamentos": ["6a4c28182ed92b8fffc191b5"],
  "perfiles": ["6a4c28202ed92b8fffc191b6"],
  "usuarios": [
    {
      "id": "6a4c476badd97caf5a8d914d",
      "tipo": 1
    }
  ],
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Regla de negocio

- Todo perfil seleccionado recibe lectura base sobre el proceso.
- Un usuario seleccionado puede sobrescribir su permiso efectivo dentro de ese mismo perfil.
- `tipo: 0` significa lectura.
- `tipo: 1` significa lectura y escritura.

## Respuesta

Devuelve el recurso en `data.permiso`, agrupado en `modulo`, `proceso`, `perfiles`, `usuarios` y `alcance` para que el frontend pueda consumirlo sin reconstruir relaciones.