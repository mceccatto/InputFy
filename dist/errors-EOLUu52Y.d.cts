declare abstract class InputFyType<Input = unknown, Output = Input> {
    readonly _input: Input;
    readonly _output: Output;
    abstract readonly _def: SchemaDef;
    abstract _parse(ctx: ParseContext): unknown | Promise<unknown>;
    protected abstract _clone(): this;
    parse(data: unknown, params?: ParseParams): Output;
    safeParse(data: unknown, params?: ParseParams): SafeParseReturnType<Input, Output>;
    parseAsync(data: unknown, params?: ParseParams): Promise<Output>;
    safeParseAsync(data: unknown, params?: ParseParams): Promise<SafeParseReturnType<Input, Output>>;
    describe(description: string): this;
    brand<B extends string | number | symbol>(): this & {
        readonly _brand: B;
    };
    refine(check: (val: Output) => boolean | Promise<boolean>, message?: string | {
        message?: string;
        fatal?: boolean;
    }): InputFyType<Input, Output>;
    superRefine(check: (val: Output, ctx: RefinementCtx) => void | Promise<void>): InputFyType<Input, Output>;
    transform<TNew>(transform: (val: Output, ctx: RefinementCtx) => TNew | Promise<TNew>): InputFyType<Input, TNew>;
    protected _addRefine(check: (val: Output) => boolean | Promise<boolean>, message?: string | undefined, fatal?: boolean | undefined): InputFyType<Input, Output>;
    protected _addSuperRefine(check: (val: Output, ctx: RefinementCtx) => void | Promise<void>): InputFyType<Input, Output>;
    protected _addTransform<TNew>(transform: (val: Output, ctx: RefinementCtx) => TNew | Promise<TNew>): InputFyType<Input, TNew>;
    protected _withEffect(effect: Effect): InputFyType<any, any>;
    private _parseSync;
    private _parseAsync;
    private _parseWithEffects;
}

