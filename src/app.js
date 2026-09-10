import express from "express";
import { getCollection } from "./db.js";
import * as rutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
	const htmlContent = `
	<!DOCTYPE html>
	<html lang="es">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>API REST - Node.js + MongoDB</title>
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}

			body {
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				background: linear-gradient(135deg, #0a0e27 0%, #16213e 50%, #1a3a52 100%);
				background-attachment: fixed;
				min-height: 100vh;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 20px;
				position: relative;
				overflow-x: hidden;
			}

			/* Elementos decorativos de fondo */
			body::before {
				content: '';
				position: fixed;
				top: -50%;
				right: -10%;
				width: 600px;
				height: 600px;
				background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
				border-radius: 50%;
				pointer-events: none;
				animation: float 20s ease-in-out infinite;
				filter: blur(40px);
			}

			body::after {
				content: '';
				position: fixed;
				bottom: -20%;
				left: -10%;
				width: 500px;
				height: 500px;
				background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%);
				border-radius: 50%;
				pointer-events: none;
				animation: float 25s ease-in-out infinite reverse;
				filter: blur(40px);
			}

			@keyframes float {
				0%, 100% { transform: translateY(0px); }
				50% { transform: translateY(40px); }
			}

			.container {
				max-width: 1000px;
				width: 100%;
				position: relative;
				z-index: 1;
			}

			.glass-card {
				background: rgba(15, 23, 42, 0.5);
				backdrop-filter: blur(30px);
				-webkit-backdrop-filter: blur(30px);
				border: 1px solid rgba(148, 163, 184, 0.2);
				border-radius: 25px;
				box-shadow: 0 8px 48px rgba(15, 23, 42, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
				transition: all 0.4s ease;
				overflow: hidden;
			}

			.glass-card:hover {
				background: rgba(15, 23, 42, 0.55);
				border-color: rgba(148, 163, 184, 0.3);
				box-shadow: 0 15px 60px rgba(59, 130, 246, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15);
				transform: translateY(-5px);
			}

			.header {
				background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%);
				backdrop-filter: blur(30px);
				-webkit-backdrop-filter: blur(30px);
				padding: 60px 40px;
				text-align: center;
				border-bottom: 1px solid rgba(148, 163, 184, 0.15);
				position: relative;
			}

			.header::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.4), transparent);
			}

			.header h1 {
				font-size: 2.5em;
				color: #e2e8f0;
				margin-bottom: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 15px;
				font-weight: 700;
				letter-spacing: 1px;
				text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
			}

			.header .rocket {
				font-size: 3em;
				animation: bounce 2s infinite;
				filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4));
			}

			@keyframes bounce {
				0%, 100% { transform: translateY(0); }
				50% { transform: translateY(-20px); }
			}

			.header p {
				font-size: 1.1em;
				color: rgba(226, 232, 240, 0.75);
				font-weight: 300;
				letter-spacing: 0.5px;
			}

			.content {
				padding: 40px;
			}

			.status-section {
				background: rgba(30, 41, 59, 0.4);
				backdrop-filter: blur(25px);
				-webkit-backdrop-filter: blur(25px);
				border: 1px solid rgba(59, 130, 246, 0.25);
				padding: 25px;
				border-radius: 18px;
				margin-bottom: 40px;
				box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.08);
			}

			.status-item {
				display: flex;
				align-items: center;
				gap: 15px;
				margin-bottom: 15px;
				color: rgba(226, 232, 240, 0.95);
			}

			.status-item:last-child {
				margin-bottom: 0;
			}

			.status-label {
				font-weight: 600;
				color: rgba(148, 163, 184, 0.8);
				min-width: 150px;
				font-size: 0.95em;
			}

			.status-value {
				color: rgba(59, 130, 246, 1);
				font-family: 'Courier New', monospace;
				font-weight: 500;
			}

			.endpoints-section h2,
			.stack-section h2 {
				color: #e2e8f0;
				margin-bottom: 25px;
				font-size: 1.5em;
				font-weight: 700;
				display: flex;
				align-items: center;
				gap: 12px;
				letter-spacing: 0.5px;
			}

			.endpoints-section h2::after,
			.stack-section h2::after {
				content: '';
				flex: 1;
				height: 1px;
				background: linear-gradient(90deg, rgba(148, 163, 184, 0.3), transparent);
				margin-left: 20px;
			}

			.endpoints-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
				gap: 20px;
				margin-bottom: 40px;
			}

			.endpoint-card {
				background: rgba(30, 41, 59, 0.35);
				backdrop-filter: blur(20px);
				-webkit-backdrop-filter: blur(20px);
				border: 1px solid rgba(59, 130, 246, 0.2);
				padding: 25px;
				border-radius: 18px;
				box-shadow: 0 8px 32px rgba(15, 23, 42, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08);
				transition: all 0.3s ease;
				cursor: pointer;
				position: relative;
				overflow: hidden;
			}

			.endpoint-card::before {
				content: '';
				position: absolute;
				top: 0;
				left: -100%;
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
				transition: left 0.5s ease;
			}

			.endpoint-card:hover::before {
				left: 100%;
			}

			.endpoint-card:hover {
				background: rgba(59, 130, 246, 0.12);
				border-color: rgba(59, 130, 246, 0.4);
				transform: translateY(-8px);
				box-shadow: 0 15px 50px rgba(59, 130, 246, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1);
			}

			.endpoint-method {
				display: inline-block;
				background: rgba(59, 130, 246, 0.25);
				backdrop-filter: blur(15px);
				-webkit-backdrop-filter: blur(15px);
				border: 1px solid rgba(59, 130, 246, 0.4);
				padding: 6px 12px;
				border-radius: 6px;
				font-size: 0.8em;
				font-weight: 700;
				margin-bottom: 12px;
				color: #3b82f6;
				letter-spacing: 1px;
			}

			.endpoint-path {
				font-family: 'Courier New', monospace;
				font-size: 0.9em;
				margin-bottom: 10px;
				word-break: break-all;
				color: rgba(226, 232, 240, 0.95);
				font-weight: 500;
			}

			.endpoint-description {
				font-size: 0.85em;
				color: rgba(148, 163, 184, 0.85);
				line-height: 1.5;
				font-weight: 300;
			}

			.stack-section {
				background: rgba(30, 41, 59, 0.4);
				backdrop-filter: blur(25px);
				-webkit-backdrop-filter: blur(25px);
				border: 1px solid rgba(34, 197, 94, 0.2);
				padding: 30px;
				border-radius: 18px;
				box-shadow: 0 8px 32px rgba(34, 197, 94, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.08);
			}

			.stack-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
				gap: 15px;
			}

			.stack-item {
				background: rgba(30, 41, 59, 0.35);
				backdrop-filter: blur(15px);
				-webkit-backdrop-filter: blur(15px);
				border: 1px solid rgba(34, 197, 94, 0.25);
				padding: 20px 15px;
				border-radius: 15px;
				text-align: center;
				transition: all 0.3s ease;
				box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
			}

			.stack-item:hover {
				background: rgba(34, 197, 94, 0.12);
				border-color: rgba(34, 197, 94, 0.4);
				transform: translateY(-3px);
				box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1);
			}

			.stack-name {
				font-weight: 600;
				color: rgba(226, 232, 240, 0.95);
				margin-bottom: 5px;
				font-size: 0.95em;
			}

			.stack-version {
				font-size: 0.8em;
				color: rgba(34, 197, 94, 0.9);
				font-family: 'Courier New', monospace;
				font-weight: 500;
			}

			.footer {
				background: rgba(15, 23, 42, 0.3);
				backdrop-filter: blur(20px);
				-webkit-backdrop-filter: blur(20px);
				border-top: 1px solid rgba(148, 163, 184, 0.15);
				padding: 25px 40px;
				text-align: center;
				color: rgba(148, 163, 184, 0.8);
				font-size: 0.9em;
			}

			.footer a {
				color: rgba(59, 130, 246, 0.95);
				text-decoration: none;
				font-weight: 600;
				transition: color 0.3s ease;
			}

			.footer a:hover {
				color: rgba(34, 197, 94, 0.95);
				text-decoration: underline;
			}

			@media (max-width: 768px) {
				.header h1 {
					font-size: 1.8em;
				}

				.header {
					padding: 30px 20px;
				}

				.content {
					padding: 20px;
				}

				.endpoints-grid {
					grid-template-columns: 1fr;
				}

				.stack-grid {
					grid-template-columns: repeat(2, 1fr);
				}
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="glass-card">
				<div class="header">
					<h1>
						<span class="rocket">🚀</span>
						API REST en funcionamiento
					</h1>
					<p>Backend robusto con Node.js, Express y MongoDB</p>
				</div>

				<div class="content">
					<div class="status-section">
						<div class="status-item">
							<span class="status-label">Estado:</span>
							<span class="status-value">✅ OK</span>
						</div>
						<div class="status-item">
							<span class="status-label">Versión:</span>
							<span class="status-value">2.0</span>
						</div>
						<div class="status-item">
							<span class="status-label">Ambiente:</span>
							<span class="status-value">${process.env.NODE_ENV || 'desarrollo'}</span>
						</div>
						<div class="status-item">
							<span class="status-label">Hora:</span>
							<span class="status-value">${new Date().toLocaleString('es-ES')}</span>
						</div>
					</div>

					<div class="endpoints-section">
						<h2>📡 Endpoints Principales</h2>
						<div class="endpoints-grid">
							<div class="endpoint-card">
								<div class="endpoint-method">GET</div>
								<div class="endpoint-path">/health</div>
								<div class="endpoint-description">Verificar salud de la API</div>
							</div>

							<div class="endpoint-card">
								<div class="endpoint-method">POST</div>
								<div class="endpoint-path">/sesiones/iniciarSesion</div>
								<div class="endpoint-description">Iniciar sesión y obtener token</div>
							</div>

							<div class="endpoint-card">
								<div class="endpoint-method">GET</div>
								<div class="endpoint-path">/gestion/usuarios/consultarUsuarios</div>
								<div class="endpoint-description">Obtener lista de usuarios</div>
							</div>

							<div class="endpoint-card">
								<div class="endpoint-method">GET</div>
								<div class="endpoint-path">/debug/usuarios</div>
								<div class="endpoint-description">Ver usuarios en base de datos</div>
							</div>
						</div>
					</div>

					<div class="stack-section">
						<h2>📦 Stack Tecnológico</h2>
						<div class="stack-grid">
							<div class="stack-item">
								<div class="stack-name">Node.js</div>
								<div class="stack-version">22.x+</div>
							</div>
							<div class="stack-item">
								<div class="stack-name">Express.js</div>
								<div class="stack-version">4.x</div>
							</div>
							<div class="stack-item">
								<div class="stack-name">MongoDB</div>
								<div class="stack-version">6.x+</div>
							</div>
							<div class="stack-item">
								<div class="stack-name">bcrypt</div>
								<div class="stack-version">5.x</div>
							</div>
						</div>
					</div>
				</div>

				<div class="footer">
					<p>
						📚 <a href="https://github.com/AndresHamil/node-mongodb-api-rest#readme" target="_blank">Documentación</a>
						·
						💻 <a href="https://github.com/AndresHamil/node-mongodb-api-rest" target="_blank">GitHub</a>
					</p>
				</div>
			</div>
		</div>
	</body>
	</html>
	`;

	res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(htmlContent);
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