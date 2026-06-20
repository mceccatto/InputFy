import { b as InputFyTypeAny, S as SafeParseReturnType, m as ParseParams, k as InputFyIssue } from './errors-EOLUu52Y.cjs';

interface CompiledValidator<T extends InputFyTypeAny = InputFyTypeAny> {
    readonly schema: T;
    readonly fastPath: boolean;
    validate(data: unknown): SafeParseReturnType<T["_input"], T["_output"]>;
    validateAsync(data: unknown): Promise<SafeParseReturnType<T["_input"], T["_output"]>>;
}
interface CompileOptions {
    strict?: boolean;
}
interface SchemaCacheOptions {
    maxCompiled?: number;
    maxParseResults?: number;
    cacheParseResults?: boolean;
}
interface SchemaCacheStats {
    compiled: {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
    };
    parseResults: {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
    };
}
interface StreamValidatorOptions {
    onError?: "skip" | "fail" | "collect";
    skipEmpty?: boolean;
}
interface StreamValidationResult<T extends InputFyTypeAny> {
    line: number;
    raw: string;
    result: SafeParseReturnType<T["_input"], T["_output"]>;
}
interface WorkerPoolOptions {
    poolSize?: number;
    schema?: InputFyTypeAny;
    timeout?: number;
}
interface BenchmarkOptions {
    iterations?: number;
    warmup?: number;
    libraries?: Array<"inputfy" | "zod" | "yup" | "joi">;
}
interface BenchmarkResult {
    name: string;
    library: string;
    iterations: number;
    totalMs: number;
    avgMs: number;
    opsPerSec: number;
}
interface BenchmarkSuite {
    name: string;
    schema: InputFyTypeAny;
    samples: unknown[];
    zodSchema?: unknown;
    yupSchema?: unknown;
    joiSchema?: unknown;
}
type SchemaLoader = () => InputFyTypeAny | Promise<InputFyTypeAny>;
interface LazyRegistryOptions {
    preload?: boolean;
}

/** Compilação AOT — gera função de validação otimizada (4.1) */
declare function compile<T extends InputFyTypeAny>(schema: T, _options?: CompileOptions): CompiledValidator<T>;
declare function isCompilable(schema: InputFyTypeAny): boolean;

/** LRU cache para schemas compilados e resultados de parse (4.2) */
declare class SchemaCache {
    private readonly compiledCache;
    private readonly parseCache;
    private readonly cacheParseResults;
    constructor(options?: SchemaCacheOptions);
    compile<T extends InputFyTypeAny>(schema: T): CompiledValidator<T>;
    parse<T extends InputFyTypeAny>(schema: T, data: unknown): SafeParseReturnType<T["_input"], T["_output"]>;
    clear(): void;
    stats(): SchemaCacheStats;
}
declare const defaultSchemaCache: SchemaCache;
declare function cachedCompile<T extends InputFyTypeAny>(schema: T): CompiledValidator<T>;
declare function cachedParse<T extends InputFyTypeAny>(schema: T, data: unknown): SafeParseReturnType<T["_input"], T["_output"]>;
declare function createSchemaCache(options?: SchemaCacheOptions): SchemaCache;

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}
/** Rate limiting de validação por chave/IP/sessão (5.2) */
declare class ValidationRateLimiter {
    private readonly max;
    private readonly windowMs;
    private readonly windows;
    constructor(options: RateLimitOptions);
    check(key: string): RateLimitResult;
    consume(key: string): RateLimitResult;
    reset(key?: string): void;
    private prune;
}
declare function createRateLimiter(options: RateLimitOptions): ValidationRateLimiter;

interface AuditLogOptions {
    maxEntries?: number;
}
/** Registro de tentativas de injection e eventos de segurança (5.3) */
declare class SecurityAuditLog {
    private entries;
    private readonly maxEntries;
    constructor(options?: AuditLogOptions);
    log(entry: Omit<AuditEntry, "timestamp"> & {
        timestamp?: Date;
    }): AuditEntry;
    logInjection(message: string, pattern?: string, path?: string[]): AuditEntry;
    getEntries(filter?: {
        type?: AuditEntry["type"];
        since?: Date;
    }): AuditEntry[];
    clear(): void;
    get size(): number;
}
declare const defaultAuditLog: SecurityAuditLog;
declare function createAuditLog(options?: AuditLogOptions): SecurityAuditLog;

