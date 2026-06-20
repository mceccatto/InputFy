import { a as InputFyType, l as SchemaDef, P as ParseContext, b as InputFyTypeAny, U as UnknownKeysParam } from './errors-EOLUu52Y.js';

type StringCheck = {
    kind: "min";
    value: number;
    message?: string | undefined;
} | {
    kind: "max";
    value: number;
    message?: string | undefined;
} | {
    kind: "length";
    value: number;
    message?: string | undefined;
} | {
    kind: "email";
    message?: string | undefined;
} | {
    kind: "url";
    message?: string | undefined;
} | {
    kind: "uuid";
    message?: string | undefined;
} | {
    kind: "cuid";
    message?: string | undefined;
} | {
    kind: "cuid2";
    message?: string | undefined;
} | {
    kind: "ulid";
    message?: string | undefined;
} | {
    kind: "regex";
    regex: RegExp;
    message?: string | undefined;
} | {
    kind: "includes";
    value: string;
    message?: string | undefined;
} | {
    kind: "startsWith";
    value: string;
    message?: string | undefined;
} | {
    kind: "endsWith";
    value: string;
    message?: string | undefined;
} | {
    kind: "datetime";
    message?: string | undefined;
} | {
    kind: "ip";
    version?: "v4" | "v6" | undefined;
    message?: string | undefined;
} | {
    kind: "base64";
    message?: string | undefined;
} | {
    kind: "nanoid";
    message?: string | undefined;
} | {
    kind: "jwt";
    message?: string | undefined;
} | {
    kind: "trim";
} | {
    kind: "toLowerCase";
} | {
    kind: "toUpperCase";
};
interface InputFyStringDef extends SchemaDef {
    typeName: "InputFyString";
    checks: StringCheck[];
    coerce?: boolean | undefined;
}
declare class InputFyString extends InputFyType<string, string> {
    readonly _def: InputFyStringDef;
    constructor(def: InputFyStringDef);
    _parse(ctx: ParseContext): string;
    protected _clone(): this;
    min(len: number, message?: string): this;
    max(len: number, message?: string): this;
    length(len: number, message?: string): this;
    email(message?: string): this;
    url(message?: string): this;
    uuid(message?: string): this;
    cuid(message?: string): this;
    cuid2(message?: string): this;
    ulid(message?: string): this;
    regex(regex: RegExp, message?: string): this;
    includes(value: string, message?: string): this;
    startsWith(value: string, message?: string): this;
    endsWith(value: string, message?: string): this;
    datetime(message?: string): this;
    ip(options?: {
        version?: "v4" | "v6";
        message?: string;
    }): this;
    base64(message?: string): this;
    nanoid(message?: string): this;
    jwt(message?: string): this;
    trim(): this;
    toLowerCase(): this;
    toUpperCase(): this;
    private _addCheck;
}
type NumberCheck = {
    kind: "min";
    value: number;
    inclusive: boolean;
    message?: string | undefined;
} | {
    kind: "max";
    value: number;
    inclusive: boolean;
    message?: string | undefined;
} | {
    kind: "int";
    message?: string | undefined;
} | {
    kind: "multipleOf";
    value: number;
    message?: string | undefined;
} | {
    kind: "finite";
    message?: string | undefined;
} | {
    kind: "positive";
    message?: string | undefined;
} | {
    kind: "negative";
    message?: string | undefined;
} | {
    kind: "nonnegative";
    message?: string | undefined;
} | {
    kind: "nonpositive";
    message?: string | undefined;
};
interface InputFyNumberDef extends SchemaDef {
    typeName: "InputFyNumber";
    checks: NumberCheck[];
    coerce?: boolean | undefined;
}
declare class InputFyNumber extends InputFyType<number, number> {
    readonly _def: InputFyNumberDef;
    constructor(def: InputFyNumberDef);
    _parse(ctx: ParseContext): number;
    protected _clone(): this;
    min(value: number, message?: string): this;
    max(value: number, message?: string): this;
    gt(value: number, message?: string): this;
    gte(value: number, message?: string): this;
    lt(value: number, message?: string): this;
    lte(value: number, message?: string): this;
    int(message?: string): this;
    positive(message?: string): this;
    negative(message?: string): this;
    nonnegative(message?: string): this;
    nonpositive(message?: string): this;
    multipleOf(value: number, message?: string): this;
    finite(message?: string): this;
    step(value: number, message?: string): this;
    private _addCheck;
}
declare class InputFyBoolean extends InputFyType<boolean, boolean> {
    readonly _def: SchemaDef & {
        coerce?: boolean | undefined;
    };
    constructor(def?: SchemaDef & {
        coerce?: boolean | undefined;
    });
    _parse(ctx: ParseContext): boolean;
    protected _clone(): this;
}
declare class InputFyBigInt extends InputFyType<bigint, bigint> {
    readonly _def: SchemaDef & {
        checks: BigIntCheck[];
        coerce?: boolean | undefined;
    };
    constructor(def?: SchemaDef & {
        checks?: BigIntCheck[];
        coerce?: boolean | undefined;
    });
    _parse(ctx: ParseContext): bigint;
    protected _clone(): this;
    min(value: bigint, message?: string): this;
    max(value: bigint, message?: string): this;
}
type BigIntCheck = {
    kind: "min";
    value: bigint;
    inclusive: boolean;
    message?: string | undefined;
} | {
    kind: "max";
    value: bigint;
    inclusive: boolean;
    message?: string | undefined;
};
declare class InputFyDate extends InputFyType<Date, Date> {
    readonly _def: SchemaDef & {
        checks: DateCheck[];
        coerce?: boolean | undefined;
    };
    constructor(def?: SchemaDef & {
        checks?: DateCheck[];
        coerce?: boolean | undefined;
    });
    _parse(ctx: ParseContext): Date;
    protected _clone(): this;
    min(value: Date, message?: string): this;
    max(value: Date, message?: string): this;
}
type DateCheck = {
    kind: "min";
    value: Date;
    message?: string | undefined;
} | {
    kind: "max";
    value: Date;
    message?: string | undefined;
};
declare class InputFyAny extends InputFyType<any, any> {
    readonly _def: SchemaDef;
    _parse(ctx: ParseContext): unknown;
    protected _clone(): this;
}
declare class InputFyUnknown extends InputFyType<unknown, unknown> {
    readonly _def: SchemaDef;
    _parse(ctx: ParseContext): unknown;
    protected _clone(): this;
}
declare class InputFyNever extends InputFyType<never, never> {
    readonly _def: SchemaDef;
    _parse(ctx: ParseContext): never;
    protected _clone(): this;
}
declare class InputFyVoid extends InputFyType<void, void> {
    readonly _def: SchemaDef;
    _parse(ctx: ParseContext): void;
    protected _clone(): this;
}
declare class InputFyNaN extends InputFyType<number, number> {
    readonly _def: SchemaDef;
    _parse(ctx: ParseContext): number;
    protected _clone(): this;
}
declare class InputFyLiteral<T extends string | number | boolean | bigint | null | undefined> extends InputFyType<T, T> {
    readonly _def: SchemaDef & {
        value: T;
    };
    constructor(value: T);
    _parse(ctx: ParseContext): T;
    protected _clone(): this;
}
declare class InputFyEnum<T extends readonly [string, ...string[]]> extends InputFyType<T[number], T[number]> {
    readonly _def: SchemaDef & {
        values: T;
    };
    constructor(values: T);
    get enum(): {
        [K in T[number]]: K;
    };
    get options(): T;
    _parse(ctx: ParseContext): T[number];
    protected _clone(): this;
    extract<U extends T[number], Remaining extends readonly T[number][]>(values: readonly U[]): InputFyEnum<[U, ...Remaining]>;
    exclude<U extends T[number], Remaining extends readonly T[number][]>(values: readonly U[]): InputFyEnum<[Exclude<T[number], U>, ...Remaining]>;
}
declare class InputFyNativeEnum<T extends Record<string, string | number>> extends InputFyType<T[keyof T], T[keyof T]> {
    readonly _def: SchemaDef & {
        enum: T;
    };
    constructor(enumObj: T);
    _parse(ctx: ParseContext): T[keyof T];
    protected _clone(): this;
}
declare class InputFyInstanceof<T extends new (...args: never[]) => unknown> extends InputFyType<InstanceType<T>, InstanceType<T>> {
    readonly _def: SchemaDef & {
        cls: T;
    };
    constructor(cls: T);
    _parse(ctx: ParseContext): InstanceType<T>;
    protected _clone(): this;
}
declare class InputFyCustom<T> extends InputFyType<T, T> {
    readonly _def: SchemaDef & {
        fn: (val: unknown) => val is T;
        message?: string | undefined;
    };
    constructor(fn: (val: unknown) => val is T, message?: string);
    _parse(ctx: ParseContext): T;
    protected _clone(): this;
}

