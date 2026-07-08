import { Router } from "express";
import * as DepartamentosController from "../../../controllers/sistema/organizacion/departamentos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/organizacion/departamentos";

router.use(BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/registrarDepartamento`, DepartamentosController.registrarDepartamento);

export { router };