declare const MAX_PARSE_DEPTH = 128;
declare const MAX_OBJECT_KEYS = 10000;
declare const MAX_ARRAY_LENGTH = 100000;
declare const MAX_STRING_LENGTH = 10000000;
/** Chaves perigosas bloqueadas (prototype pollution) */
declare const DANGEROUS_KEYS: Set<string>;
type ParsedType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "date" | "null" | "array" | "unknown" | "promise" | "map" | "set" | "nan";
type IssueCode = "invalid_type" | "invalid_literal" | "unrecognized_keys" | "invalid_union" | "invalid_union_discriminator" | "invalid_enum_value" | "invalid_arguments" | "invalid_return_type" | "invalid_date" | "invalid_string" | "too_small" | "too_big" | "invalid_intersection_types" | "not_multiple_of" | "not_finite" | "custom";
type IssueSeverity = "error" | "warning" | "info";
interface IssueBase {
    code: IssueCode;
    path: (string | number)[];
    message: string;
    severity?: IssueSeverity;
    suggestion?: string;
}
interface InvalidTypeIssue extends IssueBase {
    code: "invalid_type";
    expected: ParsedType | string;
    received: ParsedType;
}
interface InvalidLiteralIssue extends IssueBase {
    code: "invalid_literal";
    expected: unknown;
    received: unknown;
}
interface UnrecognizedKeysIssue extends IssueBase {
    code: "unrecognized_keys";
    keys: string[];
}
interface InvalidUnionIssue extends IssueBase {
    code: "invalid_union";
    unionErrors: InputFyError[];
}
interface InvalidUnionDiscriminatorIssue extends IssueBase {
    code: "invalid_union_discriminator";
    options: readonly (string | number)[];
}
interface InvalidEnumValueIssue extends IssueBase {
    code: "invalid_enum_value";
    options: readonly (string | number)[];
    received?: string | number;
}
interface InvalidArgumentsIssue extends IssueBase {
    code: "invalid_arguments";
    argumentsError: InputFyError;
}
interface InvalidReturnTypeIssue extends IssueBase {
    code: "invalid_return_type";
    returnTypeError: InputFyError;
}
interface InvalidDateIssue extends IssueBase {
    code: "invalid_date";
}
interface InvalidStringIssue extends IssueBase {
    code: "invalid_string";
    validation: StringValidation;
}
interface TooSmallIssue extends IssueBase {
    code: "too_small";
    minimum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
interface TooBigIssue extends IssueBase {
    code: "too_big";
    maximum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
interface InvalidIntersectionIssue extends IssueBase {
    code: "invalid_intersection_types";
}
interface NotMultipleOfIssue extends IssueBase {
    code: "not_multiple_of";
    multipleOf: number | bigint;
}
interface NotFiniteIssue extends IssueBase {
    code: "not_finite";
}
interface CustomIssue extends IssueBase {
    code: "custom";
    params?: Record<string, unknown>;
}
type StringValidation = "email" | "url" | "uuid" | "cuid" | "cuid2" | "ulid" | "regex" | "datetime" | "emoji" | "ip" | "base64" | "nanoid" | "includes" | "startsWith" | "endsWith";
type InputFyIssue = InvalidTypeIssue | InvalidLiteralIssue | UnrecognizedKeysIssue | InvalidUnionIssue | InvalidUnionDiscriminatorIssue | InvalidEnumValueIssue | InvalidArgumentsIssue | InvalidReturnTypeIssue | InvalidDateIssue | InvalidStringIssue | TooSmallIssue | TooBigIssue | InvalidIntersectionIssue | NotMultipleOfIssue | NotFiniteIssue | CustomIssue;
type ErrorMap = (issue: InputFyIssue, ctx: {
    defaultError: string;
    data: unknown;
}) => {
    message: string;
};
interface ParseParams {
    path?: (string | number)[];
    errorMap?: ErrorMap;
    async?: boolean;
    /** Contexto externo para schemas contextuais */
    context?: ValidationContext;
}
/** Contexto de validação (env, request metadata, etc.) */
type ValidationContext = Record<string, unknown>;
interface ParseContext {
    common: {
        issues: InputFyIssue[];
        contextualErrorMap?: ErrorMap | undefined;
        async: boolean;
        /** Contexto compartilhado durante o parse */
        context: ValidationContext;
    };
    path: (string | number)[];
    parent: ParseContext | null;
    data: unknown;
    parsedType: ParsedType;
    depth: number;
}
type SafeParseSuccess<Output> = {
    success: true;
    data: Output;
};
type SafeParseError = {
    success: false;
    error: InputFyError;
};
type SafeParseReturnType<Input, Output> = SafeParseSuccess<Output> | SafeParseError;
type UnknownKeysParam = "passthrough" | "strict" | "strip";
type RefinementCtx = {
    addIssue: (issue: Partial<InputFyIssue> & Pick<InputFyIssue, "code" | "message">) => void;
    path: (string | number)[];
};
type RefinementEffect<T> = {
    type: "refinement";
    refinement: (val: T, ctx: RefinementCtx) => boolean | void | Promise<boolean | void>;
    message?: string | undefined;
    fatal?: boolean | undefined;
};
type TransformEffect<T, U> = {
    type: "transform";
    transform: (val: T, ctx: RefinementCtx) => U | Promise<U>;
};
type PreprocessEffect = {
    type: "preprocess";
    transform: (val: unknown, ctx: RefinementCtx) => unknown | Promise<unknown>;
};
type Effect<T = unknown, U = T> = RefinementEffect<T> | TransformEffect<T, U> | PreprocessEffect;
interface SchemaDef {
    typeName: string;
    description?: string | undefined;
    /** Metadados extensíveis (similar Zod .meta()) */
    metadata?: Record<string, unknown> | undefined;
    errorMap?: ErrorMap | undefined;
    effects?: Effect[] | undefined;
}
type InputFyTypeAny = InputFyType<any, any>;
type input<T extends InputFyTypeAny> = T["_input"];
type output<T extends InputFyTypeAny> = T["_output"];
type infer<T extends InputFyTypeAny> = T["_output"];

declare class InputFyError extends Error {
    readonly issues: InputFyIssue[];
    constructor(issues: InputFyIssue[]);
    static create(issues: InputFyIssue[]): InputFyError;
    format(): Record<string, unknown>;
    flatten(): {
        formErrors: string[];
        fieldErrors: Record<string, string[]>;
    };
    addIssue(issue: InputFyIssue): void;
    addIssues(issues: InputFyIssue[]): void;
    get errors(): InputFyIssue[];
}

declare function flattenError(error: InputFyError): {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
};
declare function prettifyError(error: InputFyError): string;
declare function treeifyError(error: InputFyError): Record<string, unknown>;

export { DANGEROUS_KEYS as D, InputFyError as I, MAX_ARRAY_LENGTH as M, type ParseContext as P, type SafeParseReturnType as S, type UnknownKeysParam as U, type ValidationContext as V, InputFyType as a, type InputFyTypeAny as b, type IssueSeverity as c, MAX_OBJECT_KEYS as d, MAX_PARSE_DEPTH as e, MAX_STRING_LENGTH as f, flattenError as g, type input as h, type infer as i, type IssueCode as j, type InputFyIssue as k, type SchemaDef as l, type ParseParams as m, type output as o, prettifyError as p, treeifyError as t };
