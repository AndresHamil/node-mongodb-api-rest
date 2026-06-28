export const notImplemented = (controllerName) => {
    return (_req, res) => {
        res.status(501).json({
            success: false,
            message: `${controllerName} pendiente de implementar en MongoDB.`,
            error: null,
            data: null,
        });
    };
};