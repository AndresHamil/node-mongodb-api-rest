export const registrarErrorEstructurado = ({ error, contexto, req = null, detalles = null }) => {
    const payload = {
        level: "error",
        contexto,
        message: error?.message ?? "Unknown error",
        customMessage: error?.customMessage ?? null,
        statusCode: error?.statusCode ?? null,
        code: error?.code ?? null,
        method: req?.method ?? null,
        path: req?.originalUrl ?? null,
        actorUsuarioId: req?.usuarioSesionId ?? null,
        timestamp: new Date().toISOString(),
        detalles: detalles ?? error?.details ?? null,
        stack: error?.stack ?? null,
    };

    console.error(JSON.stringify(payload));
};