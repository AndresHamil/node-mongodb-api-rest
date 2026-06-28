import { Router } from "express";
import * as PerfilesController from "../../controllers/gestion/perfiles/index.js";
const router = Router()

router.post('/gestion/perfiles/registrarPerfil', PerfilesController.registrarPerfil);
router.put('/gestion/perfiles/editarPerfil', PerfilesController.editarPerfil);
router.delete('/gestion/perfiles/eliminarPerfil', PerfilesController.eliminarPerfil);
router.get('/gestion/perfiles/consultarPerfiles', PerfilesController.consultarPerfiles);
router.post('/gestion/perfiles/consultarPerfil', PerfilesController.consultarPerfil);
router.post('/gestion/perfiles/consultarPerfilesFormulario', PerfilesController.consultarPerfilesFormulario);
router.post('/gestion/perfiles/consultarPerfilesFiltros', PerfilesController.consultarPerfilesFiltros);


export { router }; 