import { Router } from "express";
import * as ModulosController from "../../controllers/sistema/modulos/index.js";

const router = Router()

router.get('/sistema/modulos/consultarModulos', ModulosController.consultarModulos);
router.post('/sistema/modulos/consultarModulo', ModulosController.consultarModulo);
router.post('/sistema/modulos/registrarModulo', ModulosController.registrarModulo);
router.post('/sistema/modulos/consultarModulosFormulario', ModulosController.consultarModulosFormulario);
router.put('/sistema/modulos/editarModulo', ModulosController.editarModulo)
router.delete('/sistema/modulos/eliminarModulo', ModulosController.eliminarModulo)

export { router }; 