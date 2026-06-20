import { b as InputFyTypeAny, S as SafeParseReturnType } from '../../errors-EOLUu52Y.cjs';
import { c as CompiledValidator, k as SchemaCacheOptions } from '../../observed-parse-B9mU0nv4.cjs';
export { u as cachedParse, v as compile, x as createHealthCheck, y as createHealthCheckHandler, E as createSchemaCache, N as observedParse, Q as observedSafeParse, U as secureParse, X as secureParseAsync } from '../../observed-parse-B9mU0nv4.cjs';
export { expressValidate, fastifyValidate, koaValidate, validate } from '../../integrations/express/index.cjs';

interface ServerValidatorOptions {
    schemaId?: string;
    useCache?: boolean;
    useCompile?: boolean;
    secure?: boolean;
    observe?: boolean;
    cacheOptions?: SchemaCacheOptions;
}
interface ServerValidator<T extends InputFyTypeAny> {
    parse(data: unknown): T["_output"];
    safeParse(data: unknown): SafeParseReturnType<T["_input"], T["_output"]>;
    parseAsync(data: unknown): Promise<T["_output"]>;
    compiled?: CompiledValidator<T>;
}
/** Validador server-side otimizado — compile + cache + security (10.3) */
declare function createServerValidator<T extends InputFyTypeAny>(schema: T, options?: ServerValidatorOptions): ServerValidator<T>;

export { CompiledValidator, SchemaCacheOptions, type ServerValidator, type ServerValidatorOptions, createServerValidator };
