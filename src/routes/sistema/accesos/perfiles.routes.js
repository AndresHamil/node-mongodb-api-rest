import { Router } from "express";
import * as AccesosController from "../../../controllers/sistema/accesos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/accesos/perfiles";

router.use(BASE_PATH, validarSesionActiva);

router.get(`${BASE_PATH}/consultarPerfiles`, AccesosController.consultarPerfiles);
router.post(`${BASE_PATH}/consultarPerfil`, AccesosController.consultarPerfil);
router.post(`${BASE_PATH}/consultarPerfilesFiltros`, AccesosController.consultarPerfilesFiltros);
router.post(`${BASE_PATH}/consultarPerfilesFormulario`, AccesosController.consultarPerfilesFormulario);
router.post(`${BASE_PATH}/registrarPerfil`, AccesosController.registrarPerfil);
router.put(`${BASE_PATH}/editarPerfil`, AccesosController.editarPerfil);
router.delete(`${BASE_PATH}/eliminarPerfil`, AccesosController.eliminarPerfil);

export { router };