type ParanoidAction = "reject" | "sanitize";
type SuspiciousPatternKind = "html_script" | "html_event" | "sql_injection" | "prototype_pollution" | "path_traversal";
interface SuspiciousPattern {
    kind: SuspiciousPatternKind;
    match: string;
    path: string;
}
interface ParanoidOptions {
    /** reject: falha na validação; sanitize: limpa strings suspeitas */
    action?: ParanoidAction;
    html?: boolean;
    sql?: boolean;
    pathTraversal?: boolean;
}
interface RateLimitOptions {
    max: number;
    windowMs: number;
}
interface SecurityConfig {
    /** Modo paranóico — sanitiza/detecta HTML e SQL (5.1) */
    paranoid?: boolean;
    paranoidOptions?: ParanoidOptions;
    /** Rate limiter global (5.2) */
    rateLimiter?: ValidationRateLimiter;
    /** Audit log global (5.3) */
    auditLog?: SecurityAuditLog;
    /** Bloquear regex perigosos em .regex() (5.6) */
    blockUnsafeRegex?: boolean;
    /** Executar refinements com timeout sandbox (5.5) */
    sandboxRefinements?: boolean;
    refinementTimeoutMs?: number;
    /** Secret padrão para assinatura de schemas (5.4) */
    schemaSecret?: string;
}
interface AuditEntry {
    timestamp: Date;
    type: "injection_attempt" | "rate_limit" | "redos_blocked" | "paranoid_reject" | "schema_tamper" | "sandbox_timeout";
    message: string;
    path?: string[];
    pattern?: string;
    key?: string;
}
type RedosRisk = "low" | "medium" | "high";
interface RedosAnalysis {
    risk: RedosRisk;
    safe: boolean;
    reasons: string[];
    source: string;
}
interface CSPAuditResult {
    compliant: boolean;
    usesEval: boolean;
    usesFunction: boolean;
    usesDynamicImport: boolean;
    notes: string[];
}
interface SignedSchema<T extends InputFyTypeAny> {
    schema: T;
    signature: string;
    safeParse(data: unknown): SafeParseReturnType<T["_input"], T["_output"]>;
    parse(data: unknown): T["_output"];
}
interface SecurityParseContext {
    key?: string;
    skipRateLimit?: boolean;
    skipParanoid?: boolean;
}

interface SecureParseParams extends ParseParams {
    security?: SecurityParseContext;
}
/** Parse seguro com todas as camadas de segurança (5.x) */
declare function secureParse<T extends InputFyTypeAny>(schema: T, data: unknown, params?: SecureParseParams): SafeParseReturnType<T["_input"], T["_output"]>;
declare function secureParseAsync<T extends InputFyTypeAny>(schema: T, data: unknown, params?: SecureParseParams): Promise<SafeParseReturnType<T["_input"], T["_output"]>>;

interface OtelSpan {
    setAttribute(key: string, value: string | number | boolean): void;
    setStatus(status: {
        code: "OK" | "ERROR";
        message?: string;
    }): void;
    recordException?(error: Error): void;
    end(): void;
}
interface OtelTracer {
    startSpan(name: string, attributes?: Record<string, string | number | boolean>): OtelSpan;
}
interface TracerProvider {
    getTracer(name: string): OtelTracer;
}
interface MetricLabels {
    schema: string;
    field?: string;
    status?: "success" | "failure";
    code?: string;
}
interface FieldFailureStat {
    schema: string;
    field: string;
    count: number;
    lastSeen: Date;
}
interface SchemaAnalyticsSnapshot {
    schema: string;
    totalValidations: number;
    failures: number;
    failureRate: number;
    topFailingFields: FieldFailureStat[];
}
interface HealthCheckEntry {
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
    durationMs?: number;
}
interface HealthCheckResult {
    status: "ok" | "degraded" | "error";
    timestamp: string;
    version?: string;
    uptimeMs: number;
    checks: HealthCheckEntry[];
}
interface ObservabilityConfig {
    enabled?: boolean;
    tracer?: TracerProvider;
    metrics?: ValidationMetricsLike;
    analytics?: SchemaAnalyticsLike;
    defaultSchemaId?: string;
    serviceName?: string;
}
interface ValidationMetricsLike {
    recordValidation(schema: string, success: boolean, issues?: InputFyIssue[]): void;
    toPrometheus(): string;
}
interface SchemaAnalyticsLike {
    recordParse(schema: string, success: boolean, issues?: InputFyIssue[]): void;
    getTopFailingFields(schema?: string, limit?: number): FieldFailureStat[];
    getSnapshot(schema: string): SchemaAnalyticsSnapshot;
}
interface ObservedParseOptions {
    schemaId?: string;
    attributes?: Record<string, string | number | boolean>;
}
interface RegisteredSchema {
    id: string;
    schema: InputFyTypeAny;
    sample?: unknown;
    description?: string;
}

