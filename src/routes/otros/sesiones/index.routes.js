import { Router } from "express";
import * as SesionesController from "../../../controllers/otros/sesiones/index.js";

const router = Router();
const SESIONES_BASE_PATH = "/sesiones";

router.post(`${SESIONES_BASE_PATH}/iniciarSesion`, SesionesController.iniciarSesion);
router.post(`${SESIONES_BASE_PATH}/cerrarSesion`, SesionesController.cerrarSesion);

export { router };