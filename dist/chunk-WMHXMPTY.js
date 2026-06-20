import {
  fromJSONSchema
} from "./chunk-ITLS53EZ.js";
import {
  aggregateBySeverity,
  countBySeverity,
  formatErrorHTML,
  issueCodeErrorMap
} from "./chunk-QF4SUL76.js";
import {
  cachedCompile,
  cachedParse,
  compile,
  configureObservability,
  createHealthCheck,
  createHealthCheckHandler,
  createInMemoryTracerProvider,
  createLazyRegistry,
  createNDJSONValidator,
  createObservedSchema,
  createSchemaAnalytics,
  createSchemaCache,
  createSchemaRegistry,
  createValidationMetrics,
  createValidationWorkerPool,
  defaultAnalytics,
  defaultLazyRegistry,
  defaultMetrics,
  defaultSchemaRegistry,
  deferred,
  formatBenchmarkTable,
  getObservabilityConfig,
  inputfySchemaSignature,
  isCompilable,
  isObservabilityEnabled,
  isWorkerThreadsAvailable,
  observedParse,
  observedSafeParse,
  parseNDJSONLine,
  resetObservabilityConfig,
  runBenchmark,
  schemaFingerprint,
  secureParse,
  secureParseAsync,
  signSchema,
  signedSchema,
  toJSONSchema,
  toOpenAPISchema,
  validateNDJSON,
  validateNDJSONStream,
  withValidationSpan
} from "./chunk-CTLNOXDZ.js";
import {
  detectSuspiciousPatterns,
  sanitizeInput
} from "./chunk-5B6MYZKF.js";
import {
  unwrapSchema
} from "./chunk-PTOGCD6L.js";
import {
  IPV4_REGEX,
  ISO_DATETIME_REGEX,
  ISO_DATE_REGEX,
  ISO_TIME_REGEX,
  InputFyAny,
  InputFyArray,
  InputFyBigInt,
  InputFyBoolean,
  InputFyCustom,
  InputFyDate,
  InputFyEnum,
  InputFyInstanceof,
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
  InputFyType,
  InputFyUndefined,
  InputFyUnknown,
  InputFyVoid,
  _function,
  analyzeRegex,
  array,
  assertSafeRegex,
  configureSecurity,
  createRefinementSandbox,
  discriminatedUnion,
  getSecurityConfig,
  intersection,
  isRegexSafe,
  lazy,
  looseObject,
  map,
  object,
  parseInner,
  pipeline,
  preprocess,
  promise,
  record,
  resetSecurityConfig,
  securityConfig,
  set,
  strictObject,
  testRegexSafe,
  tuple,
  union
} from "./chunk-NGXKC4QO.js";
import {
  addIssue,
  childContext,
  config,
  createParseContext,
  getLocale,
  setLocale
} from "./chunk-E7G4F2VH.js";

// src/advanced/cross-field.ts
var InputFyCrossField = class _InputFyCrossField extends InputFyType {
  _def;
  constructor(innerType, rules) {
    super();
    this._def = { typeName: "InputFyCrossField", innerType, rules };
  }
  _parse(ctx) {
    const result = parseInner(this._def.innerType, ctx);
    if (ctx.common.issues.length > 0) return result;
    const data = typeof result === "object" && result !== null ? result : ctx.data;
    for (const rule of this._def.rules) {
      if (!rule.check(data)) {
        addIssue(ctx, {
          code: "custom",
          message: rule.message,
          path: rule.fields.length === 1 ? [...ctx.path, rule.fields[0]] : ctx.path
        });
      }
    }
    return result;
  }
  _clone() {
    return new _InputFyCrossField(this._def.innerType, [...this._def.rules]);
  }
  addRule(rule) {
    const c = this._clone();
    c._def.rules.push(rule);
    return c;
  }
};
function crossField(schema, rules) {
  return new InputFyCrossField(schema, rules);
}
var crossFieldRules = {
  equals(fieldA, fieldB, message) {
    return {
      fields: [fieldA, fieldB],
      check: (data) => data[fieldA] === data[fieldB],
      message: message ?? `${fieldA} must match ${fieldB}`
    };
  },
  requiredTogether(fields, message) {
    return {
      fields,
      check: (data) => {
        const present = fields.filter((f) => data[f] !== void 0 && data[f] !== null);
        return present.length === 0 || present.length === fields.length;
      },
      message: message ?? `Fields ${fields.join(", ")} must all be present or all absent`
    };
  },
  atLeastOne(fields, message) {
    return {
      fields,
      check: (data) => fields.some((f) => data[f] !== void 0 && data[f] !== null && data[f] !== ""),
      message: message ?? `At least one of ${fields.join(", ")} is required`
    };
  },
  custom(fields, check, message) {
    return { fields, check, message };
  }
};

// src/dx/meta.ts
var MetadataRegistry = class {
  entries = /* @__PURE__ */ new Map();
  register(id, schema, metadata = {}) {
    const merged = {
      ...getSchemaMetadata(schema),
      ...metadata,
      id
    };
    this.entries.set(id, { schema, metadata: merged });
  }
  get(id) {
    return this.entries.get(id)?.metadata;
  }
  getSchema(id) {
    return this.entries.get(id)?.schema;
  }
  list() {
    return [...this.entries.entries()].map(([id, e]) => ({ id, metadata: e.metadata }));
  }
  clear(id) {
    if (id) this.entries.delete(id);
    else this.entries.clear();
  }
};
var defaultMetadataRegistry = new MetadataRegistry();
function getSchemaMetadata(schema) {
  const def = schema._def;
  const meta = { ...def.metadata ?? {} };
  if (def.description) meta["description"] = def.description;
  return meta;
}
var proto = InputFyType.prototype;
proto.meta = function(metadata) {
  const cloned = this._clone();
  cloned._def = {
    ...cloned._def,
    metadata: { ...cloned._def.metadata ?? {}, ...metadata }
  };
  return cloned;
};
proto.getMeta = function() {
  return getSchemaMetadata(this);
};

// src/typescript/deep.ts
function unwrapOptional(schema) {
  const typeName = schema._def.typeName;
  if (typeName === "InputFyOptional") {
    return { inner: schema._def.innerType, wasOptional: true };
  }
  if (typeName === "InputFyDefault") {
    return { inner: schema._def.innerType, wasOptional: true };
  }
  return { inner: schema, wasOptional: false };
}
function cloneObjectShape(obj, shape) {
  return new InputFyObject(shape, {
    unknownKeys: obj._def.unknownKeys,
    catchall: obj._def.catchall
  });
}
function deepPartialSchema(schema) {
  const typeName = schema._def.typeName;
  switch (typeName) {
    case "InputFyOptional":
    case "InputFyDefault":
      return deepPartialSchema(schema._def.innerType).optional();
    case "InputFyNullable":
      return deepPartialSchema(schema._def.innerType).nullable().optional();
    case "InputFyReadonly":
      return deepPartialSchema(schema._def.innerType).readonly().optional();
    case "InputFyCatch":
      return deepPartialSchema(schema._def.innerType).optional();
    case "InputFyObject": {
      const obj = schema;
      const shape = obj._def.shape();
      const newShape = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        newShape[key] = deepPartialSchema(field).optional();
      }
      return cloneObjectShape(obj, newShape);
    }
    case "InputFyArray": {
      const arr = schema;
      return new InputFyArray(deepPartialSchema(arr._def.type)).optional();
    }
    default:
      return schema.optional();
  }
}
function deepRequiredSchema(schema) {
  const { inner, wasOptional } = unwrapOptional(schema);
  const typeName = inner._def.typeName;
  switch (typeName) {
    case "InputFyNullable": {
      const nullable = inner;
      return deepRequiredSchema(nullable._def.innerType).nullable();
    }
    case "InputFyReadonly":
      return deepRequiredSchema(inner._def.innerType).readonly();
    case "InputFyObject": {
      const obj = inner;
      const shape = obj._def.shape();
      const newShape = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        newShape[key] = deepRequiredSchema(field);
      }
      return cloneObjectShape(obj, newShape);
    }
    case "InputFyArray": {
      const arr = inner;
      return new InputFyArray(deepRequiredSchema(arr._def.type));
    }
    default:
      return wasOptional ? inner : schema;
  }
}
function deepPartial(schema) {
  return deepPartialSchema(schema);
}
function deepRequired(schema) {
  return deepRequiredSchema(schema);
}

