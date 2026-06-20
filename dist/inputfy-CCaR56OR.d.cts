import { b as InputFyTypeAny, S as SafeParseReturnType, a as InputFyType, l as SchemaDef, P as ParseContext, k as InputFyIssue, V as ValidationContext, I as InputFyError } from './errors-EOLUu52Y.cjs';
import { F as InputFyLazy, G as InputFyObject, I as InputFyString, K as InputFyUnion, a as InputFyNumber, H as InputFyPipeline, b as InputFyBoolean, c as InputFyBigInt, d as InputFyDate, e as InputFyVoid, f as InputFyAny, g as InputFyUnknown, h as InputFyNever, i as InputFyNaN, o as object, s as strictObject, l as looseObject, j as array, t as tuple, u as union, k as discriminatedUnion, m as intersection, r as record, n as map, p as set, q as lazy, v as promise, w as preprocess, x as pipeline, _ as _function, y as InputFyLiteral, z as InputFyEnum, A as InputFyNativeEnum, B as InputFyInstanceof, C as InputFyCustom } from './complex-DYeJT5M1.cjs';
import { r as StreamValidatorOptions, Y as StreamValidationResult, L as LazyRegistryOptions, Z as SchemaLoader, W as WorkerPoolOptions, b as BenchmarkSuite, B as BenchmarkOptions, a as BenchmarkResult, O as ObservabilityConfig, T as TracerProvider, h as OtelTracer, g as OtelSpan, F as FieldFailureStat, _ as MetricLabels, o as SecurityConfig, s as SuspiciousPattern, R as RedosAnalysis, q as SignedSchema, v as compile, t as cachedCompile, u as cachedParse, E as createSchemaCache, M as isCompilable, D as createRateLimiter, w as createAuditLog, n as SecurityAuditLog, U as secureParse, X as secureParseAsync, l as SchemaRegistry, G as createSchemaRegistry, x as createHealthCheck, y as createHealthCheckHandler, Q as observedSafeParse, N as observedParse, z as createObservedSchema } from './observed-parse-B9mU0nv4.cjs';
import { I as InputFyGlobalConfig, b as LocaleCode, a as IssueCodeErrorMap } from './types-URGDvyHZ.cjs';
import * as node_stream from 'node:stream';
import { f as formatErrorHTML, a as aggregateBySeverity, c as countBySeverity } from './severity-C1YH4EOu.cjs';

declare function config(options: InputFyGlobalConfig): void;
declare function setLocale(locale: LocaleCode): void;
declare function getLocale(): LocaleCode;
/** Restaura configuração padrão (útil em testes) */
declare function resetConfig(): void;

/** Factory para error map por código (3.3) */
declare function issueCodeErrorMap(map: IssueCodeErrorMap): IssueCodeErrorMap;

declare function parseNDJSONLine<T extends InputFyTypeAny>(schema: T, line: string): SafeParseReturnType<T["_input"], T["_output"]>;
/** Valida múltiplas linhas NDJSON (4.3) */
declare function validateNDJSON<T extends InputFyTypeAny>(schema: T, input: string, options?: StreamValidatorOptions): StreamValidationResult<T>[];
/** Async generator para fluxos NDJSON contínuos */
declare function validateNDJSONStream<T extends InputFyTypeAny>(schema: T, source: AsyncIterable<string | Uint8Array>, options?: StreamValidatorOptions): AsyncGenerator<StreamValidationResult<T>>;
/** Cria Transform stream Node.js para NDJSON */
declare function createNDJSONValidator<T extends InputFyTypeAny>(schema: T, options?: StreamValidatorOptions): node_stream.Transform;

/** Schema com carregamento assíncrono sob demanda (4.6) */
declare class InputFyDeferred<T extends InputFyTypeAny> extends InputFyType<T["_input"], T["_output"]> {
    readonly _def: SchemaDef & {
        loader: () => T | Promise<T>;
    };
    private resolved;
    constructor(loader: () => T | Promise<T>);
    resolve(): Promise<T>;
    _parse(ctx: ParseContext): T["_output"] | Promise<T["_output"]>;
    protected _clone(): this;
}
declare function deferred<T extends InputFyTypeAny>(loader: () => T | Promise<T>): InputFyDeferred<T>;
/** Registro centralizado de schemas lazy (4.6) */
declare class LazySchemaRegistry {
    private readonly options;
    private readonly loaders;
    private readonly loaded;
    private readonly loading;
    constructor(options?: LazyRegistryOptions);
    register(name: string, loader: SchemaLoader): void;
    has(name: string): boolean;
    resolve(name: string): Promise<InputFyTypeAny>;
    resolveSync(name: string): InputFyTypeAny;
    /** Retorna InputFyLazy que carrega do registro na primeira validação */
    lazy(name: string): InputFyLazy<InputFyTypeAny>;
    /** Retorna InputFyDeferred com carregamento assíncrono */
    deferred(name: string): InputFyDeferred<InputFyTypeAny>;
    clear(name?: string): void;
    list(): string[];
}
declare const defaultLazyRegistry: LazySchemaRegistry;
declare function createLazyRegistry(options?: LazyRegistryOptions): LazySchemaRegistry;

/** Pool de worker threads para validação pesada (4.4) */
declare class ValidationWorkerPool {
    private readonly jsonSchema;
    private readonly workers;
    private readonly queue;
    private readonly pending;
    private nextId;
    private roundRobin;
    private terminated;
    constructor(jsonSchema: Record<string, unknown>, options?: WorkerPoolOptions);
    private readonly defaultTimeout;
    validate<T extends InputFyTypeAny>(data: unknown): Promise<SafeParseReturnType<T["_input"], T["_output"]>>;
    private processQueue;
    validateBatch<T extends InputFyTypeAny>(items: unknown[]): Promise<Array<SafeParseReturnType<T["_input"], T["_output"]>>>;
    terminate(): void;
}
declare function createValidationWorkerPool(schema: InputFyTypeAny, options?: WorkerPoolOptions): ValidationWorkerPool;
declare function isWorkerThreadsAvailable(): boolean;

/** Suite de benchmark automatizada (4.5) */
declare function runBenchmark(suites: BenchmarkSuite[], options?: BenchmarkOptions): Promise<BenchmarkResult[]>;
declare function formatBenchmarkTable(results: BenchmarkResult[]): string;
/** Suites padrão para benchmark rápido */
declare function createDefaultBenchmarkSuites(factory: {
    object: (shape: Record<string, InputFyTypeAny>) => InputFyTypeAny;
    string: () => InputFyTypeAny;
    number: () => InputFyTypeAny;
}): BenchmarkSuite[];

declare function configureObservability(partial: ObservabilityConfig): ObservabilityConfig;
declare function getObservabilityConfig(): ObservabilityConfig;
declare function resetObservabilityConfig(): void;
declare function isObservabilityEnabled(): boolean;

