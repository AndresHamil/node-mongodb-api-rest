import { Router } from "express";
import * as AccesosController from "../../controllers/sistema/accesos/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = '/sistema/acceso/accesos';
const PERMISOS_BASE_PATH = '/sistema/accesos/permisos';
const PERFILES_LEGACY_BASE_PATH = '/sistema/acceso/perfiles';
const PERFILES_BASE_PATH = '/sistema/accesos/perfiles';
const USUARIOS_LEGACY_BASE_PATH = '/sistema/acceso/usuarios';
const USUARIOS_BASE_PATH = '/sistema/accesos/usuarios';

router.use(BASE_PATH, validarSesionActiva);
router.use(PERMISOS_BASE_PATH, validarSesionActiva);
router.use(PERFILES_LEGACY_BASE_PATH, validarSesionActiva);
router.use(PERFILES_BASE_PATH, validarSesionActiva);
router.use(USUARIOS_LEGACY_BASE_PATH, validarSesionActiva);
router.use(USUARIOS_BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/asignarAccesoPerfil`, AccesosController.asignarAccesoPerfil);
router.post(`${PERMISOS_BASE_PATH}/registrarPermiso`, AccesosController.registrarPermiso);

router.get(`${PERFILES_LEGACY_BASE_PATH}/consultarPerfiles`, AccesosController.consultarPerfiles);
router.post(`${PERFILES_LEGACY_BASE_PATH}/consultarPerfil`, AccesosController.consultarPerfil);
router.post(`${PERFILES_LEGACY_BASE_PATH}/consultarPerfilesFiltros`, AccesosController.consultarPerfilesFiltros);
router.post(`${PERFILES_LEGACY_BASE_PATH}/consultarPerfilesFormulario`, AccesosController.consultarPerfilesFormulario);
router.put(`${PERFILES_LEGACY_BASE_PATH}/editarPerfil`, AccesosController.editarPerfil);
router.delete(`${PERFILES_LEGACY_BASE_PATH}/eliminarPerfil`, AccesosController.eliminarPerfil);

router.get(`${PERFILES_BASE_PATH}/consultarPerfiles`, AccesosController.consultarPerfiles);
router.post(`${PERFILES_BASE_PATH}/consultarPerfil`, AccesosController.consultarPerfil);
router.post(`${PERFILES_BASE_PATH}/consultarPerfilesFiltros`, AccesosController.consultarPerfilesFiltros);
router.post(`${PERFILES_BASE_PATH}/consultarPerfilesFormulario`, AccesosController.consultarPerfilesFormulario);
router.post(`${PERFILES_BASE_PATH}/registrarPerfil`, AccesosController.registrarPerfil);
router.put(`${PERFILES_BASE_PATH}/editarPerfil`, AccesosController.editarPerfil);
router.delete(`${PERFILES_BASE_PATH}/eliminarPerfil`, AccesosController.eliminarPerfil);

router.put(`${USUARIOS_LEGACY_BASE_PATH}/editarUsuario`, AccesosController.editarUsuario);
router.delete(`${USUARIOS_LEGACY_BASE_PATH}/eliminarUsuario`, AccesosController.eliminarUsuario);
router.get(`${USUARIOS_LEGACY_BASE_PATH}/consultarUsuarios`, AccesosController.consultarUsuarios);
router.get(`${USUARIOS_LEGACY_BASE_PATH}/:id`, AccesosController.consultarUsuario);
router.post(`${USUARIOS_LEGACY_BASE_PATH}/consultarUsuario`, AccesosController.consultarUsuario);
router.post(`${USUARIOS_LEGACY_BASE_PATH}/consultarUsuariosFormulario`, AccesosController.consultarUsuariosFormulario);
router.post(`${USUARIOS_LEGACY_BASE_PATH}/consultarUsuariosFiltros`, AccesosController.consultarUsuariosFiltros);

router.post(`${USUARIOS_BASE_PATH}/registrarUsuario`, AccesosController.registrarUsuario);
router.put(`${USUARIOS_BASE_PATH}/editarUsuario`, AccesosController.editarUsuario);
router.delete(`${USUARIOS_BASE_PATH}/eliminarUsuario`, AccesosController.eliminarUsuario);
router.get(`${USUARIOS_BASE_PATH}/consultarUsuarios`, AccesosController.consultarUsuarios);
router.get(`${USUARIOS_BASE_PATH}/:id`, AccesosController.consultarUsuario);
router.post(`${USUARIOS_BASE_PATH}/consultarUsuario`, AccesosController.consultarUsuario);
router.post(`${USUARIOS_BASE_PATH}/consultarUsuariosFormulario`, AccesosController.consultarUsuariosFormulario);
router.post(`${USUARIOS_BASE_PATH}/consultarUsuariosFiltros`, AccesosController.consultarUsuariosFiltros);

export { router };