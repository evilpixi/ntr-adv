/// <reference types="vite/client" />

/** Fallback desde .env en la raíz del proyecto (inyectado por Vite; puede ser string o objeto según el modo) */
declare const __ENV_FALLBACK__: string | Record<string, unknown>
