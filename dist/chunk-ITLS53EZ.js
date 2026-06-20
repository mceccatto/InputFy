import {
  InputFyDefault,
  InputFyNullable,
  InputFyOptional
} from "./chunk-6BRJW3EJ.js";
import {
  assertWalkDepth
} from "./chunk-PTOGCD6L.js";
import {
  InputFyBoolean,
  InputFyEnum,
  InputFyLiteral,
  InputFyNull,
  InputFyNumber,
  InputFyString,
  InputFyUnknown,
  array,
  object,
  record,
  tuple,
  union
} from "./chunk-NGXKC4QO.js";

// src/interop/from-json-schema.ts
function mergeDefs(options) {
  return { ...options.definitions ?? {}, ...options.defs ?? {} };
}
function resolveRef(ref, options) {
  const defs = mergeDefs(options);
  const name = ref.replace(/^#\/(\$defs|definitions)\//, "");
  const resolved = defs[name];
  if (!resolved) throw new Error(`Unable to resolve $ref: ${ref}`);
  const resolving = options._resolving ?? /* @__PURE__ */ new Set();
  if (resolving.has(ref)) throw new Error(`Circular $ref detected: ${ref}`);
  resolving.add(ref);
  return resolved;
}
function str() {
  return new InputFyString({ typeName: "InputFyString", checks: [] });
}
function num() {
  return new InputFyNumber({ typeName: "InputFyNumber", checks: [] });
}
function bool() {
  return new InputFyBoolean({ typeName: "InputFyBoolean" });
}
function unknown() {
  return new InputFyUnknown();
}
function fromJSONSchemaCore(schema, options = {}) {
  const depth = (options._depth ?? 0) + 1;
  assertWalkDepth(depth);
  if (schema.$ref) {
    const localDefs = {
      ...mergeDefs(options),
      ...schema.definitions ?? {},
      ...schema.$defs ?? {}
    };
    const resolved = resolveRef(schema.$ref, { ...options, definitions: localDefs });
    return fromJSONSchema(resolved, {
      ...options,
      definitions: localDefs,
      _depth: depth,
      _resolving: /* @__PURE__ */ new Set([...options._resolving ?? [], schema.$ref])
    });
  }
  const childOpts = { ...options, _depth: depth };
  if (schema.const !== void 0) {
    return new InputFyLiteral(schema.const);
  }
  if (schema.enum && schema.enum.length > 0) {
    const values = schema.enum.filter((e) => typeof e === "string");
    if (values.length > 0) {
      return new InputFyEnum(values);
    }
    const first = schema.enum[0];
    if (typeof first === "number") {
      return union(schema.enum.map((n) => new InputFyLiteral(n)));
    }
    if (typeof first === "boolean") {
      return union(schema.enum.map((b) => new InputFyLiteral(b)));
    }
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return union(schema.anyOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return union(schema.oneOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema.allOf && schema.allOf.length > 0) {
    let result2 = fromJSONSchema(schema.allOf[0], childOpts);
    for (let i = 1; i < schema.allOf.length; i++) {
      result2 = result2.and(fromJSONSchema(schema.allOf[i], childOpts));
    }
    return result2;
  }
  const types = Array.isArray(schema.type) ? schema.type.filter((t) => t !== "null") : schema.type ? [schema.type] : [];
  const isNullable = schema.nullable === true || Array.isArray(schema.type) && schema.type.includes("null");
  let result;
  const primaryType = types[0];
  switch (primaryType) {
    case "string": {
      let s = str();
      if (schema.minLength !== void 0) s = s.min(schema.minLength);
      if (schema.maxLength !== void 0) s = s.max(schema.maxLength);
      if (schema.pattern) s = s.regex(new RegExp(schema.pattern));
      switch (schema.format) {
        case "email":
          s = s.email();
          break;
        case "uri":
        case "url":
          s = s.url();
          break;
        case "uuid":
          s = s.uuid();
          break;
        case "date-time":
          s = s.datetime();
          break;
        case "date":
          s = s.regex(/^\d{4}-\d{2}-\d{2}$/);
          break;
        default:
          break;
      }
      result = s;
      break;
    }
    case "integer":
    case "number": {
      let n = num();
      if (primaryType === "integer") n = n.int();
      if (schema.minimum !== void 0) n = n.min(schema.minimum);
      if (schema.maximum !== void 0) n = n.max(schema.maximum);
      if (schema.exclusiveMinimum !== void 0) n = n.gt(schema.exclusiveMinimum);
      if (schema.exclusiveMaximum !== void 0) n = n.lt(schema.exclusiveMaximum);
      if (schema.multipleOf !== void 0) n = n.multipleOf(schema.multipleOf);
      result = n;
      break;
    }
    case "boolean":
      result = bool();
      break;
    case "null":
      result = InputFyNull;
      break;
    case "array": {
      const items = schema.items;
      if (Array.isArray(items)) {
        const tupleItems = items.map((item) => fromJSONSchema(item, childOpts));
        result = tuple(tupleItems);
        if (schema.additionalItems && typeof schema.additionalItems === "object") {
          result = result.rest(
            fromJSONSchema(schema.additionalItems, childOpts)
          );
        }
      } else {
        let arr = array(fromJSONSchema(items ?? {}, childOpts));
        if (schema.minItems !== void 0) arr = arr.min(schema.minItems);
        if (schema.maxItems !== void 0) arr = arr.max(schema.maxItems);
        result = arr;
      }
      break;
    }
    case "object": {
      if (schema.properties) {
        const shape = {};
        const required = new Set(schema.required ?? []);
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          let field = fromJSONSchema(propSchema, childOpts);
          if (!required.has(key)) {
            field = new InputFyOptional({ innerType: field, typeName: "InputFyOptional" });
          }
          shape[key] = field;
        }
        let obj = object(shape);
        if (schema.additionalProperties === false) obj = obj.strict();
        else if (schema.additionalProperties === true) obj = obj.passthrough();
        else if (typeof schema.additionalProperties === "object") {
          obj = obj.catchall(fromJSONSchema(schema.additionalProperties, childOpts));
        }
        result = obj;
      } else if (typeof schema.additionalProperties === "object") {
        result = record(fromJSONSchema(schema.additionalProperties, childOpts));
      } else {
        result = record(unknown());
      }
      break;
    }
    default:
      if (schema.properties) {
        return fromJSONSchema({ ...schema, type: "object" }, childOpts);
      }
      result = unknown();
  }
  if (schema.default !== void 0) {
    result = new InputFyDefault({
      innerType: result,
      defaultValue: () => schema.default,
      typeName: "InputFyDefault"
    });
  }
  if (isNullable && primaryType !== "null") {
    result = new InputFyNullable({ innerType: result, typeName: "InputFyNullable" });
  }
  if (schema.description) {
    result = result.describe(schema.description);
  }
  return result;
}
function fromJSONSchema(schema, options = {}) {
  return fromJSONSchemaCore(schema, options);
}

export {
  fromJSONSchema
};