type InputFyRawShape = {
    [k: string]: InputFyTypeAny;
};
declare class InputFyArray<T extends InputFyTypeAny> extends InputFyType<T["_input"][], T["_output"][]> {
    readonly _def: SchemaDef & {
        type: T;
        minLength: number | null;
        maxLength: number | null;
        exactLength: number | null;
    };
    constructor(type: T, constraints?: {
        minLength?: number | null;
        maxLength?: number | null;
        exactLength?: number | null;
    });
    get element(): T;
    _parse(ctx: ParseContext): T["_output"][];
    protected _clone(): this;
    min(length: number): this;
    max(length: number): this;
    length(length: number): this;
    nonempty(): this;
}
declare class InputFyObject<T extends InputFyRawShape> extends InputFyType<{
    [K in keyof T]: T[K]["_input"];
}, {
    [K in keyof T]: T[K]["_output"];
}> {
    readonly _def: SchemaDef & {
        shape: () => T;
        unknownKeys: UnknownKeysParam;
        catchall: InputFyTypeAny;
    };
    constructor(shape: T, params?: {
        unknownKeys?: UnknownKeysParam;
        catchall?: InputFyTypeAny;
    });
    get shape(): T;
    _parse(ctx: ParseContext): {
        [K in keyof T]: T[K]["_output"];
    };
    protected _clone(): this;
    extend<U extends InputFyRawShape>(shape: U): InputFyObject<T & U>;
    merge<U extends InputFyRawShape>(other: InputFyObject<U>): InputFyObject<T & U>;
    pick<M extends {
        [K in keyof T]?: true;
    }>(mask: M): InputFyObject<Pick<T, Extract<keyof M, keyof T>>>;
    omit<M extends {
        [K in keyof T]?: true;
    }>(mask: M): InputFyObject<Omit<T, Extract<keyof M, keyof T>>>;
    partial(): InputFyObject<{
        [K in keyof T]: ReturnType<T[K]["optional"]>;
    }>;
    required(): this;
    strict(): this;
    strip(): this;
    passthrough(): this;
    catchall(schema: InputFyTypeAny): this;
    keyof(): InputFyEnum<[string, ...string[]]>;
}
declare class InputFyTuple<T extends InputFyTypeAny[] | [], Rest extends InputFyTypeAny | null = null> extends InputFyType<TupleInput<T, Rest>, TupleOutput<T, Rest>> {
    readonly _def: SchemaDef & {
        items: T;
        rest: Rest;
    };
    constructor(items: T, rest?: Rest);
    _parse(ctx: ParseContext): TupleOutput<T, Rest>;
    protected _clone(): this;
    rest<R extends InputFyTypeAny>(rest: R): InputFyTuple<T, R>;
}
type TupleInput<T extends InputFyTypeAny[], Rest extends InputFyTypeAny | null> = Rest extends InputFyTypeAny ? {
    [K in keyof T]: T[K]["_input"];
} & Rest["_input"][] : {
    [K in keyof T]: T[K]["_input"];
};
type TupleOutput<T extends InputFyTypeAny[], Rest extends InputFyTypeAny | null> = Rest extends InputFyTypeAny ? {
    [K in keyof T]: T[K]["_output"];
} & Rest["_output"][] : {
    [K in keyof T]: T[K]["_output"];
};
declare class InputFyUnion<T extends readonly [InputFyTypeAny, ...InputFyTypeAny[]]> extends InputFyType<T[number]["_input"], T[number]["_output"]> {
    readonly _def: SchemaDef & {
        options: T;
    };
    constructor(options: T);
    get options(): T;
    _parse(ctx: ParseContext): T[number]["_output"];
    protected _clone(): this;
}
declare class InputFyDiscriminatedUnion<Disc extends string, Options extends readonly InputFyObject<InputFyRawShape>[]> extends InputFyType<Options[number]["_input"], Options[number]["_output"]> {
    readonly _def: SchemaDef & {
        discriminator: Disc;
        options: Options;
    };
    constructor(discriminator: Disc, options: Options);
    _parse(ctx: ParseContext): Options[number]["_output"];
    protected _clone(): this;
}
declare class InputFyIntersection<T extends InputFyTypeAny, U extends InputFyTypeAny> extends InputFyType<T["_input"] & U["_input"], T["_output"] & U["_output"]> {
    readonly _def: SchemaDef & {
        left: T;
        right: U;
    };
    constructor(left: T, right: U);
    _parse(ctx: ParseContext): T["_output"] & U["_output"];
    protected _clone(): this;
}
declare class InputFyRecord<Key extends InputFyTypeAny = InputFyType<string, string>, Value extends InputFyTypeAny = InputFyTypeAny> extends InputFyType<Record<string, Value["_input"]>, Record<string, Value["_output"]>> {
    readonly _def: SchemaDef & {
        keyType: Key;
        valueType: Value;
    };
    constructor(keyType: Key, valueType: Value);
    _parse(ctx: ParseContext): Record<string, Value["_output"]>;
    protected _clone(): this;
}
declare class InputFyMap<Key extends InputFyTypeAny = InputFyTypeAny, Value extends InputFyTypeAny = InputFyTypeAny> extends InputFyType<Map<Key["_input"], Value["_input"]>, Map<Key["_output"], Value["_output"]>> {
    readonly _def: SchemaDef & {
        keyType: Key;
        valueType: Value;
    };
    constructor(keyType: Key, valueType: Value);
    _parse(ctx: ParseContext): Map<Key["_output"], Value["_output"]>;
    protected _clone(): this;
}
declare class InputFySet<T extends InputFyTypeAny> extends InputFyType<Set<T["_input"]>, Set<T["_output"]>> {
    readonly _def: SchemaDef & {
        valueType: T;
        minSize: number | null;
        maxSize: number | null;
    };
    constructor(valueType: T, constraints?: {
        minSize?: number | null;
        maxSize?: number | null;
    });
    _parse(ctx: ParseContext): Set<T["_output"]>;
    protected _clone(): this;
    min(size: number): this;
    max(size: number): this;
    size(size: number): this;
    nonempty(): this;
}
declare class InputFyLazy<T extends InputFyTypeAny> extends InputFyType<T["_input"], T["_output"]> {
    readonly _def: SchemaDef & {
        getter: () => T;
    };
    constructor(getter: () => T);
    get schema(): T;
    _parse(ctx: ParseContext): T["_output"];
    protected _clone(): this;
}
declare class InputFyPromise<T extends InputFyTypeAny> extends InputFyType<Promise<T["_input"]>, Promise<T["_output"]>> {
    readonly _def: SchemaDef & {
        type: T;
    };
    constructor(type: T);
    _parse(ctx: ParseContext): Promise<T["_output"]>;
    protected _clone(): this;
}
declare class InputFyFunction<Args extends InputFyTuple<InputFyTypeAny[]> = InputFyTuple<[]>, Returns extends InputFyTypeAny = InputFyType<unknown, unknown>> extends InputFyType<(...args: Args["_input"] extends unknown[] ? Args["_input"] : never) => Returns["_output"], (...args: Args["_input"] extends unknown[] ? Args["_input"] : never) => Returns["_output"]> {
    readonly _def: SchemaDef & {
        args: Args;
        returns: Returns;
    };
    constructor(args?: Args, returns?: Returns);
    _parse(ctx: ParseContext): (...args: never) => Returns["_output"];
    protected _clone(): this;
    args<A extends InputFyTuple<InputFyTypeAny[]>>(args: A): InputFyFunction<A, Returns>;
    returns<R extends InputFyTypeAny>(returns: R): InputFyFunction<Args, R>;
    implement<F extends (...args: never) => Returns["_output"]>(fn: F): F;
    implementAsync<F extends (...args: never) => Promise<Returns["_output"]>>(fn: F): F;
}
declare class InputFyPipeline<A extends InputFyTypeAny, B extends InputFyTypeAny> extends InputFyType<A["_input"], B["_output"]> {
    readonly _def: SchemaDef & {
        in: A;
        out: B;
    };
    constructor(def: SchemaDef & {
        in: A;
        out: B;
    });
    _parse(ctx: ParseContext): B["_output"];
    protected _clone(): this;
}
declare class InputFyPreprocess<T extends InputFyTypeAny> extends InputFyType<unknown, T["_output"]> {
    readonly _def: SchemaDef & {
        preprocess: (val: unknown) => unknown;
        schema: T;
    };
    constructor(preprocess: (val: unknown) => unknown, schema: T);
    _parse(ctx: ParseContext): T["_output"];
    protected _clone(): this;
}
declare function array<T extends InputFyTypeAny>(schema: T): InputFyArray<T>;
declare function object<T extends InputFyRawShape>(shape: T): InputFyObject<T>;
declare function strictObject<T extends InputFyRawShape>(shape: T): InputFyObject<T>;
declare function looseObject<T extends InputFyRawShape>(shape: T): InputFyObject<T>;
declare function tuple<T extends InputFyTypeAny[] | []>(items: T): InputFyTuple<T>;
declare function union<T extends readonly [InputFyTypeAny, InputFyTypeAny, ...InputFyTypeAny[]]>(options: T): InputFyUnion<T>;
declare function discriminatedUnion<Disc extends string, Options extends readonly [InputFyObject<InputFyRawShape>, ...InputFyObject<InputFyRawShape>[]]>(discriminator: Disc, options: Options): InputFyDiscriminatedUnion<Disc, Options>;
declare function intersection<T extends InputFyTypeAny, U extends InputFyTypeAny>(left: T, right: U): InputFyIntersection<T, U>;
declare function record<Value extends InputFyTypeAny>(valueType: Value): InputFyRecord<InputFyString, Value>;
declare function record<Key extends InputFyTypeAny, Value extends InputFyTypeAny>(keyType: Key, valueType: Value): InputFyRecord<Key, Value>;
declare function map<Key extends InputFyTypeAny, Value extends InputFyTypeAny>(keyType: Key, valueType: Value): InputFyMap<Key, Value>;
declare function set<T extends InputFyTypeAny>(valueType: T): InputFySet<T>;
declare function lazy<T extends InputFyTypeAny>(getter: () => T): InputFyLazy<T>;
declare function promise<T extends InputFyTypeAny>(schema: T): InputFyPromise<T>;
declare function preprocess<T extends InputFyTypeAny>(preprocess: (val: unknown) => unknown, schema: T): InputFyPreprocess<T>;
declare function _function(): InputFyFunction;
declare function pipeline<A extends InputFyTypeAny, B extends InputFyTypeAny>(inSchema: A, outSchema: B): InputFyPipeline<A, B>;

export { InputFyNativeEnum as A, InputFyInstanceof as B, InputFyCustom as C, InputFyArray as D, InputFyFunction as E, InputFyLazy as F, InputFyObject as G, InputFyPipeline as H, InputFyString as I, InputFyTuple as J, InputFyUnion as K, _function as _, InputFyNumber as a, InputFyBoolean as b, InputFyBigInt as c, InputFyDate as d, InputFyVoid as e, InputFyAny as f, InputFyUnknown as g, InputFyNever as h, InputFyNaN as i, array as j, discriminatedUnion as k, looseObject as l, intersection as m, map as n, object as o, set as p, lazy as q, record as r, strictObject as s, tuple as t, union as u, promise as v, preprocess as w, pipeline as x, InputFyLiteral as y, InputFyEnum as z };
