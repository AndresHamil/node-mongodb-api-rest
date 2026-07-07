# Departamentos

## Proposito

Gestiona departamentos vinculados a una sucursal dentro de la organizacion del sistema, derivando la empresa desde esa sucursal.

## Filosofia

- Carpeta autocontenida por recurso.
- index.js define el contrato publico del modulo.
- Los controladores resuelven transporte HTTP.
- methods/ mantiene reglas de jerarquia y persistencia.
- Las referencias se guardan por id para sostener consistencia entre empresa, sucursal y departamento.
- El request solo necesita sucursalId; la empresa se resuelve automaticamente desde la sucursal.
- El mismo endpoint acepta `sucursales[]` para registrar el mismo departamento en varias sucursales de una misma empresa.

## Operaciones actuales

- registrarDepartamento: implementada.
- consultarDepartamentos: placeholder.
- consultarDepartamento: placeholder.
- consultarDepartamentosFiltros: placeholder.
- consultarDepartamentosFormulario: placeholder.
- editarDepartamento: placeholder.
- eliminarDepartamento: placeholder.

## Entrada de registro

```json
{
  "sucursalId": "6a4c280f2ed92b8fffc191b4",
  "nombre": "Recursos Humanos",
  "descripcion": "Gestion del personal",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Entrada masiva

```json
{
  "sucursales": [
    "6a4c280f2ed92b8fffc191b4",
    "6a4c28182ed92b8fffc191b5"
  ],
  "nombre": "Administracion",
  "descripcion": "Gestión del sistema",
  "usuarioRegistroId": "6a41aa550ea60f7a12e50d73"
}
```

## Respuesta

Incluye empresaId y sucursalId en la respuesta para mantener la jerarquia explicita, aunque empresaId ya no se envía en el request.

Cuando el request usa `sucursales[]`, la respuesta devuelve un arreglo con un departamento registrado por cada sucursal.
