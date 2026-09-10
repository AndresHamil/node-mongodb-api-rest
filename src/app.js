import express from "express";
import { getCollection } from "./db.js";
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
			usuarios: '/sistema/accesos/usuarios/consultarUsuarios',
			debug_usuarios: '/debug/usuarios',
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

// Debug: SELECT * de usuarios sin autenticación
app.get('/debug/usuarios', async (_req, res) => {
	try {
		const usuariosCollection = await getCollection("usuarios");
		const usuarios = await usuariosCollection.find({}).toArray();
		res.json({
			success: true,
			total: usuarios.length,
			data: usuarios,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

app.use(rutes.modulosRouter);
app.use(rutes.procesosRouter);
app.use(rutes.accesosSistemaRouter);
app.use(rutes.permisosSistemaRouter);
app.use(rutes.perfilesSistemaRouter);
app.use(rutes.usuariosSistemaRouter);
app.use(rutes.empresasSistemaRouter);
app.use(rutes.sucursalesSistemaRouter);
app.use(rutes.departamentosSistemaRouter);
app.use(rutes.sesionesRouter);

export { app };