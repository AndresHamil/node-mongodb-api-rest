import { Router } from "express";
import * as ProcesosController from "../../../controllers/sistema/sistemas/procesos/index.js";
import { validarSesionActiva } from "../../../middlewares/validarSesionActiva.middleware.js";

const router = Router();
const BASE_PATH = "/sistema/sistemas/procesos";

router.use(BASE_PATH, validarSesionActiva);

router.get(`${BASE_PATH}/consultarProcesos`, ProcesosController.consultarProcesos);
router.post(`${BASE_PATH}/consultarProceso`, ProcesosController.consultarProceso);
router.post(`${BASE_PATH}/consultarProcesosFormulario`, ProcesosController.consultarProcesosFormulario);
router.post(`${BASE_PATH}/registrarProceso`, ProcesosController.registrarProceso);
router.put(`${BASE_PATH}/editarProceso`, ProcesosController.editarProceso);
router.post(`${BASE_PATH}/consultarProcesosFiltros`, ProcesosController.consultarProcesosFiltros);
router.delete(`${BASE_PATH}/eliminarProceso`, ProcesosController.eliminarProceso);

export { router };