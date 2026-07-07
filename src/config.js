import {config} from 'dotenv';
config();

export const PORT = process.env.PORT || 3000;
export const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
export const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
export const DB_DATABASE = process.env.DB_DATABASE || 'ValianDB';
export const SESSION_DURATION_HOURS = Number(process.env.SESSION_DURATION_HOURS || 12);
export const SESSION_INACTIVITY_MINUTES = Number(process.env.SESSION_INACTIVITY_MINUTES || 60);
export const SESSION_RENEWAL_THRESHOLD_MINUTES = Number(process.env.SESSION_RENEWAL_THRESHOLD_MINUTES || 2);
export const SESSION_MAX_ACTIVE = Number(process.env.SESSION_MAX_ACTIVE || 5);
export const DB_COLLECTION_USUARIOS = process.env.DB_COLLECTION_USUARIOS || 'usuarios';
export const DB_COLLECTION_SESIONES = process.env.DB_COLLECTION_SESIONES || 'sesiones';
export const DB_COLLECTION_EMPRESAS = process.env.DB_COLLECTION_EMPRESAS || 'empresas';
export const DB_COLLECTION_SUCURSALES = process.env.DB_COLLECTION_SUCURSALES || 'sucursales';
export const DB_COLLECTION_DEPARTAMENTOS = process.env.DB_COLLECTION_DEPARTAMENTOS || 'departamentos';
export const DB_COLLECTION_PERFILES = process.env.DB_COLLECTION_PERFILES || 'perfiles';
export const DB_COLLECTION_MODULOS = process.env.DB_COLLECTION_MODULOS || 'modulos';
export const DB_COLLECTION_PROCESOS = process.env.DB_COLLECTION_PROCESOS || 'procesos';


