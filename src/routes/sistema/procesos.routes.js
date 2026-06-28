import { Router } from "express";
import * as ProcesosController from "../../controllers/sistema/procesos/index.js";
const router = Router()

router.get('/sistema/procesos/consultarProcesos', ProcesosController.consultarProcesos);
router.post('/sistema/procesos/consultarProceso', ProcesosController.consultarProceso);
router.post('/sistema/procesos/consultarProcesosFormulario', ProcesosController.consultarProcesosFormulario);
router.post('/sistema/procesos/registrarProceso', ProcesosController.registrarProceso);
router.put('/sistema/procesos/editarProceso', ProcesosController.editarProceso);
router.post('/sistema/procesos/consultarProcesosFiltros', ProcesosController.consultarProcesosFiltros);
router.delete('/sistema/procesos/eliminarProceso', ProcesosController.eliminarProceso);

export { router }; 