declare class InMemorySpan implements OtelSpan {
    readonly name: string;
    readonly attributes: Record<string, string | number | boolean>;
    status: {
        code: "OK" | "ERROR";
        message?: string;
    };
    ended: boolean;
    constructor(name: string, attributes?: Record<string, string | number | boolean>);
    setAttribute(key: string, value: string | number | boolean): void;
    setStatus(status: {
        code: "OK" | "ERROR";
        message?: string;
    }): void;
    recordException(error: Error): void;
    end(): void;
}
declare class InMemoryTracer implements OtelTracer {
    readonly spans: InMemorySpan[];
    startSpan(name: string, attributes?: Record<string, string | number | boolean>): InMemorySpan;
}
declare class InMemoryTracerProvider implements TracerProvider {
    private readonly tracer;
    constructor(tracer?: InMemoryTracer);
    getTracer(_name: string): OtelTracer;
    get spans(): InMemorySpan[];
}
/** Executa fn dentro de um span OpenTelemetry-compatível (9.1) */
declare function withValidationSpan<T>(tracer: OtelTracer, schemaId: string, fn: () => T, extraAttributes?: Record<string, string | number | boolean>): T;
declare function createInMemoryTracerProvider(): InMemoryTracerProvider;

/** Métricas Prometheus para validações (9.2) */
declare class ValidationMetrics {
    private readonly counters;
    recordValidation(schema: string, success: boolean, issues?: InputFyIssue[]): void;
    increment(labels: MetricLabels, delta?: number): void;
    getCount(labels: MetricLabels): number;
    /** Exporta métricas no formato Prometheus text exposition */
    toPrometheus(): string;
    reset(): void;
}
declare const defaultMetrics: ValidationMetrics;
declare function createValidationMetrics(): ValidationMetrics;
/** Analytics de uso — campos que mais falham (9.3) */
declare class SchemaAnalytics {
    private readonly fieldFailures;
    private readonly schemaStats;
    recordParse(schema: string, success: boolean, issues?: InputFyIssue[]): void;
    getTopFailingFields(schema?: string, limit?: number): FieldFailureStat[];
    getFailureRate(schema: string): number;
    getSnapshot(schema: string): {
        schema: string;
        totalValidations: number;
        failures: number;
        failureRate: number;
        topFailingFields: FieldFailureStat[];
    };
    reset(): void;
}
declare const defaultAnalytics: SchemaAnalytics;
declare function createSchemaAnalytics(): SchemaAnalytics;

interface CrossFieldRule {
    /** Campos envolvidos na regra (para mensagens de erro) */
    fields: string[];
    /** Função de validação sobre o objeto completo */
    check: (data: Record<string, unknown>) => boolean;
    /** Mensagem de erro */
    message: string;
}
declare class InputFyCrossField<T extends InputFyTypeAny> extends InputFyType<T["_input"], T["_output"]> {
    readonly _def: SchemaDef & {
        innerType: T;
        rules: CrossFieldRule[];
    };
    constructor(innerType: T, rules: CrossFieldRule[]);
    _parse(ctx: ParseContext): T["_output"];
    protected _clone(): this;
    addRule(rule: CrossFieldRule): this;
}
/** Aplica regras cross-field declarativas a um schema de objeto */
declare function crossField<T extends InputFyObject<Record<string, InputFyTypeAny>>>(schema: T, rules: CrossFieldRule[]): InputFyCrossField<T>;
/** Helpers DSL para regras comuns */
declare const crossFieldRules: {
    equals(fieldA: string, fieldB: string, message?: string): CrossFieldRule;
    requiredTogether(fields: string[], message?: string): CrossFieldRule;
    atLeastOne(fields: string[], message?: string): CrossFieldRule;
    custom(fields: string[], check: (data: Record<string, unknown>) => boolean, message: string): CrossFieldRule;
};

declare module "../schemas/complex.js" {
    interface InputFyObject<T extends Record<string, InputFyTypeAny>> {
        crossField(rules: CrossFieldRule[]): ReturnType<typeof crossField<InputFyObject<T>>>;
    }
}

type SchemaMetadata = Record<string, unknown>;
/** Registry global de metadados por schema id (6.7) */
declare class MetadataRegistry {
    private readonly entries;
    register(id: string, schema: InputFyTypeAny, metadata?: SchemaMetadata): void;
    get(id: string): SchemaMetadata | undefined;
    getSchema(id: string): InputFyTypeAny | undefined;
    list(): Array<{
        id: string;
        metadata: SchemaMetadata;
    }>;
    clear(id?: string): void;
}
declare const defaultMetadataRegistry: MetadataRegistry;
declare function getSchemaMetadata(schema: InputFyTypeAny): SchemaMetadata;

/** JSON Schema genérico (Draft 7 / OpenAPI 3.x compatível) */
type JSONSchema = {
    $schema?: string;
    $id?: string;
    $ref?: string;
    $defs?: Record<string, JSONSchema>;
    definitions?: Record<string, JSONSchema>;
    title?: string;
    description?: string;
    type?: string | string[];
    format?: string;
    enum?: (string | number | boolean | null)[];
    const?: string | number | boolean | null;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    items?: JSONSchema | JSONSchema[];
    additionalItems?: JSONSchema | boolean;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    properties?: Record<string, JSONSchema>;
    patternProperties?: Record<string, JSONSchema>;
    additionalProperties?: JSONSchema | boolean;
    required?: string[];
    maxProperties?: number;
    minProperties?: number;
    allOf?: JSONSchema[];
    anyOf?: JSONSchema[];
    oneOf?: JSONSchema[];
    not?: JSONSchema;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    default?: unknown;
    example?: unknown;
    examples?: unknown[];
    discriminator?: {
        propertyName: string;
        mapping?: Record<string, string>;
    };
    [key: string]: unknown;
};
type JSONSchemaTarget = "draft-7" | "draft-2020-12" | "openapi-3.0" | "openapi-3.1";
interface ToJSONSchemaOptions {
    target?: JSONSchemaTarget;
    metadata?: boolean;
    definitions?: Record<string, JSONSchema>;
    _refs?: Map<InputFyTypeAny, string>;
    _refCounter?: number;
    _depth?: number;
}
interface FromJSONSchemaOptions {
    definitions?: Record<string, JSONSchema>;
    defs?: Record<string, JSONSchema>;
    _depth?: number;
    _resolving?: Set<string>;
}
interface OpenAPIInfo {
    title: string;
    version: string;
    description?: string;
}
interface OpenAPIMediaType {
    schema?: JSONSchema;
    example?: unknown;
}
interface OpenAPIRequestBody {
    description?: string;
    required?: boolean;
    content: Record<string, OpenAPIMediaType>;
}
interface OpenAPIResponse {
    description: string;
    content?: Record<string, OpenAPIMediaType>;
}
interface OpenAPIOperation {
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    parameters?: OpenAPIParameter[];
    requestBody?: OpenAPIRequestBody;
    responses: Record<string, OpenAPIResponse>;
}
interface OpenAPIParameter {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    schema?: JSONSchema;
}
interface OpenAPIPathItem {
    get?: OpenAPIOperation;
    post?: OpenAPIOperation;
    put?: OpenAPIOperation;
    patch?: OpenAPIOperation;
    delete?: OpenAPIOperation;
}
interface OpenAPIDocument {
    openapi: "3.0.3" | "3.1.0";
    info: OpenAPIInfo;
    paths: Record<string, OpenAPIPathItem>;
    components?: {
        schemas?: Record<string, JSONSchema>;
        parameters?: Record<string, OpenAPIParameter>;
    };
    tags?: {
        name: string;
        description?: string;
    }[];
}
interface OpenAPIConfig {
    info: OpenAPIInfo;
    paths: Record<string, OpenAPIPathItem>;
    version?: "3.0.3" | "3.1.0";
    schemas?: Record<string, InputFyTypeAny>;
    tags?: {
        name: string;
        description?: string;
    }[];
}
interface GraphQLOperationDef {
    returns: InputFyTypeAny;
    args?: Record<string, InputFyTypeAny>;
    description?: string;
}
interface GraphQLSDLConfig {
    types?: Record<string, InputFyTypeAny>;
    inputs?: Record<string, InputFyTypeAny>;
    enums?: Record<string, InputFyTypeAny>;
    queries?: Record<string, InputFyTypeAny | GraphQLOperationDef>;
    mutations?: Record<string, InputFyTypeAny | GraphQLOperationDef>;
    description?: string;
}
interface CodecHandlers<Encoded, Decoded> {
    decode: (encoded: Encoded) => Decoded;
    encode: (decoded: Decoded) => Encoded;
}

