import { Router } from "express";
import * as SesionesController from "../../controllers/otros/sesiones/index.js"

const router = Router()

router.post('/sesiones/iniciarSesion', SesionesController.iniciarSesion);
router.post('/sesiones/cerrarSesion', SesionesController.cerrarSesion);

export { router }; 