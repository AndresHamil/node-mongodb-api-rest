import {config} from 'dotenv';
config();

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017';
const LOCAL_MONGODB_URI_PATTERN = /^mongodb:\/\/(?:[^@/]+@)?(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?]|$)/i;

export const PORT = process.env.PORT || 3000;
export const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
export const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
export const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'valian';
export const IS_LOCAL_MONGODB = LOCAL_MONGODB_URI_PATTERN.test(MONGODB_URI.trim());
export const MONGODB_DEPLOYMENT_LABEL = IS_LOCAL_MONGODB ? "Local" : "Nube";