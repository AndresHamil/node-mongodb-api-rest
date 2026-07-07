import { Router } from "express";
import * as UsuariosController from "../../controllers/sistema/accesos/usuarios/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";

const router = Router()
const BASE_PATH = '/gestion/usuario/usuarios';

router.use(BASE_PATH, validarSesionActiva)

router.put(`${BASE_PATH}/editarUsuario`, UsuariosController.editarUsuario)
router.delete(`${BASE_PATH}/eliminarUsuario`, UsuariosController.eliminarUsuario)
router.get(`${BASE_PATH}/consultarUsuarios`, UsuariosController.consultarUsuarios);
router.get(`${BASE_PATH}/:id`, UsuariosController.consultarUsuario);
router.post(`${BASE_PATH}/consultarUsuario`, UsuariosController.consultarUsuario);
router.post(`${BASE_PATH}/consultarUsuariosFormulario`, UsuariosController.consultarUsuariosFormulario);
router.post(`${BASE_PATH}/consultarUsuariosFiltros`, UsuariosController.consultarUsuariosFiltros);

export { router }; 