/** Converte schema InputFy para JSON Schema */
declare function toJSONSchema(schema: InputFyTypeAny, options?: ToJSONSchemaOptions): JSONSchema;
/** Converte schema para formato OpenAPI */
declare function toOpenAPISchema(schema: InputFyTypeAny, options?: Omit<ToJSONSchemaOptions, "target"> & {
    target?: "openapi-3.0" | "openapi-3.1";
}): JSONSchema;

declare function fromJSONSchema(schema: JSONSchema, options?: FromJSONSchemaOptions): InputFyTypeAny;

interface InputFyCodecDef<EncodedSchema extends InputFyTypeAny, DecodedSchema extends InputFyTypeAny> extends SchemaDef {
    typeName: "InputFyCodec";
    encodedSchema: EncodedSchema;
    decodedSchema: DecodedSchema;
    handlers: CodecHandlers<EncodedSchema["_output"], DecodedSchema["_output"]>;
}
declare class InputFyCodec<EncodedSchema extends InputFyTypeAny, DecodedSchema extends InputFyTypeAny> extends InputFyType<EncodedSchema["_input"], DecodedSchema["_output"]> {
    readonly _def: InputFyCodecDef<EncodedSchema, DecodedSchema>;
    constructor(encodedSchema: EncodedSchema, decodedSchema: DecodedSchema, handlers: CodecHandlers<EncodedSchema["_output"], DecodedSchema["_output"]>);
    _parse(ctx: ParseContext): DecodedSchema["_output"];
    encode(value: DecodedSchema["_input"]): EncodedSchema["_output"];
    decode(value: EncodedSchema["_input"]): DecodedSchema["_output"];
    get encodedSchema(): EncodedSchema;
    get decodedSchema(): DecodedSchema;
    protected _clone(): this;
}
declare function codec<EncodedSchema extends InputFyTypeAny, DecodedSchema extends InputFyTypeAny>(encodedSchema: EncodedSchema, decodedSchema: DecodedSchema, handlers: CodecHandlers<EncodedSchema["_output"], DecodedSchema["_output"]>): InputFyCodec<EncodedSchema, DecodedSchema>;

declare function toOpenAPI(config: OpenAPIConfig): OpenAPIDocument;
declare function openAPIToJSON(doc: OpenAPIDocument, pretty?: boolean): string;
declare function openAPIToYAML(doc: OpenAPIDocument): string;

declare function toGraphQLSDL(config: GraphQLSDLConfig): string;
declare function schemaToGraphQLTypeDef(name: string, schema: InputFyTypeAny, isInput?: boolean): string;

declare const iso: {
    date: (message?: string) => InputFyString;
    time: (message?: string) => InputFyString;
    datetime: (message?: string) => InputFyString;
    duration: (message?: string) => InputFyString;
};
declare function ipv4(message?: string): InputFyString;
declare function ipv6(message?: string): InputFyString;
declare function cidrv4(message?: string): InputFyString;
declare function cidrv6(message?: string): InputFyString;
declare function hexColor(message?: string): InputFyString;
declare function rgb(message?: string): InputFyString;
declare function hsl(message?: string): InputFyString;
interface CurrencyOptions {
    code?: string;
    decimals?: number;
    message?: string;
}
declare function currency(options?: CurrencyOptions): InputFyUnion<[InputFyNumber, InputFyString]>;

interface FileDescriptor {
    name: string;
    size: number;
    type: string;
    data?: unknown;
}

interface FileOptions {
    maxSize?: number;
    mimeTypes?: string[];
    extensions?: string[];
    message?: string;
}
declare class InputFyFile extends InputFyType<FileDescriptor, FileDescriptor> {
    readonly _def: SchemaDef & {
        options: FileOptions;
    };
    constructor(options?: FileOptions);
    _parse(ctx: ParseContext): FileDescriptor;
    protected _clone(): this;
    maxSize(bytes: number): this;
    mimeTypes(types: string[]): this;
    extensions(exts: string[]): this;
}
declare function file(options?: FileOptions): InputFyFile;

interface WhenOptions {
    is: unknown | InputFyTypeAny;
    then: InputFyTypeAny;
    otherwise?: InputFyTypeAny | undefined;
}
/**
 * Validação condicional baseada em campo irmão no objeto pai.
 * Uso: v.object({ type: v.string(), value: v.when('type', { is: 'email', then: v.string().email() }) })
 */
declare class InputFyWhen extends InputFyType<unknown, unknown> {
    readonly _def: SchemaDef & {
        refField: string;
        is: unknown | InputFyTypeAny;
        then: InputFyTypeAny;
        otherwise?: InputFyTypeAny | undefined;
    };
    constructor(refField: string, options: WhenOptions);
    _parse(ctx: ParseContext): unknown;
    protected _clone(): this;
}
declare function when(refField: string, options: WhenOptions): InputFyWhen;

type ContextSchemaFactory<C extends ValidationContext = ValidationContext> = (context: C) => InputFyTypeAny;
/**
 * Schema cuja forma depende do contexto externo passado em `.parse(data, { context })`.
 *
 * @example
 * const schema = v.contextual((ctx) =>
 *   v.object({
 *     apiKey: ctx.env === "production" ? v.string().min(32) : v.string().optional(),
 *   })
 * );
 * schema.parse(data, { context: { env: "production" } });
 */
declare class InputFyContextual<C extends ValidationContext = ValidationContext> extends InputFyType<unknown, unknown> {
    readonly _def: SchemaDef & {
        factory: ContextSchemaFactory<C>;
    };
    constructor(factory: ContextSchemaFactory<C>);
    _parse(ctx: ParseContext): unknown;
    protected _clone(): this;
}
declare function contextual<C extends ValidationContext = ValidationContext>(factory: ContextSchemaFactory<C>): InputFyContextual<C>;
/** Helper: schema que exige variável de ambiente presente no contexto */
declare function envKey(key: string, schema: InputFyTypeAny): InputFyContextual;

