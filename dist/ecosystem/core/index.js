import "../../chunk-R3MKK6PJ.js";
import "../../chunk-6BRJW3EJ.js";
import {
  InputFyAny,
  InputFyArray,
  InputFyBigInt,
  InputFyBoolean,
  InputFyCustom,
  InputFyDate,
  InputFyEnum,
  InputFyFunction,
  InputFyInstanceof,
  InputFyLazy,
  InputFyLiteral,
  InputFyNaN,
  InputFyNativeEnum,
  InputFyNever,
  InputFyNull,
  InputFyNumber,
  InputFyObject,
  InputFyPipeline,
  InputFyString,
  InputFySymbol,
  InputFyTuple,
  InputFyType,
  InputFyUndefined,
  InputFyUnion,
  InputFyUnknown,
  InputFyVoid,
  _function,
  array,
  discriminatedUnion,
  intersection,
  lazy,
  looseObject,
  map,
  object,
  pipeline,
  preprocess,
  promise,
  record,
  set,
  strictObject,
  tuple,
  union
} from "../../chunk-NGXKC4QO.js";
import {
  InputFyError,
  flattenError,
  prettifyError,
  treeifyError
} from "../../chunk-WKU77X7G.js";
import {
  DANGEROUS_KEYS,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS,
  MAX_PARSE_DEPTH,
  MAX_STRING_LENGTH
} from "../../chunk-E7G4F2VH.js";
import "../../chunk-GMXKR4ET.js";
import "../../chunk-MCKGQKYU.js";

// src/ecosystem/core/index.ts
function _string(params) {
  const schema = new InputFyString({ typeName: "InputFyString", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _number(params) {
  const schema = new InputFyNumber({ typeName: "InputFyNumber", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _boolean(params) {
  const schema = new InputFyBoolean({ typeName: "InputFyBoolean" });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _bigint(params) {
  const schema = new InputFyBigInt({ typeName: "InputFyBigInt", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _date(params) {
  const schema = new InputFyDate({ typeName: "InputFyDate", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
var coerce = {
  string: () => new InputFyString({ typeName: "InputFyString", checks: [], coerce: true }),
  number: () => new InputFyNumber({ typeName: "InputFyNumber", checks: [], coerce: true }),
  boolean: () => new InputFyBoolean({ typeName: "InputFyBoolean", coerce: true }),
  bigint: () => new InputFyBigInt({ typeName: "InputFyBigInt", checks: [], coerce: true }),
  date: () => new InputFyDate({ typeName: "InputFyDate", checks: [], coerce: true })
};
var v = {
  string: _string,
  number: _number,
  boolean: _boolean,
  bigint: _bigint,
  date: _date,
  symbol: () => InputFySymbol,
  undefined: () => InputFyUndefined,
  null: () => InputFyNull,
  void: () => InputFyVoid,
  any: () => new InputFyAny(),
  unknown: () => new InputFyUnknown(),
  never: () => new InputFyNever(),
  nan: () => new InputFyNaN(),
  int: () => _number().int(),
  coerce,
  object,
  strictObject,
  looseObject,
  array,
  tuple,
  union,
  discriminatedUnion,
  intersection,
  record,
  map,
  set,
  lazy,
  promise,
  preprocess,
  pipeline,
  function: _function,
  literal: (value) => new InputFyLiteral(value),
  enum: (values) => new InputFyEnum(values),
  nativeEnum: (enumObj) => new InputFyNativeEnum(enumObj),
  instanceof: (cls) => new InputFyInstanceof(cls),
  custom: (fn, message) => new InputFyCustom(fn, message)
};
var z = v;
var core_default = v;
var CORE_ZERO_DEPENDENCIES = true;
export {
  CORE_ZERO_DEPENDENCIES,
  DANGEROUS_KEYS,
  InputFyArray,
  InputFyBoolean,
  InputFyEnum,
  InputFyError,
  InputFyFunction,
  InputFyLazy,
  InputFyLiteral,
  InputFyNumber,
  InputFyObject,
  InputFyPipeline,
  InputFyString,
  InputFyTuple,
  InputFyType,
  InputFyUnion,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS,
  MAX_PARSE_DEPTH,
  MAX_STRING_LENGTH,
  InputFyError as ZodError,
  core_default as default,
  flattenError,
  prettifyError,
  treeifyError,
  v,
  z
};
