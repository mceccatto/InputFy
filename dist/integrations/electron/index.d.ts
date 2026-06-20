import { b as InputFyTypeAny } from '../../errors-EOLUu52Y.js';
import { f as formatValidationFailure } from '../../shared-PawOK5pj.js';

interface IpcEvent {
    sender: {
        send(channel: string, ...args: unknown[]): void;
    };
    reply(channel: string, ...args: unknown[]): void;
}
type IpcHandler<TOutput> = (event: IpcEvent, data: TOutput) => void | Promise<void>;
interface SecureIpcOptions {
    /** Sanitiza payload antes de validar (default: true) */
    sanitize?: boolean;
    /** Canal de erro (default: `${channel}:error`) */
    errorChannel?: string;
    /** Responde automaticamente com erro de validação (default: true) */
    replyOnError?: boolean;
}
/** Handler IPC com validação de schema (7.5) */
declare function validateIpcHandler<T extends InputFyTypeAny>(channel: string, schema: T, handler: IpcHandler<T["_output"]>, options?: SecureIpcOptions): (event: IpcEvent, rawData: unknown) => void | Promise<void>;
/** Registra handler no ipcMain (duck-typed) */
declare function registerSecureIpcHandler<T extends InputFyTypeAny>(ipcMain: {
    handle(channel: string, listener: (event: IpcEvent, ...args: unknown[]) => unknown): void;
    on(channel: string, listener: (event: IpcEvent, ...args: unknown[]) => void): void;
}, channel: string, schema: T, handler: IpcHandler<T["_output"]>, options?: SecureIpcOptions & {
    mode?: "handle" | "on";
}): void;
/** Valida mensagem IPC sem registrar handler */
declare function parseIpcMessage<T extends InputFyTypeAny>(schema: T, rawData: unknown, options?: Pick<SecureIpcOptions, "sanitize">): {
    success: true;
    data: T["_output"];
} | {
    success: false;
    error: ReturnType<typeof formatValidationFailure>;
};

export { type IpcEvent, type IpcHandler, type SecureIpcOptions, parseIpcMessage, registerSecureIpcHandler, validateIpcHandler };