declare function getSecurityConfig(): Readonly<SecurityConfig>;
declare function configureSecurity(options: SecurityConfig): void;
/** Alias: v.securityConfig(options) */
declare const securityConfig: typeof configureSecurity;
declare function resetSecurityConfig(): void;

interface ScanOptions {
    html?: boolean;
    sql?: boolean;
    pathTraversal?: boolean;
}
/** Detecta padrões suspeitos em qualquer valor (5.1) */
declare function detectSuspiciousPatterns(value: unknown, options?: ScanOptions, path?: string): SuspiciousPattern[];
/** Sanitiza input agressivamente — modo paranóico (5.1) */
declare function sanitizeInput(value: unknown, options?: ScanOptions): unknown;

declare class UnsafeRegexError extends Error {
    readonly analysis: RedosAnalysis;
    constructor(analysis: RedosAnalysis);
}
/** Análise estática de risco ReDoS (5.6) */
declare function analyzeRegex(regex: RegExp): RedosAnalysis;
declare function assertSafeRegex(regex: RegExp): void;
declare function isRegexSafe(regex: RegExp): boolean;

/** InputFy é CSP-friendly — zero eval/Function no pipeline (5.7) */
declare const CSP_FRIENDLY: true;
interface CSPAuditResult {
    compliant: boolean;
    usesEval: boolean;
    usesFunction: boolean;
    usesDynamicImport: boolean;
    notes: string[];
}
/** Garante que InputFy não usa eval/Function — pledge CSP (5.7) */
declare function assertCSPFriendly(): void;
/** Audita schema por efeitos dinâmicos perigosos */
declare function auditSchemaCSP(schema: {
    _def: {
        effects?: unknown[];
    };
}): CSPAuditResult;

/** Fingerprint estável de um schema para assinatura */
declare function schemaFingerprint(schema: InputFyTypeAny): string;
/** Assina schema com HMAC-SHA256 (5.4) */
declare function signSchema(schema: InputFyTypeAny, secret: string): string;
/** Verifica integridade do schema — tamper detection (5.4) */
declare function inputfySchemaSignature(schema: InputFyTypeAny, secret: string, signature: string): boolean;
declare class SchemaTamperError extends InputFyError {
    constructor();
}
/** Schema assinado com verificação de integridade em runtime (5.4) */
declare function signedSchema<T extends InputFyTypeAny>(schema: T, secret: string, signature?: string): SignedSchema<T>;

declare class RefinementSandboxError extends Error {
    constructor(message: string);
}
declare class RefinementSandbox {
    private readonly timeoutMs;
    constructor(timeoutMs?: number);
    run(check: (val: unknown) => boolean, value: unknown): boolean;
    runAsync(check: (val: unknown) => boolean | Promise<boolean>, value: unknown): Promise<boolean>;
}
declare function createRefinementSandbox(timeoutMs?: number): RefinementSandbox;

interface GenerateOptions {
    seed?: number;
    /** Incluir campos optional (~50% das vezes se false omite) */
    includeOptional?: boolean;
    maxArrayLength?: number;
    maxDepth?: number;
}
/** Gera dados fake válidos a partir de um schema (6.5) */
declare function generate<T extends InputFyTypeAny>(schema: T, options?: GenerateOptions): T["_output"];
/** Gera N amostras */
declare function generateMany<T extends InputFyTypeAny>(schema: T, count: number, options?: GenerateOptions): T["_output"][];

type DiffSeverity = "breaking" | "warning" | "info";
type SchemaChangeKind = "field_removed" | "field_added" | "type_changed" | "required_added" | "required_removed" | "enum_value_removed" | "enum_value_added" | "constraint_tightened" | "constraint_loosened" | "description_changed";
interface SchemaChange {
    kind: SchemaChangeKind;
    severity: DiffSeverity;
    path: string;
    message: string;
    before?: unknown;
    after?: unknown;
}
interface SchemaDiffResult {
    breaking: SchemaChange[];
    warnings: SchemaChange[];
    info: SchemaChange[];
    all: SchemaChange[];
    hasBreakingChanges: boolean;
}
/** Compara duas versões de schema e lista breaking changes (6.4) */
declare function diffSchema(left: InputFyTypeAny, right: InputFyTypeAny): SchemaDiffResult;
declare function diffJSONSchema(left: JSONSchema, right: JSONSchema): SchemaDiffResult;
declare function formatSchemaDiff(result: SchemaDiffResult): string;

interface MigrationChange {
    line?: number;
    from: string;
    to: string;
    description: string;
}
interface MigrationResult {
    code: string;
    changes: MigrationChange[];
    warnings: string[];
}
/** Ferramenta Zod → InputFy automatizada (6.6) */
declare function migrateZodToInputFy(source: string): MigrationResult;
declare function formatMigrationReport(result: MigrationResult): string;

interface PlaygroundOptions {
    title?: string;
    initialSchema?: InputFyTypeAny;
    initialData?: unknown;
}
/** Gera HTML do playground interativo (6.3) */
declare function createPlaygroundHTML(options?: PlaygroundOptions): string;
/** Salva playground em path (Node.js) */
declare function writePlaygroundFile(path: string, options?: PlaygroundOptions): Promise<void>;

/** Nominal brand phantom type (8.1) */
declare const __inputfyBrand: unique symbol;
type Brand<B extends string | number | symbol> = {
    readonly [__inputfyBrand]: B;
};
type Branded<T, B extends string | number | symbol> = T & Brand<B>;
/** Deep partial recursivo em nível de tipos (8.3) */
type DeepPartial<T> = T extends readonly (infer U)[] ? readonly DeepPartial<U>[] : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
/** Deep required recursivo em nível de tipos (8.3) */
type DeepRequired<T> = T extends readonly (infer U)[] ? readonly DeepRequired<U>[] : T extends object ? {
    [K in keyof T]-?: DeepRequired<T[K]>;
} : T;
/** Input estrito de um schema (8.5) */
type SchemaInput<T extends InputFyTypeAny> = T extends {
    _input: infer I;
} ? I : never;
/** Output estrito de um schema (8.5) */
type SchemaOutput<T extends InputFyTypeAny> = T extends {
    _output: infer O;
} ? O : never;
/** Input de pipeline (primeiro estágio) (8.5) */
type PipelineInput<P> = P extends {
    _def: {
        in: infer A extends InputFyTypeAny;
    };
} ? A["_input"] : never;
/** Output de pipeline (segundo estágio) (8.5) */
type PipelineOutput<P> = P extends {
    _def: {
        out: infer B extends InputFyTypeAny;
    };
} ? B["_output"] : never;
/** Tipo intermediário entre estágios de pipeline (8.5) */
type PipelineIntermediate<P> = P extends {
    _def: {
        in: infer A extends InputFyTypeAny;
    };
} ? A["_output"] : never;
/** Output de schema versionado para versão K (8.4) */
type VersionedOutput<V extends Record<string, InputFyTypeAny>, K extends keyof V> = V[K]["_output"];
/** Input de schema versionado para versão K (8.4) */
type VersionedInput<V extends Record<string, InputFyTypeAny>, K extends keyof V> = V[K]["_input"];
/** Inferência de template literal type a partir de partes (8.2) */
type InferTemplateLiteral<TParts extends readonly TemplateLiteralPart[]> = JoinTemplateParts<TParts>;
type TemplateLiteralPart = string | InputFyTypeAny;
type JoinTemplateParts<TParts extends readonly TemplateLiteralPart[]> = TParts extends readonly [infer Head, ...infer Tail extends readonly TemplateLiteralPart[]] ? Head extends string ? `${Head}${JoinTemplateParts<Tail>}` : Head extends InputFyTypeAny ? `${string}${JoinTemplateParts<Tail>}` : never : "";
/** Split input/output quando schema tem transform (8.5) */
type StrictSplit<T extends InputFyTypeAny> = {
    input: SchemaInput<T>;
    output: SchemaOutput<T>;
};

