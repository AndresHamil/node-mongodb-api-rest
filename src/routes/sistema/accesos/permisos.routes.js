import { Router } from "express";
import * as AccesosController from "../../../controllers/sistema/accesos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/accesos/permisos";

router.use(BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/registrarPermiso`, AccesosController.registrarPermiso);

export { router };