import { Router } from "express";
import * as AccesosController from "../../../controllers/sistema/accesos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/acceso/accesos";

router.use(BASE_PATH, validarSesionActiva);

router.post(`${BASE_PATH}/asignarAccesoPerfil`, AccesosController.asignarAccesoPerfil);

export { router };