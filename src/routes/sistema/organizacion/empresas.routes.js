import { Router } from "express";
import * as EmpresasController from "../../../controllers/sistema/organizacion/empresas/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/organizacion/empresas";

router.use(BASE_PATH, validarSesionActiva);

router.get(`${BASE_PATH}/consultarEmpresas`, EmpresasController.consultarEmpresas);
router.post(`${BASE_PATH}/registrarEmpresa`, EmpresasController.registrarEmpresa);

export { router };