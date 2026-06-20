import { a as InputFyType } from '../../errors-EOLUu52Y.cjs';
export { D as DANGEROUS_KEYS, I as InputFyError, b as InputFyTypeAny, M as MAX_ARRAY_LENGTH, d as MAX_OBJECT_KEYS, e as MAX_PARSE_DEPTH, f as MAX_STRING_LENGTH, I as ZodError, g as flattenError, i as infer, h as input, o as output, p as prettifyError, t as treeifyError } from '../../errors-EOLUu52Y.cjs';
import { I as InputFyString, a as InputFyNumber, b as InputFyBoolean, c as InputFyBigInt, d as InputFyDate, e as InputFyVoid, f as InputFyAny, g as InputFyUnknown, h as InputFyNever, i as InputFyNaN, o as object, s as strictObject, l as looseObject, j as array, t as tuple, u as union, k as discriminatedUnion, m as intersection, r as record, n as map, p as set, q as lazy, v as promise, w as preprocess, x as pipeline, _ as _function, y as InputFyLiteral, z as InputFyEnum, A as InputFyNativeEnum, B as InputFyInstanceof, C as InputFyCustom } from '../../complex-DYeJT5M1.cjs';
export { D as InputFyArray, E as InputFyFunction, F as InputFyLazy, G as InputFyObject, H as InputFyPipeline, J as InputFyTuple, K as InputFyUnion } from '../../complex-DYeJT5M1.cjs';

/**
 * @inputfy/core — validação minimal, zero dependências runtime (10.1, 10.6)
 * Subpath: `import { v } from "inputfy/core"`
 */

declare function _string(params?: {
    description?: string;
}): InputFyString;
declare function _number(params?: {
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
/** API minimal compatível com Zod — sem interop, security, dx extras */
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
};
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
};

/** Marcação explícita — core não possui dependências runtime (10.6) */
declare const CORE_ZERO_DEPENDENCIES: true;

export { CORE_ZERO_DEPENDENCIES, InputFyBoolean, InputFyEnum, InputFyLiteral, InputFyNumber, InputFyString, InputFyType, v as default, v, z };
