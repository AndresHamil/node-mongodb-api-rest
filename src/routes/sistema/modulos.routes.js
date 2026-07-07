import { Router } from "express";
import * as ModulosController from "../../controllers/sistema/sistemas/modulos/index.js";
import { validarSesionActiva } from "../../middlewares/validarSesionActiva.middleware.js";

const router = Router()
const LEGACY_BASE_PATH = '/sistema/modulo/modulos';
const BASE_PATH = '/sistema/sistemas/modulos';

router.use(LEGACY_BASE_PATH, validarSesionActiva)
router.use(BASE_PATH, validarSesionActiva)

router.get(`${LEGACY_BASE_PATH}/consultarModulos`, ModulosController.consultarModulos);
router.post(`${LEGACY_BASE_PATH}/consultarModulo`, ModulosController.consultarModulo);
router.post(`${LEGACY_BASE_PATH}/registrarModulo`, ModulosController.registrarModulo);
router.post(`${LEGACY_BASE_PATH}/consultarModulosFormulario`, ModulosController.consultarModulosFormulario);
router.put(`${LEGACY_BASE_PATH}/editarModulo`, ModulosController.editarModulo)
router.delete(`${LEGACY_BASE_PATH}/eliminarModulo`, ModulosController.eliminarModulo)

router.get(`${BASE_PATH}/consultarModulos`, ModulosController.consultarModulos);
router.post(`${BASE_PATH}/consultarModulo`, ModulosController.consultarModulo);
router.post(`${BASE_PATH}/registrarModulo`, ModulosController.registrarModulo);
router.post(`${BASE_PATH}/consultarModulosFormulario`, ModulosController.consultarModulosFormulario);
router.put(`${BASE_PATH}/editarModulo`, ModulosController.editarModulo)
router.delete(`${BASE_PATH}/eliminarModulo`, ModulosController.eliminarModulo)

export { router }; 