// src/typescript/pipeline-types.ts
function schemaInput(schema) {
  return void 0;
}
function schemaOutput(schema) {
  return void 0;
}
function strictSplit(schema) {
  return {
    input: void 0,
    output: void 0
  };
}
function parsePipelineInput(pipeline2, data) {
  const inSchema = pipeline2._def.in;
  return inSchema.parse(data);
}
function parsePipelineIntermediate(pipeline2, data) {
  const ctx = createParseContext(data);
  const result = parseInner(pipeline2._def.in, ctx);
  if (ctx.common.issues.length > 0) {
    throw pipeline2._def.in.parse(data);
  }
  return result;
}
function parsePipelineOutput(pipeline2, data) {
  return pipeline2.parse(data);
}
function getPipelineSchemas(pipeline2) {
  return { input: pipeline2._def.in, output: pipeline2._def.out };
}

// src/interop/codec.ts
var InputFyCodec = class _InputFyCodec extends InputFyType {
  _def;
  constructor(encodedSchema, decodedSchema, handlers) {
    super();
    this._def = {
      typeName: "InputFyCodec",
      encodedSchema,
      decodedSchema,
      handlers
    };
  }
  _parse(ctx) {
    const encoded = parseInner(this._def.encodedSchema, ctx, ctx.data);
    if (ctx.common.issues.length > 0) {
      return encoded;
    }
    try {
      return this._def.handlers.decode(encoded);
    } catch (err) {
      ctx.common.issues.push({
        code: "custom",
        path: ctx.path,
        message: err instanceof Error ? err.message : "Codec decode failed"
      });
      return encoded;
    }
  }
  encode(value) {
    const domainResult = this._def.decodedSchema.safeParse(value);
    if (!domainResult.success) throw domainResult.error;
    const encoded = this._def.handlers.encode(domainResult.data);
    const wireResult = this._def.encodedSchema.safeParse(encoded);
    if (!wireResult.success) throw wireResult.error;
    return wireResult.data;
  }
  decode(value) {
    return this.parse(value);
  }
  get encodedSchema() {
    return this._def.encodedSchema;
  }
  get decodedSchema() {
    return this._def.decodedSchema;
  }
  _clone() {
    return new _InputFyCodec(
      this._def.encodedSchema,
      this._def.decodedSchema,
      this._def.handlers
    );
  }
};
function codec(encodedSchema, decodedSchema, handlers) {
  return new InputFyCodec(encodedSchema, decodedSchema, handlers);
}

// src/interop/to-openapi.ts
function isInputFySchema(value) {
  return typeof value === "object" && value !== null && "_def" in value && typeof value._def === "object";
}
function resolveSchemaInOperation(schema, target) {
  if (!schema) return void 0;
  if (isInputFySchema(schema)) return toOpenAPISchema(schema, { target });
  return schema;
}
function transformMediaContent(content, target) {
  if (!content) return content;
  const result = {};
  for (const [mime, media] of Object.entries(content)) {
    const resolved = resolveSchemaInOperation(media.schema, target);
    const entry = { ...media };
    if (resolved !== void 0) entry.schema = resolved;
    else delete entry.schema;
    result[mime] = entry;
  }
  return result;
}
function transformOperation(operation, target) {
  const transformed = {
    ...operation,
    responses: {}
  };
  if (operation.parameters) {
    transformed.parameters = operation.parameters.map((param) => {
      const resolved = resolveSchemaInOperation(param.schema, target);
      const entry = { ...param };
      if (resolved !== void 0) entry.schema = resolved;
      else delete entry.schema;
      return entry;
    });
  }
  if (operation.requestBody) {
    transformed.requestBody = {
      ...operation.requestBody,
      content: transformMediaContent(operation.requestBody.content, target)
    };
  }
  for (const [code, response] of Object.entries(operation.responses)) {
    const content = transformMediaContent(response.content, target);
    const entry = { ...response };
    if (content !== void 0) entry.content = content;
    else delete entry.content;
    transformed.responses[code] = entry;
  }
  return transformed;
}
function toOpenAPI(config2) {
  const version = config2.version ?? "3.1.0";
  const target = version === "3.0.3" ? "openapi-3.0" : "openapi-3.1";
  const componentSchemas = {};
  if (config2.schemas) {
    for (const [name, schema] of Object.entries(config2.schemas)) {
      componentSchemas[name] = toOpenAPISchema(schema, { target });
    }
  }
  const paths = {};
  for (const [path, item] of Object.entries(config2.paths)) {
    paths[path] = {};
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const operation = item[method];
      if (operation) paths[path][method] = transformOperation(operation, target);
    }
  }
  const doc = {
    openapi: version,
    info: config2.info,
    paths
  };
  if (Object.keys(componentSchemas).length > 0) {
    doc.components = { schemas: componentSchemas };
  }
  if (config2.tags) doc.tags = config2.tags;
  return doc;
}
function openAPIToJSON(doc, pretty = true) {
  return JSON.stringify(doc, null, pretty ? 2 : void 0);
}
function openAPIToYAML(doc) {
  return jsonToYaml(doc);
}
function jsonToYaml(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null || value === void 0) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/[:#\n\r\t]|^[\s-]/.test(value)) return JSON.stringify(value);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((item) => {
      const rendered = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return `${pad}-
${rendered.split("\n").map((l) => `  ${l}`).join("\n")}`;
      }
      return `${pad}- ${rendered}`;
    }).join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return `${pad}${safeKey}:
${jsonToYaml(val, indent + 1)}`;
      }
      return `${pad}${safeKey}: ${jsonToYaml(val, 0)}`;
    }).join("\n");
  }
  return String(value);
}

