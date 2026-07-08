import { Router } from "express";
import * as AccesosController from "../../../controllers/sistema/accesos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/accesos/usuarios";

router.use(BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/registrarUsuario`, AccesosController.registrarUsuario);
router.put(`${BASE_PATH}/editarUsuario`, AccesosController.editarUsuario);
router.delete(`${BASE_PATH}/eliminarUsuario`, AccesosController.eliminarUsuario);
router.get(`${BASE_PATH}/consultarUsuarios`, AccesosController.consultarUsuarios);
router.get(`${BASE_PATH}/:id`, AccesosController.consultarUsuario);
router.post(`${BASE_PATH}/consultarUsuario`, AccesosController.consultarUsuario);
router.post(`${BASE_PATH}/consultarUsuariosFormulario`, AccesosController.consultarUsuariosFormulario);
router.post(`${BASE_PATH}/consultarUsuariosFiltros`, AccesosController.consultarUsuariosFiltros);

export { router };