interface BrandConstraint<T = unknown> {
    check: (value: T) => boolean;
    message?: string;
}
interface BrandedSchemaOptions<T extends InputFyTypeAny, B extends string> {
    brand: B;
    constraints?: BrandConstraint<T["_output"]>[];
    description?: string;
}
/** Cria schema com nominal typing e restrições compostas (8.1) */
declare function branded<T extends InputFyTypeAny, B extends string>(schema: T, options: BrandedSchemaOptions<T, B> | B): InputFyType<T["_input"], Branded<T["_output"], B>>;
/** Extrai brand name de metadados do schema */
declare function getBrandName(schema: InputFyTypeAny): string | undefined;
/** Marca schema com brand persistido em metadata */
declare function withBrand<T extends InputFyTypeAny, B extends string>(schema: T, brand: B): InputFyType<T["_input"], Branded<T["_output"], B>>;

type TemplateSegment = {
    kind: "literal";
    value: string;
} | {
    kind: "schema";
    schema: InputFyTypeAny;
};
declare class InputFyTemplateLiteral<TParts extends readonly TemplateLiteralPart[] = readonly TemplateLiteralPart[]> extends InputFyType<string, InferTemplateLiteral<TParts>> {
    readonly _def: SchemaDef & {
        segments: TemplateSegment[];
    };
    constructor(segments: TemplateSegment[]);
    _parse(ctx: ParseContext): InferTemplateLiteral<TParts>;
    protected _clone(): this;
}
/** Template literal schema — ex: v.templateLiteral("user_", v.string()) (8.2) */
declare function templateLiteral<const TParts extends readonly TemplateLiteralPart[]>(...parts: TParts): InputFyTemplateLiteral<TParts>;
/** Alias com array de partes */
declare function templateLiteralFromParts<const TParts extends readonly TemplateLiteralPart[]>(parts: TParts): InputFyTemplateLiteral<TParts>;
/** Valida string contra segmentos sem criar schema persistente */
declare function matchTemplateLiteral(value: string, ...parts: TemplateLiteralPart[]): boolean;

/** Deep partial recursivo em runtime (8.3) */
declare function deepPartial<T extends InputFyTypeAny>(schema: T): InputFyTypeAny & {
    _output: DeepPartial<T["_output"]>;
};
/** Deep required recursivo em runtime (8.3) */
declare function deepRequired<T extends InputFyTypeAny>(schema: T): InputFyTypeAny & {
    _output: DeepRequired<T["_output"]>;
};

interface VersionedSchemaOptions<V extends Record<string, InputFyTypeAny>> {
    /** Versão semver atual */
    current: keyof V & string;
    /** Campo no payload que indica a versão (default: __schemaVersion) */
    versionKey?: string;
    /** Migração entre versões */
    migrate?: Partial<Record<keyof V, (data: unknown, from: string) => unknown>>;
}
declare class InputFyVersioned<V extends Record<string, InputFyTypeAny>> extends InputFyType<VersionedInput<V, keyof V & string>, VersionedOutput<V, keyof V & string>> {
    readonly _def: SchemaDef & {
        versions: V;
        current: keyof V & string;
        versionKey: string;
        migrate?: VersionedSchemaOptions<V>["migrate"];
    };
    constructor(versions: V, options: VersionedSchemaOptions<V>);
    get currentVersion(): keyof V & string;
    getSchema(version: keyof V): V[keyof V];
    _parse(ctx: ParseContext): VersionedOutput<V, keyof V & string>;
    protected _clone(): this;
    /** Parse com versão explícita */
    parseVersion<K extends keyof V>(version: K, data: unknown): VersionedOutput<V, K>;
}
/** Schema versionado com semver (8.4) */
declare function versionedSchema<V extends Record<string, InputFyTypeAny>>(versions: V, options: VersionedSchemaOptions<V>): InputFyVersioned<V>;
/** Metadados de versão semver no schema */
declare function withSchemaVersion<T extends InputFyTypeAny>(schema: T, version: string): T;
declare function getSchemaVersion(schema: InputFyTypeAny): string | undefined;

/** Extrai input estrito de schema ou pipeline (8.5) */
declare function schemaInput<T extends InputFyTypeAny>(schema: T): SchemaInput<T>;
/** Extrai output estrito de schema ou pipeline (8.5) */
declare function schemaOutput<T extends InputFyTypeAny>(schema: T): SchemaOutput<T>;
/** Split input/output para schemas com transform (8.5) */
declare function strictSplit<T extends InputFyTypeAny>(schema: T): StrictSplit<T>;
/** Valida apenas o estágio de input de um pipeline (8.5) */
declare function parsePipelineInput<P extends InputFyPipeline<InputFyTypeAny, InputFyTypeAny>>(pipeline: P, data: unknown): PipelineInput<P>;
/** Valida input e retorna output intermediário (8.5) */
declare function parsePipelineIntermediate<P extends InputFyPipeline<InputFyTypeAny, InputFyTypeAny>>(pipeline: P, data: unknown): PipelineIntermediate<P>;
/** Valida pipeline completo (input → output) (8.5) */
declare function parsePipelineOutput<P extends InputFyPipeline<InputFyTypeAny, InputFyTypeAny>>(pipeline: P, data: unknown): PipelineOutput<P>;
/** Retorna schemas internos do pipeline */
declare function getPipelineSchemas<P extends InputFyPipeline<InputFyTypeAny, InputFyTypeAny>>(pipeline: P): {
    input: P["_def"]["in"];
    output: P["_def"]["out"];
};