// src/interop/to-graphql.ts
function schemaToGraphQLType(schema) {
  const { schema: inner, nullable } = unwrapSchema(schema);
  const typeNameInner = inner._def.typeName;
  let gqlType;
  switch (typeNameInner) {
    case "InputFyString":
      gqlType = "String";
      break;
    case "InputFyNumber":
    case "InputFyNaN": {
      const checks = inner._def.checks ?? [];
      gqlType = checks.some((c) => c.kind === "int") ? "Int" : "Float";
      break;
    }
    case "InputFyBoolean":
      gqlType = "Boolean";
      break;
    case "InputFyBigInt":
    case "InputFyDate":
      gqlType = "String";
      break;
    case "InputFyLiteral": {
      const value = inner._def.value;
      gqlType = typeof value === "string" ? "String" : typeof value === "number" ? "Int" : "Boolean";
      break;
    }
    case "InputFyEnum":
      gqlType = "String";
      break;
    case "InputFyArray": {
      const element = inner._def.type;
      gqlType = `[${schemaToGraphQLType(element)}]`;
      break;
    }
    case "InputFyObject":
      gqlType = "JSON";
      break;
    default:
      gqlType = "String";
  }
  if (!nullable) return `${gqlType}!`;
  return gqlType;
}
function generateEnumDefinition(name, schema) {
  const { schema: inner } = unwrapSchema(schema);
  const values = inner._def.values;
  const lines = values.map((v2) => `  ${v2.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`);
  return `enum ${name} {
${lines.join("\n")}
}`;
}
function generateObjectDefinition(name, schema, isInput) {
  const { schema: inner } = unwrapSchema(schema);
  const def = inner._def;
  const shape = def.shape();
  const keyword = isInput ? "input" : "type";
  const fields = Object.entries(shape).map(([fieldName, fieldSchema]) => {
    return `  ${fieldName}: ${schemaToGraphQLType(fieldSchema)}`;
  });
  return `${keyword} ${name} {
${fields.join("\n")}
}`;
}
function isOperationDef(value) {
  return typeof value === "object" && value !== null && "returns" in value;
}
function toGraphQLSDL(config2) {
  const parts = [];
  if (config2.description) {
    parts.push(`"""${config2.description}"""`);
  }
  if (config2.enums) {
    for (const [name, schema] of Object.entries(config2.enums)) {
      parts.push(generateEnumDefinition(name, schema));
    }
  }
  if (config2.types) {
    for (const [name, schema] of Object.entries(config2.types)) {
      const { schema: inner } = unwrapSchema(schema);
      if (inner._def.typeName === "InputFyEnum") {
        parts.push(generateEnumDefinition(name, schema));
      } else {
        parts.push(generateObjectDefinition(name, schema, false));
      }
    }
  }
  if (config2.inputs) {
    for (const [name, schema] of Object.entries(config2.inputs)) {
      parts.push(generateObjectDefinition(name, schema, true));
    }
  }
  const queryFields = [];
  if (config2.queries) {
    for (const [name, def] of Object.entries(config2.queries)) {
      if (isOperationDef(def)) {
        const args = def.args ? `(${Object.entries(def.args).map(([argName, argSchema]) => `${argName}: ${schemaToGraphQLType(argSchema)}`).join(", ")})` : "";
        queryFields.push(`  ${name}${args}: ${schemaToGraphQLType(def.returns)}`);
      } else {
        queryFields.push(`  ${name}: ${schemaToGraphQLType(def)}`);
      }
    }
  }
  const mutationFields = [];
  if (config2.mutations) {
    for (const [name, def] of Object.entries(config2.mutations)) {
      if (isOperationDef(def)) {
        const args = def.args ? `(${Object.entries(def.args).map(([argName, argSchema]) => `${argName}: ${schemaToGraphQLType(argSchema)}`).join(", ")})` : "";
        mutationFields.push(`  ${name}${args}: ${schemaToGraphQLType(def.returns)}`);
      } else {
        mutationFields.push(`  ${name}: ${schemaToGraphQLType(def)}`);
      }
    }
  }
  if (queryFields.length > 0) {
    parts.push(`type Query {
${queryFields.join("\n")}
}`);
  }
  if (mutationFields.length > 0) {
    parts.push(`type Mutation {
${mutationFields.join("\n")}
}`);
  }
  if (!config2.queries && !config2.mutations && queryFields.length === 0) {
    parts.push("type Query {\n  _empty: String\n}");
  }
  return parts.join("\n\n") + "\n";
}
function schemaToGraphQLTypeDef(name, schema, isInput = false) {
  const { schema: inner } = unwrapSchema(schema);
  if (inner._def.typeName === "InputFyEnum") {
    return generateEnumDefinition(name, schema);
  }
  return generateObjectDefinition(name, schema, isInput);
}

