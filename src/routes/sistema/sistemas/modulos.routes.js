import { Router } from "express";
import * as ModulosController from "../../../controllers/sistema/sistemas/modulos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/sistemas/modulos";

router.use(BASE_PATH, validarSesionActiva);

router.get(`${BASE_PATH}/consultarModulos`, ModulosController.consultarModulos);
router.post(`${BASE_PATH}/consultarModulo`, ModulosController.consultarModulo);
router.post(`${BASE_PATH}/registrarModulo`, ModulosController.registrarModulo);
router.post(`${BASE_PATH}/consultarModulosFormulario`, ModulosController.consultarModulosFormulario);
router.put(`${BASE_PATH}/editarModulo`, ModulosController.editarModulo);
router.delete(`${BASE_PATH}/eliminarModulo`, ModulosController.eliminarModulo);

export { router };