declare function _string(params?: {
    message?: string;
    description?: string;
}): InputFyString;
declare function _number(params?: {
    message?: string;
    description?: string;
}): InputFyNumber;
declare function _boolean(params?: {
    description?: string;
}): InputFyBoolean;
declare function _bigint(params?: {
    description?: string;
}): InputFyBigInt;
declare function _date(params?: {
    description?: string;
}): InputFyDate;
declare const v: {
    string: typeof _string;
    number: typeof _number;
    boolean: typeof _boolean;
    bigint: typeof _bigint;
    date: typeof _date;
    symbol: () => InputFyType<symbol, symbol>;
    undefined: () => InputFyType<undefined, undefined>;
    null: () => InputFyType<null, null>;
    void: () => typeof InputFyVoid;
    any: () => InputFyAny;
    unknown: () => InputFyUnknown;
    never: () => InputFyNever;
    nan: () => InputFyNaN;
    int: () => InputFyNumber;
    int32: () => InputFyNumber;
    float32: () => InputFyNumber;
    float64: () => InputFyNumber;
    coerce: {
        string: () => InputFyString;
        number: () => InputFyNumber;
        boolean: () => InputFyBoolean;
        bigint: () => InputFyBigInt;
        date: () => InputFyDate;
    };
    object: typeof object;
    strictObject: typeof strictObject;
    looseObject: typeof looseObject;
    array: typeof array;
    tuple: typeof tuple;
    union: typeof union;
    discriminatedUnion: typeof discriminatedUnion;
    intersection: typeof intersection;
    record: typeof record;
    map: typeof map;
    set: typeof set;
    lazy: typeof lazy;
    promise: typeof promise;
    preprocess: typeof preprocess;
    pipeline: typeof pipeline;
    function: typeof _function;
    literal: <T extends string | number | boolean | bigint | null | undefined>(value: T) => InputFyLiteral<T>;
    enum: <U extends string, T extends readonly [U, ...U[]]>(values: T) => InputFyEnum<T>;
    nativeEnum: <T extends Record<string, string | number>>(enumObj: T) => InputFyNativeEnum<T>;
    instanceof: <T extends new (...args: never[]) => unknown>(cls: T) => InputFyInstanceof<T>;
    custom: <T>(fn: (val: unknown) => val is T, message?: string) => InputFyCustom<T>;
    toJSONSchema: typeof toJSONSchema;
    toOpenAPISchema: typeof toOpenAPISchema;
    fromJSONSchema: typeof fromJSONSchema;
    codec: typeof codec;
    toOpenAPI: typeof toOpenAPI;
    openAPIToJSON: typeof openAPIToJSON;
    openAPIToYAML: typeof openAPIToYAML;
    toGraphQLSDL: typeof toGraphQLSDL;
    schemaToGraphQLTypeDef: typeof schemaToGraphQLTypeDef;
    iso: {
        date: (message?: string) => InputFyString;
        time: (message?: string) => InputFyString;
        datetime: (message?: string) => InputFyString;
        duration: (message?: string) => InputFyString;
    };
    ipv4: typeof ipv4;
    ipv6: typeof ipv6;
    cidrv4: typeof cidrv4;
    cidrv6: typeof cidrv6;
    hexColor: typeof hexColor;
    rgb: typeof rgb;
    hsl: typeof hsl;
    currency: typeof currency;
    file: typeof file;
    when: typeof when;
    crossField: typeof crossField;
    crossFieldRules: {
        equals(fieldA: string, fieldB: string, message?: string): CrossFieldRule;
        requiredTogether(fields: string[], message?: string): CrossFieldRule;
        atLeastOne(fields: string[], message?: string): CrossFieldRule;
        custom(fields: string[], check: (data: Record<string, unknown>) => boolean, message: string): CrossFieldRule;
    };
    contextual: typeof contextual;
    envKey: typeof envKey;
    config: typeof config;
    setLocale: typeof setLocale;
    getLocale: typeof getLocale;
    formatErrorHTML: typeof formatErrorHTML;
    aggregateBySeverity: typeof aggregateBySeverity;
    countBySeverity: typeof countBySeverity;
    issueCodeErrorMap: typeof issueCodeErrorMap;
    compile: typeof compile;
    cachedCompile: typeof cachedCompile;
    cachedParse: typeof cachedParse;
    createSchemaCache: typeof createSchemaCache;
    validateNDJSON: typeof validateNDJSON;
    validateNDJSONStream: typeof validateNDJSONStream;
    parseNDJSONLine: typeof parseNDJSONLine;
    createNDJSONValidator: typeof createNDJSONValidator;
    createValidationWorkerPool: typeof createValidationWorkerPool;
    isWorkerThreadsAvailable: typeof isWorkerThreadsAvailable;
    runBenchmark: typeof runBenchmark;
    formatBenchmarkTable: typeof formatBenchmarkTable;
    lazyRegistry: LazySchemaRegistry;
    createLazyRegistry: typeof createLazyRegistry;
    deferred: typeof deferred;
    isCompilable: typeof isCompilable;
    securityConfig: typeof configureSecurity;
    configureSecurity: typeof configureSecurity;
    resetSecurityConfig: typeof resetSecurityConfig;
    getSecurityConfig: typeof getSecurityConfig;
    sanitizeInput: typeof sanitizeInput;
    detectSuspiciousPatterns: typeof detectSuspiciousPatterns;
    createRateLimiter: typeof createRateLimiter;
    createAuditLog: typeof createAuditLog;
    defaultAuditLog: SecurityAuditLog;
    signSchema: typeof signSchema;
    inputfySchemaSignature: typeof inputfySchemaSignature;
    signedSchema: typeof signedSchema;
    schemaFingerprint: typeof schemaFingerprint;
    analyzeRegex: typeof analyzeRegex;
    assertSafeRegex: typeof assertSafeRegex;
    isRegexSafe: typeof isRegexSafe;
    assertCSPFriendly: typeof assertCSPFriendly;
    auditSchemaCSP: typeof auditSchemaCSP;
    CSP_FRIENDLY: true;
    secureParse: typeof secureParse;
    secureParseAsync: typeof secureParseAsync;
    createRefinementSandbox: typeof createRefinementSandbox;
    generate: typeof generate;
    generateMany: typeof generateMany;
    diffSchema: typeof diffSchema;
    diffJSONSchema: typeof diffJSONSchema;
    formatSchemaDiff: typeof formatSchemaDiff;
    migrateZodToInputFy: typeof migrateZodToInputFy;
    formatMigrationReport: typeof formatMigrationReport;
    metadataRegistry: MetadataRegistry;
    createMetadataRegistry: () => MetadataRegistry;
    getSchemaMetadata: typeof getSchemaMetadata;
    createPlaygroundHTML: typeof createPlaygroundHTML;
    writePlaygroundFile: typeof writePlaygroundFile;
    branded: typeof branded;
    withBrand: typeof withBrand;
    getBrandName: typeof getBrandName;
    templateLiteral: typeof templateLiteral;
    templateLiteralFromParts: typeof templateLiteralFromParts;
    matchTemplateLiteral: typeof matchTemplateLiteral;
    deepPartial: typeof deepPartial;
    deepRequired: typeof deepRequired;
    versionedSchema: typeof versionedSchema;
    withSchemaVersion: typeof withSchemaVersion;
    getSchemaVersion: typeof getSchemaVersion;
    schemaInput: typeof schemaInput;
    schemaOutput: typeof schemaOutput;
    strictSplit: typeof strictSplit;
    parsePipelineInput: typeof parsePipelineInput;
    parsePipelineIntermediate: typeof parsePipelineIntermediate;
    parsePipelineOutput: typeof parsePipelineOutput;
    getPipelineSchemas: typeof getPipelineSchemas;
    observabilityConfig: typeof configureObservability;
    configureObservability: typeof configureObservability;
    getObservabilityConfig: typeof getObservabilityConfig;
    resetObservabilityConfig: typeof resetObservabilityConfig;
    isObservabilityEnabled: typeof isObservabilityEnabled;
    withValidationSpan: typeof withValidationSpan;
    createInMemoryTracerProvider: typeof createInMemoryTracerProvider;
    createValidationMetrics: typeof createValidationMetrics;
    createSchemaAnalytics: typeof createSchemaAnalytics;
    defaultMetrics: ValidationMetrics;
    defaultAnalytics: SchemaAnalytics;
    defaultSchemaRegistry: SchemaRegistry;
    createSchemaRegistry: typeof createSchemaRegistry;
    createHealthCheck: typeof createHealthCheck;
    createHealthCheckHandler: typeof createHealthCheckHandler;
    observedSafeParse: typeof observedSafeParse;
    observedParse: typeof observedParse;
    createObservedSchema: typeof createObservedSchema;
};
/** Alias `z` para compatibilidade total com Zod */
declare const z: {
    string: typeof _string;
    number: typeof _number;
    boolean: typeof _boolean;
    bigint: typeof _bigint;
    date: typeof _date;
    symbol: () => InputFyType<symbol, symbol>;
    undefined: () => InputFyType<undefined, undefined>;
    null: () => InputFyType<null, null>;
    void: () => typeof InputFyVoid;
    any: () => InputFyAny;
    unknown: () => InputFyUnknown;
    never: () => InputFyNever;
    nan: () => InputFyNaN;
    int: () => InputFyNumber;
    int32: () => InputFyNumber;
    float32: () => InputFyNumber;
    float64: () => InputFyNumber;
    coerce: {
        string: () => InputFyString;
        number: () => InputFyNumber;
        boolean: () => InputFyBoolean;
        bigint: () => InputFyBigInt;
        date: () => InputFyDate;
    };
    object: typeof object;
    strictObject: typeof strictObject;
    looseObject: typeof looseObject;
    array: typeof array;
    tuple: typeof tuple;
    union: typeof union;
    discriminatedUnion: typeof discriminatedUnion;
    intersection: typeof intersection;
    record: typeof record;
    map: typeof map;
    set: typeof set;
    lazy: typeof lazy;
    promise: typeof promise;
    preprocess: typeof preprocess;
    pipeline: typeof pipeline;
    function: typeof _function;
    literal: <T extends string | number | boolean | bigint | null | undefined>(value: T) => InputFyLiteral<T>;
    enum: <U extends string, T extends readonly [U, ...U[]]>(values: T) => InputFyEnum<T>;
    nativeEnum: <T extends Record<string, string | number>>(enumObj: T) => InputFyNativeEnum<T>;
    instanceof: <T extends new (...args: never[]) => unknown>(cls: T) => InputFyInstanceof<T>;
    custom: <T>(fn: (val: unknown) => val is T, message?: string) => InputFyCustom<T>;
    toJSONSchema: typeof toJSONSchema;
    toOpenAPISchema: typeof toOpenAPISchema;
    fromJSONSchema: typeof fromJSONSchema;
    codec: typeof codec;
    toOpenAPI: typeof toOpenAPI;
    openAPIToJSON: typeof openAPIToJSON;
    openAPIToYAML: typeof openAPIToYAML;
    toGraphQLSDL: typeof toGraphQLSDL;
    schemaToGraphQLTypeDef: typeof schemaToGraphQLTypeDef;
    iso: {
        date: (message?: string) => InputFyString;
        time: (message?: string) => InputFyString;
        datetime: (message?: string) => InputFyString;
        duration: (message?: string) => InputFyString;
    };
    ipv4: typeof ipv4;
    ipv6: typeof ipv6;
    cidrv4: typeof cidrv4;
    cidrv6: typeof cidrv6;
    hexColor: typeof hexColor;
    rgb: typeof rgb;
    hsl: typeof hsl;
    currency: typeof currency;
    file: typeof file;
    when: typeof when;
    crossField: typeof crossField;
    crossFieldRules: {
        equals(fieldA: string, fieldB: string, message?: string): CrossFieldRule;
        requiredTogether(fields: string[], message?: string): CrossFieldRule;
        atLeastOne(fields: string[], message?: string): CrossFieldRule;
        custom(fields: string[], check: (data: Record<string, unknown>) => boolean, message: string): CrossFieldRule;
    };
    contextual: typeof contextual;
    envKey: typeof envKey;
    config: typeof config;
    setLocale: typeof setLocale;
    getLocale: typeof getLocale;
    formatErrorHTML: typeof formatErrorHTML;
    aggregateBySeverity: typeof aggregateBySeverity;
    countBySeverity: typeof countBySeverity;
    issueCodeErrorMap: typeof issueCodeErrorMap;
    compile: typeof compile;
    cachedCompile: typeof cachedCompile;
    cachedParse: typeof cachedParse;
    createSchemaCache: typeof createSchemaCache;
    validateNDJSON: typeof validateNDJSON;
    validateNDJSONStream: typeof validateNDJSONStream;
    parseNDJSONLine: typeof parseNDJSONLine;
    createNDJSONValidator: typeof createNDJSONValidator;
    createValidationWorkerPool: typeof createValidationWorkerPool;
    isWorkerThreadsAvailable: typeof isWorkerThreadsAvailable;
    runBenchmark: typeof runBenchmark;
    formatBenchmarkTable: typeof formatBenchmarkTable;
    lazyRegistry: LazySchemaRegistry;
    createLazyRegistry: typeof createLazyRegistry;
    deferred: typeof deferred;
    isCompilable: typeof isCompilable;
    securityConfig: typeof configureSecurity;
    configureSecurity: typeof configureSecurity;
    resetSecurityConfig: typeof resetSecurityConfig;
    getSecurityConfig: typeof getSecurityConfig;
    sanitizeInput: typeof sanitizeInput;
    detectSuspiciousPatterns: typeof detectSuspiciousPatterns;
    createRateLimiter: typeof createRateLimiter;
    createAuditLog: typeof createAuditLog;
    defaultAuditLog: SecurityAuditLog;
    signSchema: typeof signSchema;
    inputfySchemaSignature: typeof inputfySchemaSignature;
    signedSchema: typeof signedSchema;
    schemaFingerprint: typeof schemaFingerprint;
    analyzeRegex: typeof analyzeRegex;
    assertSafeRegex: typeof assertSafeRegex;
    isRegexSafe: typeof isRegexSafe;
    assertCSPFriendly: typeof assertCSPFriendly;
    auditSchemaCSP: typeof auditSchemaCSP;
    CSP_FRIENDLY: true;
    secureParse: typeof secureParse;
    secureParseAsync: typeof secureParseAsync;
    createRefinementSandbox: typeof createRefinementSandbox;
    generate: typeof generate;
    generateMany: typeof generateMany;
    diffSchema: typeof diffSchema;
    diffJSONSchema: typeof diffJSONSchema;
    formatSchemaDiff: typeof formatSchemaDiff;
    migrateZodToInputFy: typeof migrateZodToInputFy;
    formatMigrationReport: typeof formatMigrationReport;
    metadataRegistry: MetadataRegistry;
    createMetadataRegistry: () => MetadataRegistry;
    getSchemaMetadata: typeof getSchemaMetadata;
    createPlaygroundHTML: typeof createPlaygroundHTML;
    writePlaygroundFile: typeof writePlaygroundFile;
    branded: typeof branded;
    withBrand: typeof withBrand;
    getBrandName: typeof getBrandName;
    templateLiteral: typeof templateLiteral;
    templateLiteralFromParts: typeof templateLiteralFromParts;
    matchTemplateLiteral: typeof matchTemplateLiteral;
    deepPartial: typeof deepPartial;
    deepRequired: typeof deepRequired;
    versionedSchema: typeof versionedSchema;
    withSchemaVersion: typeof withSchemaVersion;
    getSchemaVersion: typeof getSchemaVersion;
    schemaInput: typeof schemaInput;
    schemaOutput: typeof schemaOutput;
    strictSplit: typeof strictSplit;
    parsePipelineInput: typeof parsePipelineInput;
    parsePipelineIntermediate: typeof parsePipelineIntermediate;
    parsePipelineOutput: typeof parsePipelineOutput;
    getPipelineSchemas: typeof getPipelineSchemas;
    observabilityConfig: typeof configureObservability;
    configureObservability: typeof configureObservability;
    getObservabilityConfig: typeof getObservabilityConfig;
    resetObservabilityConfig: typeof resetObservabilityConfig;
    isObservabilityEnabled: typeof isObservabilityEnabled;
    withValidationSpan: typeof withValidationSpan;
    createInMemoryTracerProvider: typeof createInMemoryTracerProvider;
    createValidationMetrics: typeof createValidationMetrics;
    createSchemaAnalytics: typeof createSchemaAnalytics;
    defaultMetrics: ValidationMetrics;
    defaultAnalytics: SchemaAnalytics;
    defaultSchemaRegistry: SchemaRegistry;
    createSchemaRegistry: typeof createSchemaRegistry;
    createHealthCheck: typeof createHealthCheck;
    createHealthCheckHandler: typeof createHealthCheckHandler;
    observedSafeParse: typeof observedSafeParse;
    observedParse: typeof observedParse;
    createObservedSchema: typeof createObservedSchema;
};

