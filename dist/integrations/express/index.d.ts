import { b as InputFyTypeAny } from '../../errors-EOLUu52Y.js';

interface HttpRequest {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    headers?: unknown;
    /** Dados validados pelo middleware InputFy */
    validated?: unknown;
}
interface HttpResponse {
    status(code: number): HttpResponse;
    json(body: unknown): void;
}
type NextFunction = (err?: unknown) => void;
type ValidationSource = "body" | "query" | "params" | "headers" | ((req: HttpRequest) => unknown);
interface HttpValidateOptions {
    source?: ValidationSource;
    statusCode?: number;
    /** Onde gravar o resultado parseado (default: `validated`) */
    target?: "validated" | "body";
    /** Nome da propriedade em req (default: source ou `validated`) */
    property?: string;
}
/** Middleware Express/Fastify/Koa — valida req contra schema (7.1) */
declare function validate<T extends InputFyTypeAny>(schema: T, options?: HttpValidateOptions): (req: HttpRequest, res: HttpResponse, next: NextFunction) => void;
/** Alias explícito para Express */
declare const expressValidate: typeof validate;
/** Hook preValidation para Fastify */
declare function fastifyValidate<T extends InputFyTypeAny>(schema: T, options?: HttpValidateOptions): {
    preValidation: (req: HttpRequest, reply: HttpResponse, done: NextFunction) => void;
};
/** Middleware Koa — retorna async (ctx, next) */
declare function koaValidate<T extends InputFyTypeAny>(schema: T, options?: HttpValidateOptions): (ctx: {
    request: HttpRequest;
    body?: unknown;
    validated?: unknown;
    throw: (status: number, body: unknown) => never;
}, next: () => Promise<void>) => Promise<void>;

export { type HttpRequest, type HttpResponse, type HttpValidateOptions, type NextFunction, type ValidationSource, expressValidate, fastifyValidate, koaValidate, validate };
