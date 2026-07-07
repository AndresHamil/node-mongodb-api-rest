import { Router } from "express";
import * as PerfilesController from "../../controllers/sistema/accesos/perfiles/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";
const router = Router()
const BASE_PATH = '/gestion/perfil/perfiles';

router.use(BASE_PATH, validarSesionActiva)

router.put(`${BASE_PATH}/editarPerfil`, PerfilesController.editarPerfil);
router.delete(`${BASE_PATH}/eliminarPerfil`, PerfilesController.eliminarPerfil);
router.get(`${BASE_PATH}/consultarPerfiles`, PerfilesController.consultarPerfiles);
router.post(`${BASE_PATH}/consultarPerfil`, PerfilesController.consultarPerfil);
router.post(`${BASE_PATH}/consultarPerfilesFormulario`, PerfilesController.consultarPerfilesFormulario);
router.post(`${BASE_PATH}/consultarPerfilesFiltros`, PerfilesController.consultarPerfilesFiltros);


export { router }; 