export { type VersionedOutput as $, type PlaygroundOptions as A, type Brand as B, CSP_FRIENDLY as C, type DeepPartial as D, type SchemaChange as E, type FileDescriptor as F, type GenerateOptions as G, type SchemaChangeKind as H, InMemoryTracerProvider as I, type JSONSchema as J, type SchemaDiffResult as K, type SchemaInput as L, MetadataRegistry as M, type SchemaMetadata as N, type OpenAPIConfig as O, type PipelineInput as P, type SchemaOutput as Q, RefinementSandboxError as R, SchemaAnalytics as S, SchemaTamperError as T, type StrictSplit as U, type TemplateLiteralPart as V, type ToJSONSchemaOptions as W, UnsafeRegexError as X, ValidationMetrics as Y, ValidationWorkerPool as Z, type VersionedInput as _, type BrandConstraint as a, migrateZodToInputFy as a$, type VersionedSchemaOptions as a0, type WhenOptions as a1, analyzeRegex as a2, assertCSPFriendly as a3, assertSafeRegex as a4, auditSchemaCSP as a5, branded as a6, cidrv4 as a7, cidrv6 as a8, codec as a9, diffSchema as aA, envKey as aB, file as aC, formatBenchmarkTable as aD, formatMigrationReport as aE, formatSchemaDiff as aF, fromJSONSchema as aG, generate as aH, generateMany as aI, getBrandName as aJ, getLocale as aK, getObservabilityConfig as aL, getPipelineSchemas as aM, getSchemaMetadata as aN, getSchemaVersion as aO, getSecurityConfig as aP, hexColor as aQ, hsl as aR, inputfySchemaSignature as aS, ipv4 as aT, ipv6 as aU, isObservabilityEnabled as aV, isRegexSafe as aW, isWorkerThreadsAvailable as aX, iso as aY, issueCodeErrorMap as aZ, matchTemplateLiteral as a_, config as aa, configureObservability as ab, configureSecurity as ac, contextual as ad, createDefaultBenchmarkSuites as ae, createInMemoryTracerProvider as af, createLazyRegistry as ag, createNDJSONValidator as ah, createPlaygroundHTML as ai, createRefinementSandbox as aj, createSchemaAnalytics as ak, createValidationMetrics as al, createValidationWorkerPool as am, crossField as an, crossFieldRules as ao, currency as ap, deepPartial as aq, deepRequired as ar, v as as, defaultAnalytics as at, defaultLazyRegistry as au, defaultMetadataRegistry as av, defaultMetrics as aw, deferred as ax, detectSuspiciousPatterns as ay, diffJSONSchema as az, type Branded as b, openAPIToJSON as b0, openAPIToYAML as b1, parseNDJSONLine as b2, parsePipelineInput as b3, parsePipelineIntermediate as b4, parsePipelineOutput as b5, resetConfig as b6, resetObservabilityConfig as b7, resetSecurityConfig as b8, rgb as b9, runBenchmark as ba, sanitizeInput as bb, schemaFingerprint as bc, schemaInput as bd, schemaOutput as be, schemaToGraphQLTypeDef as bf, securityConfig as bg, setLocale as bh, signSchema as bi, signedSchema as bj, strictSplit as bk, templateLiteral as bl, templateLiteralFromParts as bm, toGraphQLSDL as bn, toJSONSchema as bo, toOpenAPI as bp, toOpenAPISchema as bq, validateNDJSON as br, validateNDJSONStream as bs, versionedSchema as bt, when as bu, withBrand as bv, withSchemaVersion as bw, withValidationSpan as bx, writePlaygroundFile as by, z as bz, type BrandedSchemaOptions as c, type ContextSchemaFactory as d, type CrossFieldRule as e, type CurrencyOptions as f, type DeepRequired as g, type DiffSeverity as h, type FileOptions as i, type FromJSONSchemaOptions as j, type GraphQLSDLConfig as k, type InferTemplateLiteral as l, InputFyCodec as m, InputFyContextual as n, InputFyCrossField as o, InputFyDeferred as p, InputFyFile as q, InputFyTemplateLiteral as r, InputFyVersioned as s, InputFyWhen as t, type JSONSchemaTarget as u, type MigrationChange as v, type MigrationResult as w, type OpenAPIDocument as x, type PipelineIntermediate as y, type PipelineOutput as z };
