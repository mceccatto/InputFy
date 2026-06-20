import { I as InputFyError, b as InputFyTypeAny, S as SafeParseReturnType } from '../../errors-EOLUu52Y.cjs';

declare class TRPCInputFyError extends InputFyError {
    readonly code: "BAD_REQUEST";
    constructor(error: InputFyError);
}
/** Parser de input tRPC — substitui z.object() em .input() (7.3) */
declare function inputfyInput<T extends InputFyTypeAny>(schema: T): {
    _type: "inputfy";
    schema: T;
    parse(input: unknown): T["_output"];
    safeParse(input: unknown): SafeParseReturnType<any, any>;
};
/** Factory curta para procedures */
declare function createInputFyValidator<T extends InputFyTypeAny>(schema: T): (input: unknown) => T["_output"];
interface TRPCMiddlewareOpts<TContext = unknown> {
    ctx?: TContext;
}
interface TRPCMiddlewareParams<TInput, TContext = unknown> {
    next: (opts?: {
        ctx?: Partial<TContext>;
    }) => Promise<unknown>;
    input: TInput;
    rawInput: unknown;
    ctx: TContext;
}
/** Middleware genérico para tRPC server (sem dependência de @trpc/server) */
declare function inputfyMiddleware<T extends InputFyTypeAny, TContext = unknown>(schema: T): (opts: TRPCMiddlewareParams<unknown, TContext>) => Promise<unknown>;
/** Combina schema + middleware em um único export */
declare function inputfyProcedure<T extends InputFyTypeAny>(schema: T): {
    input: {
        _type: "inputfy";
        schema: T;
        parse(input: unknown): T["_output"];
        safeParse(input: unknown): SafeParseReturnType<any, any>;
    };
    parse: (input: unknown) => T["_output"];
    middleware: (opts: TRPCMiddlewareParams<unknown, unknown>) => Promise<unknown>;
};

export { TRPCInputFyError, type TRPCMiddlewareOpts, type TRPCMiddlewareParams, createInputFyValidator, inputfyInput, inputfyMiddleware, inputfyProcedure };
