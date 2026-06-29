import express from "express";
import * as rutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'API REST Node.js + MongoDB disponible.',
		data: {
			health: '/health',
			sesiones: '/sesiones/iniciarSesion',
			usuarios: '/gestion/usuarios/consultarUsuarios',
		},
	});
});

app.get('/health', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'OK',
		data: null,
	});
});

app.use(rutes.modulosRouter);
app.use(rutes.procesosRouter);
app.use(rutes.perfilesRouter);
app.use(rutes.sucursalesRouter);
app.use(rutes.departamentosRouter);
app.use(rutes.usuariosRouter);
app.use(rutes.sesionesRouter);

export { app };