// src/advanced/validators.ts
var ISO_DURATION_REGEX = /^P(?!$)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(?:\.\d+)?S)?)?$/;
var HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
var RGB_REGEX = /^rgb\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/;
var RGBA_REGEX = /^rgba\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(0|1|0?\.\d+)\s*\)$/;
var HSL_REGEX = /^hsl\(\s*(360|3[0-5]\d|[12]?\d?\d)\s*,\s*(100|\d{1,2})%\s*,\s*(100|\d{1,2})%\s*\)$/;
var HSLA_REGEX = /^hsla\(\s*(360|3[0-5]\d|[12]?\d?\d)\s*,\s*(100|\d{1,2})%\s*,\s*(100|\d{1,2})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;
var CIDR_V4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\/(3[0-2]|[12]?\d)$/;
var CIDR_V6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)\/(12[0-8]|1[01]\d|\d{1,2})$/;
var ISO4217_CODES = /* @__PURE__ */ new Set([
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "GBP",
  "GEL",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "IQD",
  "IRR",
  "ISK",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KMF",
  "KPW",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "QAR",
  "RON",
  "RSD",
  "RUB",
  "RWF",
  "SAR",
  "SBD",
  "SCR",
  "SDG",
  "SEK",
  "SGD",
  "SHP",
  "SLE",
  "SOS",
  "SRD",
  "SSP",
  "STN",
  "SYP",
  "SZL",
  "THB",
  "TJS",
  "TMT",
  "TND",
  "TOP",
  "TRY",
  "TTD",
  "TWD",
  "TZS",
  "UAH",
  "UGX",
  "USD",
  "UYU",
  "UZS",
  "VES",
  "VND",
  "VUV",
  "WST",
  "XAF",
  "XCD",
  "XOF",
  "XPF",
  "YER",
  "ZAR",
  "ZMW",
  "ZWL"
]);
function isValidIsoDate(value) {
  if (!testRegexSafe(ISO_DATE_REGEX, value)) return false;
  const parts = value.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function isValidIsoTime(value) {
  if (!testRegexSafe(ISO_TIME_REGEX, value)) return false;
  const parts = value.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = parts[2] !== void 0 ? Number(parts[2].split(".")[0]) : 0;
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
}
function isValidIsoDatetime(value) {
  if (!testRegexSafe(ISO_DATETIME_REGEX, value)) return false;
  const datePart = value.split("T")[0];
  return isValidIsoDate(datePart);
}
function isValidIsoDuration(value) {
  return testRegexSafe(ISO_DURATION_REGEX, value);
}
function isValidIpv4(value) {
  if (!testRegexSafe(IPV4_REGEX, value)) return false;
  const parts = value.split(".").map(Number);
  return parts.every((p) => p >= 0 && p <= 255);
}
function isValidIpv6(value) {
  if (value === "::" || value === "::1") return true;
  if (!/^[0-9a-fA-F:]+$/.test(value) || value.length > 45) return false;
  const sides = value.split("::");
  if (sides.length > 2) return false;
  const countGroups = (part) => {
    if (!part) return 0;
    const groups = part.split(":");
    return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g)) ? groups.length : -1;
  };
  if (sides.length === 1) {
    const count = countGroups(sides[0]);
    return count === 8;
  }
  const left = countGroups(sides[0]);
  const right = countGroups(sides[1]);
  if (left < 0 || right < 0) return false;
  return left + right <= 7;
}
function isValidCidrV4(value) {
  if (!testRegexSafe(CIDR_V4_REGEX, value)) return false;
  const [ip, prefix] = value.split("/");
  return isValidIpv4(ip) && Number(prefix) >= 0 && Number(prefix) <= 32;
}
function isValidCidrV6(value) {
  if (!testRegexSafe(CIDR_V6_REGEX, value)) return false;
  const [ip, prefix] = value.split("/");
  return isValidIpv6(ip) && Number(prefix) >= 0 && Number(prefix) <= 128;
}
function isValidHexColor(value) {
  return testRegexSafe(HEX_COLOR_REGEX, value);
}
function isValidRgb(value) {
  return testRegexSafe(RGB_REGEX, value) || testRegexSafe(RGBA_REGEX, value);
}
function isValidHsl(value) {
  return testRegexSafe(HSL_REGEX, value) || testRegexSafe(HSLA_REGEX, value);
}
function hasValidDecimalPlaces(value, decimals) {
  if (!Number.isFinite(value)) return false;
  const str = String(value);
  const dotIndex = str.indexOf(".");
  if (dotIndex === -1) return true;
  const fractional = str.slice(dotIndex + 1);
  if (fractional.length > decimals) return false;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor === value;
}
function hasValidDecimalPlacesFromString(amountStr, decimals) {
  const dotIndex = amountStr.indexOf(".");
  if (dotIndex === -1) return true;
  return amountStr.slice(dotIndex + 1).length <= decimals;
}
function isValidCurrencyAmount(value, options = {}) {
  const decimals = options.decimals ?? 2;
  if (typeof value === "number") {
    return hasValidDecimalPlaces(value, decimals);
  }
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const currencyPattern = options.code ? new RegExp(`^${options.code}\\s+(-?\\d+(?:\\.\\d+)?)$`) : new RegExp(`^([A-Z]{3})\\s+(-?\\d+(?:\\.\\d+)?)$`);
  const match = trimmed.match(currencyPattern);
  if (!match) {
    const numOnly = /^-?\d+(\.\d+)?$/.test(trimmed);
    if (!numOnly) return false;
    const num = Number(trimmed);
    return hasValidDecimalPlaces(num, decimals);
  }
  const code = options.code ?? match[1];
  const amountStr = options.code ? match[1] : match[2];
  if (!ISO4217_CODES.has(code)) return false;
  return hasValidDecimalPlacesFromString(amountStr, decimals);
}
function isFileLike(value) {
  if (typeof value !== "object" || value === null) return false;
  const obj = value;
  return typeof obj["name"] === "string" && typeof obj["size"] === "number" && typeof obj["type"] === "string";
}
function isValidFile(value, options = {}) {
  if (!isFileLike(value)) return false;
  if (options.maxSize !== void 0 && value.size > options.maxSize) return false;
  if (options.mimeTypes && options.mimeTypes.length > 0) {
    const ok = options.mimeTypes.some(
      (mime) => value.type === mime || mime.endsWith("/*") && value.type.startsWith(mime.slice(0, -1))
    );
    if (!ok) return false;
  }
  if (options.extensions && options.extensions.length > 0) {
    const ext = value.name.includes(".") ? `.${value.name.split(".").pop().toLowerCase()}` : "";
    const normalized = options.extensions.map((e) => e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`);
    if (!normalized.includes(ext)) return false;
  }
  return true;
}

// src/advanced/formats.ts
function isoString(validator, message, description) {
  return new InputFyString({ typeName: "InputFyString", checks: [] }).refine((val) => validator(val), message).describe(description);
}
var iso = {
  date: (message) => isoString(isValidIsoDate, message ?? "Invalid ISO 8601 date (YYYY-MM-DD)", "ISO 8601 date"),
  time: (message) => isoString(isValidIsoTime, message ?? "Invalid ISO 8601 time (HH:MM:SS)", "ISO 8601 time"),
  datetime: (message) => isoString(
    isValidIsoDatetime,
    message ?? "Invalid ISO 8601 datetime",
    "ISO 8601 datetime"
  ),
  duration: (message) => isoString(
    isValidIsoDuration,
    message ?? "Invalid ISO 8601 duration (PnYnMnDTnHnMnS)",
    "ISO 8601 duration"
  )
};
function ipv4(message) {
  return isoString(isValidIpv4, message ?? "Invalid IPv4 address", "IPv4");
}
function ipv6(message) {
  return isoString(isValidIpv6, message ?? "Invalid IPv6 address", "IPv6");
}
function cidrv4(message) {
  return isoString(isValidCidrV4, message ?? "Invalid IPv4 CIDR notation", "CIDRv4");
}
function cidrv6(message) {
  return isoString(isValidCidrV6, message ?? "Invalid IPv6 CIDR notation", "CIDRv6");
}
function hexColor(message) {
  return isoString(isValidHexColor, message ?? "Invalid hex color (#RGB, #RRGGBB, #RRGGBBAA)", "hex color");
}
function rgb(message) {
  return isoString(isValidRgb, message ?? "Invalid RGB/RGBA color", "RGB color");
}
function hsl(message) {
  return isoString(isValidHsl, message ?? "Invalid HSL/HSLA color", "HSL color");
}
function currency(options = {}) {
  const { code, decimals = 2, message } = options;
  const msg = message ?? (code ? `Invalid ${code} currency amount (${decimals} decimal places)` : `Invalid currency amount (ISO 4217, ${decimals} decimal places)`);
  const validateOptions = {
    ...code !== void 0 ? { code } : {},
    decimals
  };
  const validate = (val) => isValidCurrencyAmount(val, validateOptions);
  return union([
    new InputFyNumber({ typeName: "InputFyNumber", checks: [] }),
    new InputFyString({ typeName: "InputFyString", checks: [] })
  ]).refine(validate, msg).describe(`currency${code ? `:${code}` : ""}`);
}

// src/advanced/file.ts
var InputFyFile = class _InputFyFile extends InputFyType {
  _def;
  constructor(options = {}) {
    super();
    this._def = { typeName: "InputFyFile", options };
  }
  _parse(ctx) {
    if (!isValidFile(ctx.data, this._def.options)) {
      addIssue(ctx, {
        code: "custom",
        message: this._def.options.message ?? buildFileErrorMessage(this._def.options)
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyFile({ ...this._def.options });
  }
  maxSize(bytes) {
    const c = this._clone();
    c._def.options.maxSize = bytes;
    return c;
  }
  mimeTypes(types) {
    const c = this._clone();
    c._def.options.mimeTypes = types;
    return c;
  }
  extensions(exts) {
    const c = this._clone();
    c._def.options.extensions = exts;
    return c;
  }
};
function buildFileErrorMessage(options) {
  const parts = ["Invalid file"];
  if (options.maxSize) parts.push(`max ${options.maxSize} bytes`);
  if (options.mimeTypes?.length) parts.push(`MIME: ${options.mimeTypes.join(", ")}`);
  if (options.extensions?.length) parts.push(`ext: ${options.extensions.join(", ")}`);
  return parts.join(" \u2014 ");
}
function file(options) {
  return new InputFyFile(options);
}

// src/advanced/when.ts
function matchesCondition(value, condition) {
  if (condition !== null && typeof condition === "object" && "_def" in condition) {
    return condition.safeParse(value).success;
  }
  if (Array.isArray(condition)) {
    return condition.includes(value);
  }
  return value === condition;
}
var InputFyWhen = class _InputFyWhen extends InputFyType {
  _def;
  constructor(refField, options) {
    super();
    this._def = {
      typeName: "InputFyWhen",
      refField,
      is: options.is,
      then: options.then,
      otherwise: options.otherwise
    };
  }
  _parse(ctx) {
    const parent = ctx.parent;
    if (!parent || typeof parent.data !== "object" || parent.data === null) {
      addIssue(ctx, {
        code: "custom",
        message: `when('${this._def.refField}') requires a parent object context`
      });
      return ctx.data;
    }
    const parentObj = parent.data;
    const refValue = parentObj[this._def.refField];
    const activeSchema = matchesCondition(refValue, this._def.is) ? this._def.then : this._def.otherwise ?? this._def.then;
    return parseInner(activeSchema, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyWhen(this._def.refField, {
      is: this._def.is,
      then: this._def.then,
      otherwise: this._def.otherwise
    });
  }
};
function when(refField, options) {
  return new InputFyWhen(refField, options);
}

// src/advanced/context.ts
var InputFyContextual = class _InputFyContextual extends InputFyType {
  _def;
  constructor(factory) {
    super();
    this._def = { typeName: "InputFyContextual", factory };
  }
  _parse(ctx) {
    const innerSchema = this._def.factory(ctx.common.context);
    return parseInner(innerSchema, ctx);
  }
  _clone() {
    return new _InputFyContextual(this._def.factory);
  }
};
function contextual(factory) {
  return new InputFyContextual(factory);
}
function envKey(key, schema) {
  return contextual((ctx) => {
    if (ctx[key] === void 0) {
      return schema.optional();
    }
    return schema;
  });
}

// src/security/csp.ts
var CSP_FRIENDLY = true;
function assertCSPFriendly() {
  if (!CSP_FRIENDLY) {
    throw new Error("InputFy CSP compliance pledge violated");
  }
}
function auditSchemaCSP(schema) {
  const notes = ["InputFy core pipeline uses no eval/Function"];
  const effects = schema._def.effects?.length ?? 0;
  if (effects > 0) {
    notes.push(`${effects} schema effect(s) \u2014 user-defined refinements run in-process`);
  }
  return {
    compliant: true,
    usesEval: false,
    usesFunction: false,
    usesDynamicImport: false,
    notes
  };
}

// src/security/rate-limit.ts
var ValidationRateLimiter = class {
  max;
  windowMs;
  windows = /* @__PURE__ */ new Map();
  constructor(options) {
    this.max = Math.max(1, options.max);
    this.windowMs = Math.max(1, options.windowMs);
  }
  check(key) {
    this.prune();
    const now = Date.now();
    const entry = this.windows.get(key);
    if (!entry || now >= entry.resetAt) {
      return {
        allowed: true,
        remaining: this.max - 1,
        resetAt: now + this.windowMs
      };
    }
    if (entry.count >= this.max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }
    return {
      allowed: true,
      remaining: this.max - entry.count - 1,
      resetAt: entry.resetAt
    };
  }
  consume(key) {
    const result = this.check(key);
    if (!result.allowed) return result;
    const now = Date.now();
    const entry = this.windows.get(key);
    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.max - 1, resetAt };
    }
    entry.count++;
    return {
      allowed: true,
      remaining: Math.max(0, this.max - entry.count),
      resetAt: entry.resetAt
    };
  }
  reset(key) {
    if (key) this.windows.delete(key);
    else this.windows.clear();
  }
  prune() {
    const now = Date.now();
    for (const [key, entry] of this.windows) {
      if (now >= entry.resetAt) this.windows.delete(key);
    }
  }
};
function createRateLimiter(options) {
  return new ValidationRateLimiter(options);
}

// src/security/audit-log.ts
var SecurityAuditLog = class {
  entries = [];
  maxEntries;
  constructor(options = {}) {
    this.maxEntries = options.maxEntries ?? 1e3;
  }
  log(entry) {
    const full = {
      ...entry,
      timestamp: entry.timestamp ?? /* @__PURE__ */ new Date()
    };
    this.entries.push(full);
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }
    return full;
  }
  logInjection(message, pattern, path) {
    return this.log({
      type: "injection_attempt",
      message,
      ...pattern !== void 0 ? { pattern } : {},
      ...path !== void 0 ? { path } : {}
    });
  }
  getEntries(filter) {
    return this.entries.filter((e) => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.since && e.timestamp < filter.since) return false;
      return true;
    });
  }
  clear() {
    this.entries = [];
  }
  get size() {
    return this.entries.length;
  }
};
var defaultAuditLog = new SecurityAuditLog();
function createAuditLog(options) {
  return new SecurityAuditLog(options);
}

// src/dx/generate.ts
function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
function generateString(checks, rng) {
  let base = "lorem ipsum";
  for (const check of checks) {
    if (check.kind === "email") return `user${Math.floor(rng() * 9999)}@example.com`;
    if (check.kind === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
    if (check.kind === "url") return "https://example.com";
    if (check.kind === "min" && typeof check.value === "number") {
      base = base.padEnd(check.value, "x");
    }
    if (check.kind === "max" && typeof check.value === "number") {
      base = base.slice(0, check.value);
    }
    if (check.kind === "length" && typeof check.value === "number") {
      base = "x".repeat(check.value);
    }
  }
  return base;
}
function generateNumber(checks, rng) {
  let min = 0;
  let max = 100;
  let isInt = false;
  for (const check of checks) {
    if (check.kind === "int") isInt = true;
    if (check.kind === "min" && check.value !== void 0) min = check.value;
    if (check.kind === "max" && check.value !== void 0) max = check.value;
    if (check.kind === "positive") min = Math.max(min, 1);
  }
  const val = min + rng() * (max - min);
  return isInt ? Math.floor(val) : Math.round(val * 100) / 100;
}
function generateValue(schema, rng, opts, depth) {
  if (depth > opts.maxDepth) return null;
  const { schema: inner, optional, nullable, defaultValue } = unwrapSchema(schema);
  if (defaultValue !== void 0) return defaultValue;
  if (nullable && rng() > 0.8) return null;
  if (optional && !opts.includeOptional && rng() > 0.5) return void 0;
  const typeName = inner._def.typeName;
  switch (typeName) {
    case "InputFyString":
      return generateString(
        inner._def.checks ?? [],
        rng
      );
    case "InputFyNumber":
    case "InputFyBigInt":
      return generateNumber(
        inner._def.checks ?? [],
        rng
      );
    case "InputFyBoolean":
      return rng() > 0.5;
    case "InputFyLiteral":
      return inner._def.value;
    case "InputFyEnum": {
      const values = inner._def.values;
      return pick(rng, values);
    }
    case "InputFyObject": {
      const shape = inner._def.shape();
      const result = /* @__PURE__ */ Object.create(null);
      for (const [key, fieldSchema] of Object.entries(shape)) {
        const val = generateValue(fieldSchema, rng, opts, depth + 1);
        if (val !== void 0) result[key] = val;
      }
      return result;
    }
    case "InputFyArray": {
      const itemType = inner._def.type;
      const len = 1 + Math.floor(rng() * Math.min(3, opts.maxArrayLength));
      return Array.from({ length: len }, () => generateValue(itemType, rng, opts, depth + 1));
    }
    case "InputFyTuple": {
      const items = inner._def.items;
      return items.map((item) => generateValue(item, rng, opts, depth + 1));
    }
    case "InputFyUnion": {
      const options = inner._def.options;
      return generateValue(pick(rng, options), rng, opts, depth + 1);
    }
    case "InputFyNull":
      return null;
    case "InputFyUndefined":
      return void 0;
    case "InputFyDate":
      return new Date(Date.UTC(2024, 5, 15));
    default:
      return null;
  }
}
function generate(schema, options = {}) {
  const opts = {
    seed: options.seed ?? Date.now(),
    includeOptional: options.includeOptional ?? true,
    maxArrayLength: options.maxArrayLength ?? 3,
    maxDepth: options.maxDepth ?? 16
  };
  const rng = createRng(opts.seed);
  return generateValue(schema, rng, opts, 0);
}
function generateMany(schema, count, options = {}) {
  return Array.from(
    { length: count },
    (_, i) => generate(schema, { ...options, seed: (options.seed ?? 1) + i })
  );
}

// src/dx/schema-diff.ts
function schemaToComparable(schema) {
  return toJSONSchema(schema, { target: "draft-7", metadata: true });
}
function flattenProperties(schema, prefix = "") {
  const map2 = /* @__PURE__ */ new Map();
  if (schema.properties) {
    for (const [key, sub] of Object.entries(schema.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      map2.set(path, sub);
      if (sub.properties) {
        for (const [nested, val] of flattenProperties(sub, path)) {
          map2.set(nested, val);
        }
      }
    }
  }
  return map2;
}
function requiredSet(schema, prefix = "") {
  const set2 = /* @__PURE__ */ new Set();
  const req = schema.required ?? [];
  for (const key of req) {
    const path = prefix ? `${prefix}.${key}` : key;
    set2.add(path);
  }
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const sub = schema.properties[key];
      for (const r of requiredSet(sub, path)) set2.add(r);
    }
  }
  return set2;
}
function typeLabel(schema) {
  if (Array.isArray(schema.type)) return schema.type.join("|");
  if (schema.type) return schema.type;
  if (schema.enum) return `enum(${schema.enum.join("|")})`;
  return "unknown";
}
function pushChange(changes, change) {
  changes.push(change);
}
function diffSchema(left, right) {
  const leftJson = schemaToComparable(left);
  const rightJson = schemaToComparable(right);
  return diffJSONSchema(leftJson, rightJson);
}
function diffJSONSchema(left, right) {
  const all = [];
  const leftProps = flattenProperties(left);
  const rightProps = flattenProperties(right);
  const leftReq = requiredSet(left);
  const rightReq = requiredSet(right);
  for (const [path, lSchema] of leftProps) {
    const rSchema = rightProps.get(path);
    if (!rSchema) {
      pushChange(all, {
        kind: "field_removed",
        severity: leftReq.has(path) ? "breaking" : "warning",
        path,
        message: `Field removed: ${path}`,
        before: typeLabel(lSchema)
      });
      continue;
    }
    const lType = typeLabel(lSchema);
    const rType = typeLabel(rSchema);
    if (lType !== rType) {
      pushChange(all, {
        kind: "type_changed",
        severity: "breaking",
        path,
        message: `Type changed at ${path}: ${lType} \u2192 ${rType}`,
        before: lType,
        after: rType
      });
    }
    if (leftReq.has(path) && !rightReq.has(path)) {
      pushChange(all, {
        kind: "required_removed",
        severity: "warning",
        path,
        message: `Field no longer required: ${path}`
      });
    }
    if (!leftReq.has(path) && rightReq.has(path)) {
      pushChange(all, {
        kind: "required_added",
        severity: "breaking",
        path,
        message: `Field now required: ${path}`
      });
    }
    const lEnum = lSchema.enum ?? [];
    const rEnum = rSchema.enum ?? [];
    if (lEnum.length && rEnum.length) {
      for (const val of lEnum) {
        if (!rEnum.includes(val)) {
          pushChange(all, {
            kind: "enum_value_removed",
            severity: "breaking",
            path,
            message: `Enum value removed at ${path}: ${String(val)}`,
            before: val
          });
        }
      }
      for (const val of rEnum) {
        if (!lEnum.includes(val)) {
          pushChange(all, {
            kind: "enum_value_added",
            severity: "info",
            path,
            message: `Enum value added at ${path}: ${String(val)}`,
            after: val
          });
        }
      }
    }
    if (lSchema.minimum !== void 0 && rSchema.minimum !== void 0 && rSchema.minimum > lSchema.minimum) {
      pushChange(all, {
        kind: "constraint_tightened",
        severity: "breaking",
        path,
        message: `Minimum increased at ${path}: ${lSchema.minimum} \u2192 ${rSchema.minimum}`,
        before: lSchema.minimum,
        after: rSchema.minimum
      });
    }
    if (lSchema.description !== rSchema.description && (lSchema.description || rSchema.description)) {
      pushChange(all, {
        kind: "description_changed",
        severity: "info",
        path,
        message: `Description changed at ${path}`,
        before: lSchema.description,
        after: rSchema.description
      });
    }
  }
  for (const [path, rSchema] of rightProps) {
    if (!leftProps.has(path)) {
      pushChange(all, {
        kind: "field_added",
        severity: rightReq.has(path) ? "warning" : "info",
        path,
        message: `Field added: ${path}`,
        after: typeLabel(rSchema)
      });
    }
  }
  const breaking = all.filter((c) => c.severity === "breaking");
  const warnings = all.filter((c) => c.severity === "warning");
  const info = all.filter((c) => c.severity === "info");
  return {
    breaking,
    warnings,
    info,
    all,
    hasBreakingChanges: breaking.length > 0
  };
}
function formatSchemaDiff(result) {
  const lines = [];
  if (result.breaking.length) {
    lines.push("BREAKING:");
    for (const c of result.breaking) lines.push(`  \u2716 ${c.message}`);
  }
  if (result.warnings.length) {
    lines.push("WARNINGS:");
    for (const c of result.warnings) lines.push(`  \u26A0 ${c.message}`);
  }
  if (result.info.length) {
    lines.push("INFO:");
    for (const c of result.info) lines.push(`  \xB7 ${c.message}`);
  }
  if (lines.length === 0) return "No schema changes detected.";
  return lines.join("\n");
}

// src/dx/migrate-zod.ts
var IMPORT_REPLACEMENTS = [
  [/from\s+['"]zod['"]/g, "from 'inputfy'", "Import: zod \u2192 inputfy"],
  [/import\s+\*\s+as\s+z\s+from\s+['"]zod['"]/g, "import * as v from 'inputfy'", "Namespace import: z \u2192 v"],
  [/import\s+\{\s*z\s*\}\s*from\s+['"]zod['"]/g, "import { v } from 'inputfy'", "Named import: { z } \u2192 { v }"]
];
var API_REPLACEMENTS = [
  [/\bz\.infer</g, "infer<", "Type helper: z.infer \u2192 infer"],
  [/\bz\.input</g, "input<", "Type helper: z.input \u2192 input"],
  [/\bz\.output</g, "output<", "Type helper: z.output \u2192 output"],
  [/\bz\.string\s*\(/g, "v.string(", "API: z.string \u2192 v.string"],
  [/\bz\.number\s*\(/g, "v.number(", "API: z.number \u2192 v.number"],
  [/\bz\.boolean\s*\(/g, "v.boolean(", "API: z.boolean \u2192 v.boolean"],
  [/\bz\.object\s*\(/g, "v.object(", "API: z.object \u2192 v.object"],
  [/\bz\.array\s*\(/g, "v.array(", "API: z.array \u2192 v.array"],
  [/\bz\.enum\s*\(/g, "v.enum(", "API: z.enum \u2192 v.enum"],
  [/\bz\.union\s*\(/g, "v.union(", "API: z.union \u2192 v.union"],
  [/\bz\.literal\s*\(/g, "v.literal(", "API: z.literal \u2192 v.literal"],
  [/\bz\.optional\s*\(/g, "v.optional(", "API: z.optional \u2192 v.optional"],
  [/\bz\.nullable\s*\(/g, "v.nullable(", "API: z.nullable \u2192 v.nullable"],
  [/\bz\.coerce\./g, "v.coerce.", "API: z.coerce \u2192 v.coerce"],
  [/\bz\.preprocess\s*\(/g, "v.preprocess(", "API: z.preprocess \u2192 v.preprocess"],
  [/\bz\.discriminatedUnion\s*\(/g, "v.discriminatedUnion(", "API: discriminatedUnion"],
  [/\bz\.safeParse\s*\(/g, ".safeParse(", "Method: safeParse unchanged on schema"]
];
function migrateZodToInputFy(source) {
  let code = source;
  const changes = [];
  const warnings = [];
  for (const [pattern, replacement, description] of IMPORT_REPLACEMENTS) {
    if (pattern.test(code)) {
      changes.push({ from: pattern.source, to: replacement, description });
      code = code.replace(pattern, replacement);
    }
  }
  for (const [pattern, replacement, description] of API_REPLACEMENTS) {
    const before = code;
    code = code.replace(pattern, replacement);
    if (code !== before) {
      changes.push({ from: pattern.source, to: replacement, description });
    }
  }
  const zStandalone = /\bz\./g;
  if (zStandalone.test(code)) {
    code = code.replace(/\bz\./g, "v.");
    changes.push({ from: "z.", to: "v.", description: "Generic z. \u2192 v." });
  }
  if (/from\s+['"]zod['"]/.test(source) && !/from\s+['"]inputfy['"]/.test(code)) {
    warnings.push("Manual review: some zod imports may remain");
  }
  if (/\bzodResolver\b/.test(code)) {
    warnings.push("@hookform/resolvers/zod \u2192 consider custom inputfy resolver (future @inputfy/react-hook-form)");
  }
  if (/\b\.superRefine\s*\(/.test(code)) {
    warnings.push("superRefine is compatible \u2014 no change needed");
  }
  if (/\b\.transform\s*\(/.test(code)) {
    warnings.push("transform is compatible \u2014 no change needed");
  }
  return { code, changes, warnings };
}
function formatMigrationReport(result) {
  const lines = [`${result.changes.length} transformation(s) applied:`];
  for (const c of result.changes) {
    lines.push(`  \u2022 ${c.description}`);
  }
  if (result.warnings.length) {
    lines.push("", "Warnings:");
    for (const w of result.warnings) lines.push(`  \u26A0 ${w}`);
  }
  return lines.join("\n");
}

// src/dx/playground.ts
function createPlaygroundHTML(options = {}) {
  const title = options.title ?? "InputFy Playground";
  const initialSchema = options.initialSchema ? JSON.stringify(toJSONSchema(options.initialSchema, { target: "draft-7" }), null, 2) : JSON.stringify(
    {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        age: { type: "integer", minimum: 0 }
      },
      required: ["name", "email"]
    },
    null,
    2
  );
  const initialData = JSON.stringify(
    options.initialData ?? { name: "Ana", email: "ana@example.com", age: 30 },
    null,
    2
  );
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    header { padding: 1rem 1.5rem; background: #1e293b; border-bottom: 1px solid #334155; }
    h1 { margin: 0; font-size: 1.25rem; }
    main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; min-height: calc(100vh - 60px); }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; } }
    section { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-size: 0.875rem; color: #94a3b8; font-weight: 600; }
    textarea { flex: 1; min-height: 280px; font-family: ui-monospace, monospace; font-size: 13px;
      background: #1e293b; color: #f1f5f9; border: 1px solid #475569; border-radius: 8px; padding: 0.75rem; resize: vertical; }
    button { background: #3b82f6; color: white; border: none; padding: 0.625rem 1.25rem;
      border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; }
    button:hover { background: #2563eb; }
    #output { min-height: 120px; padding: 1rem; border-radius: 8px; font-family: ui-monospace, monospace;
      font-size: 13px; white-space: pre-wrap; background: #1e293b; border: 1px solid #475569; }
    .success { border-color: #22c55e !important; color: #86efac; }
    .error { border-color: #ef4444 !important; color: #fca5a5; }
  </style>
</head>
<body>
  <header><h1>${escapeHtml(title)}</h1></header>
  <main>
    <section>
      <label for="schema">JSON Schema</label>
      <textarea id="schema">${escapeHtml(initialSchema)}</textarea>
    </section>
    <section>
      <label for="data">Dados JSON</label>
      <textarea id="data">${escapeHtml(initialData)}</textarea>
    </section>
  </main>
  <div style="padding: 0 1rem 1rem;">
    <button id="validate">Validar</button>
    <div id="output" style="margin-top: 1rem;">Clique em Validar para testar o schema contra os dados.</div>
  </div>
  <script type="module">
    import { fromJSONSchema } from '../dist/index.js';

    const schemaEl = document.getElementById('schema');
    const dataEl = document.getElementById('data');
    const outputEl = document.getElementById('output');
    document.getElementById('validate').addEventListener('click', () => {
      outputEl.className = '';
      try {
        const jsonSchema = JSON.parse(schemaEl.value);
        const data = JSON.parse(dataEl.value);
        const schema = fromJSONSchema(jsonSchema);
        const result = schema.safeParse(data);
        if (result.success) {
          outputEl.className = 'success';
          outputEl.textContent = '\u2713 V\xE1lido\\n\\n' + JSON.stringify(result.data, null, 2);
        } else {
          outputEl.className = 'error';
          outputEl.textContent = '\u2716 Inv\xE1lido\\n\\n' + result.error.issues
            .map(i => (i.path.length ? '[' + i.path.join('.') + '] ' : '') + i.message)
            .join('\\n');
        }
      } catch (e) {
        outputEl.className = 'error';
        outputEl.textContent = 'Erro: ' + (e.message || String(e));
      }
    });
  </script>
</body>
</html>`;
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function writePlaygroundFile(path, options) {
  const { writeFile } = await import("fs/promises");
  await writeFile(path, createPlaygroundHTML(options), "utf-8");
}

// src/typescript/brand.ts
function branded(schema, options) {
  const opts = typeof options === "string" ? { brand: options } : options;
  let result = schema.brand();
  if (opts.description) {
    result = result.describe(opts.description);
  }
  for (const constraint of opts.constraints ?? []) {
    result = result.refine(constraint.check, constraint.message);
  }
  return result;
}
function getBrandName(schema) {
  const meta = schema.getMeta?.();
  return meta?.["brand"];
}
function withBrand(schema, brand) {
  const withMeta = schema.meta({ brand });
  return withMeta.brand();
}

// src/typescript/template-literal.ts
function normalizeParts(parts) {
  const segments = [];
  for (const part of parts) {
    if (typeof part === "string") {
      segments.push({ kind: "literal", value: part });
    } else {
      segments.push({ kind: "schema", schema: part });
    }
  }
  return segments;
}
function validateTemplateString(value, segments) {
  let pos = 0;
  for (let i = 0; i < segments.length; i++) {
    const part = segments[i];
    if (part.kind === "literal") {
      if (!value.startsWith(part.value, pos)) return false;
      pos += part.value.length;
      continue;
    }
    const nextLiteral = segments.slice(i + 1).find((s) => s.kind === "literal");
    let segment;
    if (nextLiteral) {
      const idx = value.indexOf(nextLiteral.value, pos);
      if (idx === -1) return false;
      segment = value.slice(pos, idx);
      pos = idx;
    } else {
      segment = value.slice(pos);
      pos = value.length;
    }
    if (!part.schema.safeParse(segment).success) return false;
  }
  return pos === value.length;
}
var InputFyTemplateLiteral = class _InputFyTemplateLiteral extends InputFyType {
  _def;
  constructor(segments) {
    super();
    this._def = { typeName: "InputFyTemplateLiteral", segments };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "string") {
      addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
      return "";
    }
    if (!validateTemplateString(ctx.data, this._def.segments)) {
      addIssue(ctx, {
        code: "invalid_string",
        validation: "regex",
        message: "String does not match template literal pattern"
      });
      return ctx.data;
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyTemplateLiteral(this._def.segments);
  }
};
function templateLiteral(...parts) {
  return new InputFyTemplateLiteral(normalizeParts(parts));
}
function templateLiteralFromParts(parts) {
  return templateLiteral(...parts);
}
function matchTemplateLiteral(value, ...parts) {
  return validateTemplateString(value, normalizeParts(parts));
}

// src/typescript/versioning.ts
var InputFyVersioned = class _InputFyVersioned extends InputFyType {
  _def;
  constructor(versions, options) {
    super();
    this._def = {
      typeName: "InputFyVersioned",
      versions,
      current: options.current,
      versionKey: options.versionKey ?? "__schemaVersion",
      migrate: options.migrate
    };
  }
  get currentVersion() {
    return this._def.current;
  }
  getSchema(version) {
    return this._def.versions[version];
  }
  _parse(ctx) {
    const versionKey = this._def.versionKey;
    let version = this._def.current;
    let payload = ctx.data;
    if (typeof ctx.data === "object" && ctx.data !== null && !Array.isArray(ctx.data)) {
      const record2 = ctx.data;
      if (record2[versionKey] !== void 0) {
        version = String(record2[versionKey]);
        const { [versionKey]: _removed, ...rest } = record2;
        payload = rest;
      }
    }
    const schema = this._def.versions[version];
    if (!schema) {
      addIssue(ctx, {
        code: "custom",
        message: `Unknown schema version: ${String(version)}`
      });
      return payload;
    }
    return parseInner(schema, childContext(ctx, payload));
  }
  _clone() {
    const opts = {
      current: this._def.current,
      versionKey: this._def.versionKey,
      ...this._def.migrate !== void 0 ? { migrate: this._def.migrate } : {}
    };
    return new _InputFyVersioned(this._def.versions, opts);
  }
  /** Parse com versão explícita */
  parseVersion(version, data) {
    const schema = this._def.versions[version];
    if (!schema) {
      throw new Error(`Unknown schema version: ${String(version)}`);
    }
    return schema.parse(data);
  }
};
function versionedSchema(versions, options) {
  if (!versions[options.current]) {
    throw new Error(`Current version "${String(options.current)}" not found in versions map`);
  }
  return new InputFyVersioned(versions, options);
}
function withSchemaVersion(schema, version) {
  return schema.meta({ schemaVersion: version });
}
function getSchemaVersion(schema) {
  const meta = schema.getMeta?.();
  return meta?.["schemaVersion"];
}

// src/advanced/extend-object.ts
InputFyObject.prototype.crossField = function(rules) {
  return crossField(this, rules);
};

// src/typescript/extend.ts
var objectProto = InputFyObject.prototype;
var arrayProto = InputFyArray.prototype;
var pipelineProto = InputFyPipeline.prototype;
if (!objectProto.deepPartial) {
  objectProto.deepPartial = function() {
    return deepPartial(this);
  };
}
if (!objectProto.deepRequired) {
  objectProto.deepRequired = function() {
    return deepRequired(this);
  };
}
if (!arrayProto.deepPartial) {
  arrayProto.deepPartial = function() {
    return deepPartial(this);
  };
}
if (!arrayProto.deepRequired) {
  arrayProto.deepRequired = function() {
    return deepRequired(this);
  };
}
if (!pipelineProto.parseInput) {
  pipelineProto.parseInput = function(data) {
    return parsePipelineInput(this, data);
  };
}
if (!pipelineProto.parseIntermediate) {
  pipelineProto.parseIntermediate = function(data) {
    return parsePipelineIntermediate(this, data);
  };
}
if (!pipelineProto.parseOutput) {
  pipelineProto.parseOutput = function(data) {
    return parsePipelineOutput(this, data);
  };
}
if (!pipelineProto.getPipelineSchemas) {
  pipelineProto.getPipelineSchemas = function() {
    return getPipelineSchemas(this);
  };
}

// src/inputfy.ts
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
  // Primitivos
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
  // Atalhos numéricos
  int: () => _number().int(),
  int32: () => _number().int().min(-2147483648).max(2147483647),
  float32: () => _number(),
  float64: () => _number(),
  // Coerção
  coerce,
  // Complexos
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
  // Literais e enums
  literal: (value) => new InputFyLiteral(value),
  enum: (values) => new InputFyEnum(values),
  nativeEnum: (enumObj) => new InputFyNativeEnum(enumObj),
  // Utilitários
  instanceof: (cls) => new InputFyInstanceof(cls),
  custom: (fn, message) => new InputFyCustom(fn, message),
  // Geração e interoperabilidade
  toJSONSchema,
  toOpenAPISchema,
  fromJSONSchema,
  codec,
  toOpenAPI,
  openAPIToJSON,
  openAPIToYAML,
  toGraphQLSDL,
  schemaToGraphQLTypeDef,
  // Validação avançada
  iso,
  ipv4,
  ipv6,
  cidrv4,
  cidrv6,
  hexColor,
  rgb,
  hsl,
  currency,
  file,
  when,
  crossField,
  crossFieldRules,
  contextual,
  envKey,
  // Erros e i18n
  config,
  setLocale,
  getLocale,
  formatErrorHTML,
  aggregateBySeverity,
  countBySeverity,
  issueCodeErrorMap,
  // Performance e escalabilidade
  compile,
  cachedCompile,
  cachedParse,
  createSchemaCache,
  validateNDJSON,
  validateNDJSONStream,
  parseNDJSONLine,
  createNDJSONValidator,
  createValidationWorkerPool,
  isWorkerThreadsAvailable,
  runBenchmark,
  formatBenchmarkTable,
  lazyRegistry: defaultLazyRegistry,
  createLazyRegistry,
  deferred,
  isCompilable,
  // Segurança reforçada
  securityConfig,
  configureSecurity,
  resetSecurityConfig,
  getSecurityConfig,
  sanitizeInput,
  detectSuspiciousPatterns,
  createRateLimiter,
  createAuditLog,
  defaultAuditLog,
  signSchema,
  inputfySchemaSignature,
  signedSchema,
  schemaFingerprint,
  analyzeRegex,
  assertSafeRegex,
  isRegexSafe,
  assertCSPFriendly,
  auditSchemaCSP,
  CSP_FRIENDLY,
  secureParse,
  secureParseAsync,
  createRefinementSandbox,
  // Developer Experience (DX)
  generate,
  generateMany,
  diffSchema,
  diffJSONSchema,
  formatSchemaDiff,
  migrateZodToInputFy,
  formatMigrationReport,
  metadataRegistry: defaultMetadataRegistry,
  createMetadataRegistry: () => new MetadataRegistry(),
  getSchemaMetadata,
  createPlaygroundHTML,
  writePlaygroundFile,
  // Tipos e TypeScript
  branded,
  withBrand,
  getBrandName,
  templateLiteral,
  templateLiteralFromParts,
  matchTemplateLiteral,
  deepPartial,
  deepRequired,
  versionedSchema,
  withSchemaVersion,
  getSchemaVersion,
  schemaInput,
  schemaOutput,
  strictSplit,
  parsePipelineInput,
  parsePipelineIntermediate,
  parsePipelineOutput,
  getPipelineSchemas,
  // Observabilidade
  observabilityConfig: configureObservability,
  configureObservability,
  getObservabilityConfig,
  resetObservabilityConfig,
  isObservabilityEnabled,
  withValidationSpan,
  createInMemoryTracerProvider,
  createValidationMetrics,
  createSchemaAnalytics,
  defaultMetrics,
  defaultAnalytics,
  defaultSchemaRegistry,
  createSchemaRegistry,
  createHealthCheck,
  createHealthCheckHandler,
  observedSafeParse,
  observedParse,
  createObservedSchema
};
var z = v;
var inputfy_default = v;

export {
  InputFyCrossField,
  crossField,
  crossFieldRules,
  MetadataRegistry,
  defaultMetadataRegistry,
  getSchemaMetadata,
  deepPartial,
  deepRequired,
  schemaInput,
  schemaOutput,
  strictSplit,
  parsePipelineInput,
  parsePipelineIntermediate,
  parsePipelineOutput,
  getPipelineSchemas,
  InputFyCodec,
  codec,
  toOpenAPI,
  openAPIToJSON,
  openAPIToYAML,
  toGraphQLSDL,
  schemaToGraphQLTypeDef,
  iso,
  ipv4,
  ipv6,
  cidrv4,
  cidrv6,
  hexColor,
  rgb,
  hsl,
  currency,
  InputFyFile,
  file,
  InputFyWhen,
  when,
  InputFyContextual,
  contextual,
  envKey,
  CSP_FRIENDLY,
  assertCSPFriendly,
  auditSchemaCSP,
  ValidationRateLimiter,
  createRateLimiter,
  SecurityAuditLog,
  defaultAuditLog,
  createAuditLog,
  generate,
  generateMany,
  diffSchema,
  diffJSONSchema,
  formatSchemaDiff,
  migrateZodToInputFy,
  formatMigrationReport,
  createPlaygroundHTML,
  writePlaygroundFile,
  branded,
  getBrandName,
  withBrand,
  InputFyTemplateLiteral,
  templateLiteral,
  templateLiteralFromParts,
  matchTemplateLiteral,
  InputFyVersioned,
  versionedSchema,
  withSchemaVersion,
  getSchemaVersion,
  v,
  z,
  inputfy_default
};