interface HealthCheckOptions {
    version?: string;
    /** Verificar fingerprint estável */
    checkFingerprints?: boolean;
    /** Amostra customizada por schema id */
    samples?: Record<string, unknown>;
}
/** Health check de schemas registrados (9.4) */
declare function createHealthCheck(schemas: RegisteredSchema[] | Record<string, InputFyTypeAny>, options?: HealthCheckOptions): HealthCheckResult;
/** Handler HTTP genérico para health check (Express/Fastify/Koa compatible) */
declare function createHealthCheckHandler(schemas: RegisteredSchema[] | Record<string, InputFyTypeAny>, options?: HealthCheckOptions): (_req: unknown, res: {
    status: (code: number) => {
        json: (body: unknown) => void;
    };
}) => void;
/** Registro de schemas para health check contínuo */
declare class SchemaRegistry {
    private readonly schemas;
    register(entry: RegisteredSchema): void;
    unregister(id: string): void;
    list(): RegisteredSchema[];
    healthCheck(options?: HealthCheckOptions): HealthCheckResult;
    handler(options?: HealthCheckOptions): (_req: unknown, res: {
        status: (code: number) => {
            json: (body: unknown) => void;
        };
    }) => void;
}
declare const defaultSchemaRegistry: SchemaRegistry;
declare function createSchemaRegistry(): SchemaRegistry;

/** safeParse com tracing, métricas e analytics (9.1–9.3) */
declare function observedSafeParse<T extends InputFyTypeAny>(schema: T, data: unknown, options?: ObservedParseOptions): SafeParseReturnType<T["_input"], T["_output"]>;
/** parse com observabilidade — lança InputFyError em falha */
declare function observedParse<T extends InputFyTypeAny>(schema: T, data: unknown, options?: ObservedParseOptions): T["_output"];
/** Envolve schema registrando métricas em cada safeParse */
declare function createObservedSchema<T extends InputFyTypeAny>(schema: T, schemaId: string): T;

export { type AuditEntry as A, type BenchmarkOptions as B, type CSPAuditResult as C, createRateLimiter as D, createSchemaCache as E, type FieldFailureStat as F, createSchemaRegistry as G, type HealthCheckEntry as H, defaultAuditLog as I, defaultSchemaCache as J, defaultSchemaRegistry as K, type LazyRegistryOptions as L, isCompilable as M, observedParse as N, type ObservabilityConfig as O, type ParanoidOptions as P, observedSafeParse as Q, type RedosAnalysis as R, type SchemaAnalyticsSnapshot as S, type TracerProvider as T, secureParse as U, ValidationRateLimiter as V, type WorkerPoolOptions as W, secureParseAsync as X, type StreamValidationResult as Y, type SchemaLoader as Z, type MetricLabels as _, type BenchmarkResult as a, type BenchmarkSuite as b, type CompiledValidator as c, type HealthCheckOptions as d, type HealthCheckResult as e, type ObservedParseOptions as f, type OtelSpan as g, type OtelTracer as h, type RegisteredSchema as i, SchemaCache as j, type SchemaCacheOptions as k, SchemaRegistry as l, type SecureParseParams as m, SecurityAuditLog as n, type SecurityConfig as o, type SecurityParseContext as p, type SignedSchema as q, type StreamValidatorOptions as r, type SuspiciousPattern as s, cachedCompile as t, cachedParse as u, compile as v, createAuditLog as w, createHealthCheck as x, createHealthCheckHandler as y, createObservedSchema as z };
