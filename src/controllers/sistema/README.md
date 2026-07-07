# Sistema

## Proposito

Centraliza los recursos base para que el sistema funcione por si mismo: organizacion, catalogo de modulos y procesos, perfiles, usuarios y permisos.

## Estructura

- organizacion/: empresas, sucursales y departamentos del arbol organizacional.
- sistemas/: modulos y procesos que forman el menu y los permisos tecnicos.
- accesos/: perfiles, usuarios y permisos efectivos por proceso.
- methods/: utilidades compartidas del dominio sistema.

## Criterios de diseno

- Cada recurso vive en un slice autocontenido con index.js como contrato publico.
- Los controladores HTTP deben quedarse delgados y delegar validacion y persistencia a methods/.
- La jerarquia se persiste por ids normalizados aunque el request pueda usar contratos simplificados o masivos.
- Las operaciones no implementadas se publican con notImplemented para no romper el contrato.

## Objetivo practico

Este arbol debe permitir registrar la estructura base del sistema y resolver el login con contexto, modulos, procesos, iconos, urls y permisos efectivos sin depender de gestion.