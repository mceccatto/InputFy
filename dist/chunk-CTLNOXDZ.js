import {
  applyParanoidMode,
  detectSuspiciousPatterns
} from "./chunk-5B6MYZKF.js";
import {
  assertWalkDepth,
  unwrapSchema
} from "./chunk-PTOGCD6L.js";
import {
  EMAIL_REGEX,
  InputFyType,
  UUID_REGEX,
  getSecurityConfig,
  lazy,
  parseInner,
  testRegexSafe
} from "./chunk-NGXKC4QO.js";
import {
  InputFyError
} from "./chunk-WKU77X7G.js";
import {
  isPromise
} from "./chunk-E7G4F2VH.js";
import {
  __require
} from "./chunk-MCKGQKYU.js";

// src/interop/to-json-schema.ts
function applyNullable(schema, nullable, target) {
  if (!nullable) return schema;
  if (target === "openapi-3.0") {
    return { ...schema, nullable: true };
  }
  const baseType = schema.type;
  if (typeof baseType === "string") {
    return { ...schema, type: [baseType, "null"] };
  }
  if (Array.isArray(baseType) && !baseType.includes("null")) {
    return { ...schema, type: [...baseType, "null"] };
  }
  if (!baseType) {
    return { ...schema, type: ["null"] };
  }
  return schema;
}
function applyMetadata(schema, def, metadata) {
  if (!metadata) return schema;
  const result = { ...schema };
  if (def.description) result.description = def.description;
  return result;
}
function convertStringChecks(checks) {
  const result = { type: "string" };
  for (const check of checks) {
    switch (check.kind) {
      case "min":
        result.minLength = check.value;
        break;
      case "max":
        result.maxLength = check.value;
        break;
      case "length":
        result.minLength = check.value;
        result.maxLength = check.value;
        break;
      case "email":
        result.format = "email";
        break;
      case "url":
        result.format = "uri";
        break;
      case "uuid":
        result.format = "uuid";
        break;
      case "datetime":
        result.format = "date-time";
        break;
      case "regex":
        result.pattern = check.regex.source;
        break;
      default:
        break;
    }
  }
  return result;
}
function convertNumberChecks(checks) {
  const result = { type: "number" };
  let isInt = false;
  for (const check of checks) {
    switch (check.kind) {
      case "int":
        isInt = true;
        break;
      case "min":
        if (check.value !== void 0) {
          if (check.inclusive) result.minimum = check.value;
          else result.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.value !== void 0) {
          if (check.inclusive) result.maximum = check.value;
          else result.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        if (check.value !== void 0) result.multipleOf = check.value;
        break;
      case "positive":
        result.exclusiveMinimum = 0;
        break;
      case "negative":
        result.exclusiveMaximum = 0;
        break;
      case "nonnegative":
        result.minimum = 0;
        break;
      case "nonpositive":
        result.maximum = 0;
        break;
      default:
        break;
    }
  }
  if (isInt) result.type = "integer";
  return result;
}
function convertCore(schema, options) {
  const depth = (options._depth ?? 0) + 1;
  assertWalkDepth(depth);
  const { schema: inner, nullable, defaultValue, readonly } = unwrapSchema(schema);
  const target = options.target ?? "draft-7";
  const typeName = inner._def.typeName;
  let result;
  const childOpts = { ...options, _depth: depth };
  switch (typeName) {
    case "InputFyString": {
      const def = inner._def;
      result = convertStringChecks(def.checks);
      break;
    }
    case "InputFyNumber":
    case "InputFyNaN": {
      const def = inner._def;
      result = convertNumberChecks(def.checks ?? []);
      break;
    }
    case "InputFyBoolean":
      result = { type: "boolean" };
      break;
    case "InputFyBigInt":
      result = { type: "integer", format: "int64" };
      break;
    case "InputFyDate":
      result = { type: "string", format: "date-time" };
      break;
    case "InputFyNull":
      result = { type: "null" };
      break;
    case "InputFyLiteral": {
      const value = inner._def.value;
      result = { const: value };
      break;
    }
    case "InputFyEnum": {
      const values = inner._def.values;
      result = { type: "string", enum: [...values] };
      break;
    }
    case "InputFyNativeEnum": {
      const enumObj = inner._def.enum;
      result = {
        enum: Object.values(enumObj).filter(
          (v) => typeof v === "string" || typeof v === "number"
        )
      };
      break;
    }
    case "InputFyArray": {
      const def = inner._def;
      result = { type: "array", items: toJSONSchema(def.type, childOpts) };
      if (def.minLength !== null) result.minItems = def.minLength;
      if (def.maxLength !== null) result.maxItems = def.maxLength;
      if (def.exactLength !== null) {
        result.minItems = def.exactLength;
        result.maxItems = def.exactLength;
      }
      break;
    }
    case "InputFyObject": {
      const def = inner._def;
      const shape = def.shape();
      const properties = {};
      const required = [];
      for (const [key, fieldSchema] of Object.entries(shape)) {
        properties[key] = toJSONSchema(fieldSchema, childOpts);
        if (!unwrapSchema(fieldSchema).optional) required.push(key);
      }
      result = {
        type: "object",
        properties,
        ...required.length > 0 ? { required } : {},
        additionalProperties: def.unknownKeys === "strict" ? false : def.unknownKeys === "passthrough"
      };
      break;
    }
    case "InputFyTuple": {
      const def = inner._def;
      result = {
        type: "array",
        items: def.items.map((item) => toJSONSchema(item, childOpts)),
        ...def.rest ? { additionalItems: toJSONSchema(def.rest, childOpts) } : {}
      };
      if (!def.rest) result.minItems = def.items.length;
      break;
    }
    case "InputFyUnion": {
      const optionsList = inner._def.options;
      result = { anyOf: optionsList.map((opt) => toJSONSchema(opt, childOpts)) };
      break;
    }
    case "InputFyDiscriminatedUnion": {
      const def = inner._def;
      result = {
        oneOf: def.options.map((opt) => toJSONSchema(opt, childOpts)),
        discriminator: { propertyName: def.discriminator }
      };
      break;
    }
    case "InputFyIntersection": {
      const def = inner._def;
      result = { allOf: [toJSONSchema(def.left, childOpts), toJSONSchema(def.right, childOpts)] };
      break;
    }
    case "InputFyRecord": {
      const def = inner._def;
      result = {
        type: "object",
        additionalProperties: toJSONSchema(def.valueType, childOpts)
      };
      break;
    }
    case "InputFyMap":
    case "InputFySet":
      result = { type: "object", additionalProperties: true };
      break;
    case "InputFyAny":
    case "InputFyUnknown":
      result = {};
      break;
    case "InputFyNever":
      result = { not: {} };
      break;
    case "InputFyCodec": {
      const def = inner._def;
      result = toJSONSchema(def.encodedSchema, childOpts);
      break;
    }
    default:
      result = {};
  }
  result = applyMetadata(result, inner._def, options.metadata ?? true);
  if (defaultValue !== void 0) result.default = defaultValue;
  if (readonly) result.readOnly = true;
  result = applyNullable(result, nullable, target);
  return result;
}
function toJSONSchema(schema, options = {}) {
  const target = options.target ?? "draft-7";
  const result = convertCore(schema, options);
  if (options.definitions && Object.keys(options.definitions).length > 0) {
    if (target === "draft-2020-12" || target === "openapi-3.1") {
      result.$defs = options.definitions;
    } else {
      result.definitions = options.definitions;
    }
  }
  if (target === "draft-7") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  }
  return result;
}
function toOpenAPISchema(schema, options = {}) {
  const target = options.target ?? "openapi-3.1";
  return toJSONSchema(schema, { ...options, target });
}

// src/performance/compile.ts
function runStringCheckFast(value, check) {
  switch (check.kind) {
    case "min":
      return value.length >= check.value;
    case "max":
      return value.length <= check.value;
    case "length":
      return value.length === check.value;
    case "email":
      return testRegexSafe(EMAIL_REGEX, value);
    case "uuid":
      return testRegexSafe(UUID_REGEX, value);
    case "includes":
      return value.includes(check.value);
    case "startsWith":
      return value.startsWith(check.value);
    case "endsWith":
      return value.endsWith(check.value);
    case "regex":
      return testRegexSafe(check.regex, value);
    case "trim":
    case "toLowerCase":
    case "toUpperCase":
      return true;
    default:
      return true;
  }
}
function applyStringTransforms(value, checks) {
  let result = value;
  for (const check of checks) {
    if (check.kind === "trim") result = result.trim();
    if (check.kind === "toLowerCase") result = result.toLowerCase();
    if (check.kind === "toUpperCase") result = result.toUpperCase();
  }
  return result;
}
function hasEffects(schema) {
  return (schema._def.effects?.length ?? 0) > 0;
}
function compileStringFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyString") return null;
  const def = inner._def;
  const checks = def.checks;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "string") return null;
    for (const check of checks) {
      if (["trim", "toLowerCase", "toUpperCase"].includes(check.kind)) continue;
      if (!runStringCheckFast(data, check)) return null;
    }
    return applyStringTransforms(data, checks);
  };
}
function compileNumberFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyNumber") return null;
  const def = inner._def;
  const checks = def.checks;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "number" || Number.isNaN(data)) return null;
    for (const check of checks) {
      if (check.kind === "int" && !Number.isInteger(data)) return null;
      if (check.kind === "min" && check.value !== void 0 && data < check.value) return null;
      if (check.kind === "max" && check.value !== void 0 && data > check.value) return null;
      if (check.kind === "positive" && data <= 0) return null;
      if (check.kind === "negative" && data >= 0) return null;
      if (check.kind === "finite" && !Number.isFinite(data)) return null;
    }
    return data;
  };
}
function compileObjectFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyObject") return null;
  const def = inner._def;
  const shape = def.shape();
  const fieldRunners = Object.entries(shape).map(([key, fieldSchema]) => ({
    key,
    run: compileFastRunner(fieldSchema),
    schema: fieldSchema
  }));
  if (fieldRunners.some((f) => !f.run)) return null;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
    const input = data;
    const result = /* @__PURE__ */ Object.create(null);
    for (const field of fieldRunners) {
      const value = Object.prototype.hasOwnProperty.call(input, field.key) ? input[field.key] : void 0;
      const parsed = field.run(value);
      if (parsed === null) return null;
      result[field.key] = parsed;
    }
    if (def.unknownKeys === "strict") {
      for (const key of Object.keys(input)) {
        if (!(key in shape)) return null;
      }
    } else if (def.unknownKeys === "passthrough") {
      for (const key of Object.keys(input)) {
        if (!(key in shape)) result[key] = input[key];
      }
    }
    return result;
  };
}
function compileEnumFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyEnum") return null;
  const def = inner._def;
  const set = new Set(def.values);
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "string" || !set.has(data)) return null;
    return data;
  };
}
function compileFastRunner(schema) {
  return compileStringFast(schema) ?? compileNumberFast(schema) ?? compileEnumFast(schema) ?? compileObjectFast(schema);
}
function compile(schema, _options = {}) {
  const fastRun = compileFastRunner(schema);
  const validate = (data) => {
    if (fastRun) {
      const result = fastRun(data);
      if (result !== null) {
        return { success: true, data: result };
      }
    }
    return schema.safeParse(data);
  };
  return {
    schema,
    fastPath: fastRun !== null,
    validate,
    validateAsync: (data) => schema.safeParseAsync(data)
  };
}
function isCompilable(schema) {
  return compileFastRunner(schema) !== null;
}

// src/performance/lru-cache.ts
var LRUCache = class {
  maxSize;
  map = /* @__PURE__ */ new Map();
  hits = 0;
  misses = 0;
  constructor(options) {
    this.maxSize = Math.max(1, options.maxSize);
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      this.misses++;
      return void 0;
    }
    this.hits++;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
  has(key) {
    return this.map.has(key);
  }
  delete(key) {
    return this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  stats() {
    return {
      size: this.map.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses
    };
  }
};

// src/performance/schema-cache.ts
var schemaIdCounter = 0;
var schemaIds = /* @__PURE__ */ new WeakMap();
function getSchemaId(schema) {
  let id = schemaIds.get(schema);
  if (!id) {
    id = `schema_${++schemaIdCounter}`;
    schemaIds.set(schema, id);
  }
  return id;
}
function hashData(data) {
  if (data === null || data === void 0) return String(data);
  if (typeof data === "object") {
    try {
      return JSON.stringify(data);
    } catch {
      return `obj_${Object.prototype.toString.call(data)}`;
    }
  }
  return `${typeof data}:${String(data)}`;
}
var SchemaCache = class {
  compiledCache;
  parseCache;
  cacheParseResults;
  constructor(options = {}) {
    this.compiledCache = new LRUCache({ maxSize: options.maxCompiled ?? 128 });
    this.parseCache = new LRUCache({ maxSize: options.maxParseResults ?? 512 });
    this.cacheParseResults = options.cacheParseResults ?? false;
  }
  compile(schema) {
    const key = getSchemaId(schema);
    const cached = this.compiledCache.get(key);
    if (cached) return cached;
    const compiled = compile(schema);
    this.compiledCache.set(key, compiled);
    return compiled;
  }
  parse(schema, data) {
    if (this.cacheParseResults) {
      const key = `${getSchemaId(schema)}:${hashData(data)}`;
      const cached = this.parseCache.get(key);
      if (cached) return cached;
      const result = this.compile(schema).validate(data);
      this.parseCache.set(key, result);
      return result;
    }
    return this.compile(schema).validate(data);
  }
  clear() {
    this.compiledCache.clear();
    this.parseCache.clear();
  }
  stats() {
    return {
      compiled: this.compiledCache.stats(),
      parseResults: this.parseCache.stats()
    };
  }
};
var defaultSchemaCache = new SchemaCache();
function cachedCompile(schema) {
  return defaultSchemaCache.compile(schema);
}
function cachedParse(schema, data) {
  return defaultSchemaCache.parse(schema, data);
}
function createSchemaCache(options) {
  return new SchemaCache(options);
}

// src/performance/stream.ts
function shouldSkipLine(line, skipEmpty) {
  return skipEmpty && line.trim().length === 0;
}
function parseNDJSONLine(schema, line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      success: false,
      error: InputFyError.create([{ code: "custom", path: [], message: "Empty line" }])
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      success: false,
      error: InputFyError.create([{ code: "custom", path: [], message: "Invalid JSON line" }])
    };
  }
  return schema.safeParse(parsed);
}
function validateNDJSON(schema, input, options = {}) {
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  const lines = input.split("\n");
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (shouldSkipLine(raw, skipEmpty)) continue;
    const result = parseNDJSONLine(schema, raw);
    results.push({ line: i + 1, raw, result });
    if (!result.success && onError === "fail") break;
  }
  return results;
}
async function* validateNDJSONStream(schema, source, options = {}) {
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  let buffer = "";
  let lineNumber = 0;
  for await (const chunk of source) {
    buffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      lineNumber++;
      if (shouldSkipLine(part, skipEmpty)) continue;
      const result = parseNDJSONLine(schema, part);
      yield { line: lineNumber, raw: part, result };
      if (!result.success && onError === "fail") return;
    }
  }
  if (buffer.trim()) {
    lineNumber++;
    const result = parseNDJSONLine(schema, buffer);
    yield { line: lineNumber, raw: buffer, result };
  }
}
function createNDJSONValidator(schema, options = {}) {
  const { Transform } = __require("stream");
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  let buffer = "";
  let lineNumber = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, _enc, callback) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        lineNumber++;
        if (shouldSkipLine(line, skipEmpty)) continue;
        const result = parseNDJSONLine(schema, line);
        this.push({ line: lineNumber, raw: line, result });
        if (!result.success && onError === "fail") {
          callback(new Error(`Validation failed at line ${lineNumber}`));
          return;
        }
      }
      callback();
    },
    flush(callback) {
      if (buffer.trim()) {
        lineNumber++;
        const result = parseNDJSONLine(schema, buffer);
        this.push({ line: lineNumber, raw: buffer, result });
        if (!result.success && onError === "fail") {
          callback(new Error(`Validation failed at line ${lineNumber}`));
          return;
        }
      }
      callback();
    }
  });
}

// src/performance/lazy-registry.ts
var InputFyDeferred = class _InputFyDeferred extends InputFyType {
  _def;
  resolved;
  constructor(loader) {
    super();
    this._def = { typeName: "InputFyDeferred", loader };
  }
  async resolve() {
    if (this.resolved) return this.resolved;
    const result = this._def.loader();
    this.resolved = await Promise.resolve(result);
    return this.resolved;
  }
  _parse(ctx) {
    if (this.resolved) {
      return parseInner(this.resolved, ctx);
    }
    if (ctx.common.async) {
      return this.resolve().then((schema) => parseInner(schema, ctx));
    }
    throw new Error(
      "Deferred schema not loaded. Call resolve() first or use safeParseAsync."
    );
  }
  _clone() {
    const cloned = new _InputFyDeferred(this._def.loader);
    if (this.resolved) cloned.resolved = this.resolved;
    return cloned;
  }
};
function deferred(loader) {
  return new InputFyDeferred(loader);
}
var LazySchemaRegistry = class {
  constructor(options = {}) {
    this.options = options;
  }
  options;
  loaders = /* @__PURE__ */ new Map();
  loaded = /* @__PURE__ */ new Map();
  loading = /* @__PURE__ */ new Map();
  register(name, loader) {
    this.loaders.set(name, loader);
    this.loaded.delete(name);
    this.loading.delete(name);
    if (this.options.preload) {
      void this.resolve(name).catch(() => void 0);
    }
  }
  has(name) {
    return this.loaders.has(name);
  }
  async resolve(name) {
    if (this.loaded.has(name)) return this.loaded.get(name);
    if (this.loading.has(name)) return this.loading.get(name);
    const loader = this.loaders.get(name);
    if (!loader) {
      throw new LazyLoadErrorClass(`Schema not registered: ${name}`);
    }
    const promise = Promise.resolve(loader()).then((schema) => {
      this.loaded.set(name, schema);
      this.loading.delete(name);
      return schema;
    });
    this.loading.set(name, promise);
    return promise;
  }
  resolveSync(name) {
    if (this.loaded.has(name)) return this.loaded.get(name);
    const loader = this.loaders.get(name);
    if (!loader) {
      throw new LazyLoadErrorClass(`Schema not registered: ${name}`);
    }
    const schema = loader();
    if (isPromise(schema)) {
      throw new LazyLoadErrorClass(`Schema '${name}' requires async resolve()`);
    }
    this.loaded.set(name, schema);
    return schema;
  }
  /** Retorna InputFyLazy que carrega do registro na primeira validação */
  lazy(name) {
    return lazy(() => this.resolveSync(name));
  }
  /** Retorna InputFyDeferred com carregamento assíncrono */
  deferred(name) {
    return new InputFyDeferred(() => this.resolve(name));
  }
  clear(name) {
    if (name) {
      this.loaders.delete(name);
      this.loaded.delete(name);
      this.loading.delete(name);
      return;
    }
    this.loaders.clear();
    this.loaded.clear();
    this.loading.clear();
  }
  list() {
    return [...this.loaders.keys()];
  }
};
var LazyLoadErrorClass = class extends Error {
  constructor(message) {
    super(message);
    this.name = "LazyLoadError";
  }
};
var defaultLazyRegistry = new LazySchemaRegistry();
function createLazyRegistry(options) {
  return new LazySchemaRegistry(options);
}

// src/performance/worker.ts
import { fileURLToPath } from "url";
import { dirname, join } from "path";
function getWorkerScriptPath() {
  try {
    const { createRequire } = __require("module");
    const req = createRequire(import.meta.url);
    return req.resolve("inputfy/worker-runner");
  } catch {
    const { createRequire } = __require("module");
    const req = createRequire(typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url));
    try {
      return req.resolve("inputfy/worker-runner");
    } catch {
      return join(dirname(fileURLToPath(import.meta.url)), "worker-runner.js");
    }
  }
}
var ValidationWorkerPool = class {
  constructor(jsonSchema, options = {}) {
    this.jsonSchema = jsonSchema;
    const { Worker } = __require("worker_threads");
    const poolSize = options.poolSize ?? 2;
    const workerPath = getWorkerScriptPath();
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerPath, {
        workerData: { jsonSchema: this.jsonSchema }
      });
      worker.on("message", (msg) => {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        if (pending.timer) clearTimeout(pending.timer);
        this.pending.delete(msg.id);
        pending.resolve(msg.result);
        this.processQueue();
      });
      worker.on("error", (err) => {
        for (const [, p] of this.pending) p.reject(err);
        this.pending.clear();
      });
      this.workers.push(worker);
    }
    this.defaultTimeout = options.timeout ?? 3e4;
  }
  jsonSchema;
  workers = [];
  queue = [];
  pending = /* @__PURE__ */ new Map();
  nextId = 0;
  roundRobin = 0;
  terminated = false;
  defaultTimeout;
  validate(data) {
    if (this.terminated) {
      return Promise.reject(new Error("Worker pool terminated"));
    }
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.queue.push({
        id,
        data,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  processQueue() {
    if (this.queue.length === 0 || this.workers.length === 0) return;
    const worker = this.workers[this.roundRobin % this.workers.length];
    this.roundRobin++;
    const job = this.queue.shift();
    if (!job) return;
    const timer = setTimeout(() => {
      this.pending.delete(job.id);
      job.reject(new Error(`Validation timeout for job ${job.id}`));
    }, this.defaultTimeout);
    this.pending.set(job.id, {
      resolve: job.resolve,
      reject: job.reject,
      timer
    });
    worker.postMessage({ id: job.id, data: job.data });
  }
  async validateBatch(items) {
    return Promise.all(items.map((item) => this.validate(item)));
  }
  terminate() {
    this.terminated = true;
    for (const worker of this.workers) {
      void worker.terminate();
    }
    this.workers.length = 0;
    this.queue.length = 0;
    for (const [, p] of this.pending) {
      if (p.timer) clearTimeout(p.timer);
      p.reject(new Error("Worker pool terminated"));
    }
    this.pending.clear();
  }
};
function createValidationWorkerPool(schema, options = {}) {
  const jsonSchema = toJSONSchema(schema, { target: "draft-7" });
  return new ValidationWorkerPool(jsonSchema, { ...options, schema });
}
function isWorkerThreadsAvailable() {
  try {
    __require("worker_threads");
    return true;
  } catch {
    return false;
  }
}

// src/performance/benchmark.ts
function measure(name, library, fn, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const totalMs = performance.now() - start;
  return {
    name,
    library,
    iterations,
    totalMs,
    avgMs: totalMs / iterations,
    opsPerSec: iterations / totalMs * 1e3
  };
}
async function tryImport(moduleName) {
  try {
    return await import(moduleName);
  } catch {
    return null;
  }
}
async function runBenchmark(suites, options = {}) {
  const iterations = options.iterations ?? 1e4;
  const warmup = options.warmup ?? 1e3;
  const libraries = options.libraries ?? ["inputfy", "zod", "yup", "joi"];
  const results = [];
  const zodMod = libraries.includes("zod") ? await tryImport("zod") : null;
  const yupMod = libraries.includes("yup") ? await tryImport("yup") : null;
  const joiMod = libraries.includes("joi") ? await tryImport("joi") : null;
  for (const suite of suites) {
    const samples = suite.samples;
    const compiled = compile(suite.schema);
    for (let i = 0; i < warmup; i++) {
      compiled.validate(samples[i % samples.length]);
    }
    if (libraries.includes("inputfy")) {
      results.push(
        measure(`${suite.name} (safeParse)`, "inputfy", () => {
          suite.schema.safeParse(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
      results.push(
        measure(`${suite.name} (compiled)`, "inputfy-aot", () => {
          compiled.validate(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
    if (zodMod && suite.zodSchema && libraries.includes("zod")) {
      const z = suite.zodSchema;
      for (let i = 0; i < warmup; i++) z.safeParse(samples[i % samples.length]);
      results.push(
        measure(suite.name, "zod", () => {
          z.safeParse(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
    if (yupMod && suite.yupSchema && libraries.includes("yup")) {
      const y = suite.yupSchema;
      for (let i = 0; i < warmup; i++) {
        try {
          y.validateSync(samples[i % samples.length]);
        } catch {
        }
      }
      results.push(
        measure(suite.name, "yup", () => {
          try {
            y.validateSync(samples[Math.floor(Math.random() * samples.length)]);
          } catch {
          }
        }, iterations)
      );
    }
    if (joiMod && suite.joiSchema && libraries.includes("joi")) {
      const j = suite.joiSchema;
      for (let i = 0; i < warmup; i++) j.validate(samples[i % samples.length]);
      results.push(
        measure(suite.name, "joi", () => {
          j.validate(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
  }
  return results;
}
function formatBenchmarkTable(results) {
  const header = "| Suite | Library | ops/sec | avg ms | total ms |";
  const sep = "|---|---|---:|---:|---:|";
  const rows = results.map(
    (r) => `| ${r.name} | ${r.library} | ${Math.round(r.opsPerSec).toLocaleString()} | ${r.avgMs.toFixed(4)} | ${r.totalMs.toFixed(2)} |`
  );
  return [header, sep, ...rows].join("\n");
}
function createDefaultBenchmarkSuites(factory) {
  const UserSchema = factory.object({
    name: factory.string(),
    email: factory.string(),
    age: factory.number()
  });
  const valid = { name: "Ana", email: "ana@test.com", age: 30 };
  const invalid = { name: "", email: "bad", age: -1 };
  const samples = [valid, invalid, { name: "Bob", email: "bob@test.com", age: 25 }];
  return [
    {
      name: "user-object",
      schema: UserSchema,
      samples
    }
  ];
}

// src/security/schema-signature.ts
import { createHmac, timingSafeEqual } from "crypto";
function serializableDef(schema, depth = 0) {
  if (depth > 32) return { typeName: "max_depth" };
  const def = schema._def;
  const base = { typeName: def.typeName };
  if (def.typeName === "InputFyString") {
    const s = def;
    base["checks"] = (s.checks ?? []).map((c) => {
      const check = c;
      if (check.kind === "regex" && check.regex) {
        return { kind: "regex", source: check.regex.source, flags: check.regex.flags };
      }
      return c;
    });
    if (s.coerce) base["coerce"] = true;
  }
  if (def.typeName === "InputFyNumber") {
    base["checks"] = def.checks ?? [];
  }
  if (def.typeName === "InputFyObject") {
    const shape = def.shape();
    base["shape"] = Object.fromEntries(
      Object.entries(shape).map(([k, v]) => [k, serializableDef(v, depth + 1)])
    );
    base["unknownKeys"] = def.unknownKeys;
  }
  if (def.typeName === "InputFyArray") {
    base["type"] = serializableDef(
      def.type,
      depth + 1
    );
  }
  if (def.typeName === "InputFyEnum") {
    base["values"] = def.values;
  }
  if (def.typeName === "InputFyLiteral") {
    base["value"] = def.value;
  }
  if (def.typeName === "InputFyUnion") {
    base["options"] = def.options.map(
      (o) => serializableDef(o, depth + 1)
    );
  }
  if (def.effects?.length) {
    base["effectsCount"] = def.effects.length;
  }
  return base;
}
function schemaFingerprint(schema) {
  const { schema: inner } = unwrapSchema(schema);
  return JSON.stringify(serializableDef(inner));
}
function signSchema(schema, secret) {
  const payload = schemaFingerprint(schema);
  return createHmac("sha256", secret).update(payload).digest("hex");
}
function inputfySchemaSignature(schema, secret, signature) {
  const expected = signSchema(schema, secret);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
var SchemaTamperError = class extends InputFyError {
  constructor() {
    super([{ code: "custom", path: [], message: "Schema integrity check failed (tamper detected)" }]);
    this.name = "SchemaTamperError";
  }
};
function signedSchema(schema, secret, signature) {
  const sig = signature ?? signSchema(schema, secret);
  const assertIntegrity = () => {
    if (!inputfySchemaSignature(schema, secret, sig)) {
      throw new SchemaTamperError();
    }
  };
  return {
    schema,
    signature: sig,
    safeParse(data) {
      assertIntegrity();
      return schema.safeParse(data);
    },
    parse(data) {
      assertIntegrity();
      return schema.parse(data);
    }
  };
}

// src/security/parse-guard.ts
function rateLimitKey(ctx) {
  return ctx?.key;
}
function applySecurityPreParse(data, ctx) {
  const config2 = getSecurityConfig();
  if (!ctx?.skipRateLimit && config2.rateLimiter) {
    const key = rateLimitKey(ctx) ?? "default";
    const result = config2.rateLimiter.consume(key);
    if (!result.allowed) {
      config2.auditLog?.log({
        type: "rate_limit",
        message: `Rate limit exceeded for key: ${key}`,
        key
      });
      return {
        data,
        blocked: true,
        error: InputFyError.create([
          {
            code: "custom",
            path: [],
            message: `Validation rate limit exceeded. Retry after ${new Date(result.resetAt).toISOString()}`
          }
        ])
      };
    }
  }
  if (config2.paranoid && !ctx?.skipParanoid) {
    const paranoid = applyParanoidMode(data, {
      ...config2.paranoidOptions,
      action: config2.paranoidOptions?.action ?? "reject",
      html: config2.paranoidOptions?.html ?? true,
      sql: config2.paranoidOptions?.sql ?? true,
      pathTraversal: config2.paranoidOptions?.pathTraversal ?? true
    });
    if (paranoid.rejected) {
      for (const pattern of paranoid.patterns) {
        config2.auditLog?.logInjection(
          `Suspicious pattern detected: ${pattern.kind}`,
          pattern.match,
          pattern.path ? pattern.path.split(".") : []
        );
      }
      return {
        data,
        blocked: true,
        error: InputFyError.create([
          {
            code: "custom",
            path: [],
            message: `Input rejected by paranoid mode (${paranoid.patterns[0]?.kind ?? "suspicious"})`
          }
        ])
      };
    }
    return { data: paranoid.value, blocked: false };
  }
  return { data, blocked: false };
}
function auditParseFailure(data) {
  const config2 = getSecurityConfig();
  if (!config2.auditLog) return;
  const patterns = detectSuspiciousPatterns(data);
  for (const pattern of patterns) {
    config2.auditLog.logInjection(
      `Validation failed with suspicious input: ${pattern.kind}`,
      pattern.match,
      pattern.path ? pattern.path.split(".") : []
    );
  }
}
function secureParse(schema, data, params) {
  const pre = applySecurityPreParse(data, params?.security);
  if (pre.blocked && pre.error) {
    return { success: false, error: pre.error };
  }
  const result = schema.safeParse(pre.data, params);
  if (!result.success) {
    auditParseFailure(data);
  }
  return result;
}
async function secureParseAsync(schema, data, params) {
  const pre = applySecurityPreParse(data, params?.security);
  if (pre.blocked && pre.error) {
    return { success: false, error: pre.error };
  }
  const result = await schema.safeParseAsync(pre.data, params);
  if (!result.success) {
    auditParseFailure(data);
  }
  return result;
}

// src/observability/config.ts
var config = {
  enabled: false,
  serviceName: "inputfy"
};
function configureObservability(partial) {
  config = { ...config, ...partial };
  return getObservabilityConfig();
}
function getObservabilityConfig() {
  return config;
}
function resetObservabilityConfig() {
  config = { enabled: false, serviceName: "inputfy" };
}
function isObservabilityEnabled() {
  return config.enabled !== false;
}

// src/observability/telemetry.ts
var InMemorySpan = class {
  constructor(name, attributes) {
    this.name = name;
    if (attributes) Object.assign(this.attributes, attributes);
  }
  name;
  attributes = /* @__PURE__ */ Object.create(null);
  status = { code: "OK" };
  ended = false;
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  setStatus(status) {
    this.status = status;
  }
  recordException(error) {
    this.attributes["exception.message"] = error.message;
  }
  end() {
    this.ended = true;
  }
};
var InMemoryTracer = class {
  spans = [];
  startSpan(name, attributes) {
    const span = new InMemorySpan(name, attributes);
    this.spans.push(span);
    return span;
  }
};
var InMemoryTracerProvider = class {
  constructor(tracer = new InMemoryTracer()) {
    this.tracer = tracer;
  }
  tracer;
  getTracer(_name) {
    return this.tracer;
  }
  get spans() {
    return this.tracer.spans;
  }
};
function withValidationSpan(tracer, schemaId, fn, extraAttributes) {
  const span = tracer.startSpan("inputfy.validate", {
    "inputfy.schema_id": schemaId,
    ...extraAttributes
  });
  const start = performance.now();
  try {
    const result = fn();
    const durationMs = performance.now() - start;
    span.setAttribute("inputfy.duration_ms", Math.round(durationMs * 100) / 100);
    if (result && typeof result === "object" && "success" in result) {
      const parsed = result;
      span.setAttribute("inputfy.success", parsed.success);
      if (!parsed.success) {
        span.setStatus({ code: "ERROR", message: "Validation failed" });
        span.setAttribute("inputfy.issue_count", parsed.error?.issues?.length ?? 0);
      } else {
        span.setStatus({ code: "OK" });
      }
    } else {
      span.setStatus({ code: "OK" });
    }
    return result;
  } catch (err) {
    span.setStatus({ code: "ERROR", message: err instanceof Error ? err.message : String(err) });
    span.recordException?.(err instanceof Error ? err : new Error(String(err)));
    throw err;
  } finally {
    span.end();
  }
}
function createInMemoryTracerProvider() {
  return new InMemoryTracerProvider();
}

// src/observability/metrics.ts
function counterKey(labels) {
  return [labels.schema, labels.field ?? "", labels.status ?? "", labels.code ?? ""].join("|");
}
function escapeLabel(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
function formatLabels(labels) {
  const parts = Object.entries(labels).map(
    ([k, v]) => `${k}="${escapeLabel(v)}"`
  );
  return parts.length ? `{${parts.join(",")}}` : "";
}
var ValidationMetrics = class {
  counters = /* @__PURE__ */ new Map();
  recordValidation(schema, success, issues = []) {
    this.increment({ schema, status: success ? "success" : "failure" });
    if (!success) {
      this.increment({ schema, status: "failure", code: "total" });
      for (const issue of issues) {
        const field = issue.path.length ? issue.path.join(".") : "root";
        this.increment({ schema, field, status: "failure", code: issue.code });
      }
    }
  }
  increment(labels, delta = 1) {
    const key = counterKey(labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }
  getCount(labels) {
    return this.counters.get(counterKey(labels)) ?? 0;
  }
  /** Exporta métricas no formato Prometheus text exposition */
  toPrometheus() {
    const lines = [];
    lines.push("# HELP inputfy_validation_total Total validation attempts");
    lines.push("# TYPE inputfy_validation_total counter");
    const validationTotals = /* @__PURE__ */ new Map();
    for (const [key, count] of this.counters) {
      const [schema, field, status, code] = key.split("|");
      if (field || code) continue;
      if (!validationTotals.has(schema)) {
        validationTotals.set(schema, { success: 0, failure: 0 });
      }
      const entry = validationTotals.get(schema);
      if (status === "success") entry.success += count;
      if (status === "failure") entry.failure += count;
    }
    for (const [schema, totals] of validationTotals) {
      lines.push(
        `inputfy_validation_total${formatLabels({ schema, status: "success" })} ${totals.success}`
      );
      lines.push(
        `inputfy_validation_total${formatLabels({ schema, status: "failure" })} ${totals.failure}`
      );
    }
    lines.push("# HELP inputfy_field_failures_total Validation failures by field");
    lines.push("# TYPE inputfy_field_failures_total counter");
    for (const [key, count] of this.counters) {
      const [schema, field, status, code] = key.split("|");
      if (!field || !schema || !code || status !== "failure" || code === "total") continue;
      lines.push(
        `inputfy_field_failures_total${formatLabels({ schema, field, code })} ${count}`
      );
    }
    return lines.join("\n") + "\n";
  }
  reset() {
    this.counters.clear();
  }
};
var defaultMetrics = new ValidationMetrics();
function createValidationMetrics() {
  return new ValidationMetrics();
}
var SchemaAnalytics = class {
  fieldFailures = /* @__PURE__ */ new Map();
  schemaStats = /* @__PURE__ */ new Map();
  recordParse(schema, success, issues = []) {
    const stats = this.schemaStats.get(schema) ?? { total: 0, failures: 0 };
    stats.total += 1;
    if (!success) {
      stats.failures += 1;
      for (const issue of issues) {
        const field = issue.path.length ? issue.path.join(".") : "root";
        const key = `${schema}|${field}`;
        const existing = this.fieldFailures.get(key);
        if (existing) {
          existing.count += 1;
          existing.lastSeen = /* @__PURE__ */ new Date();
        } else {
          this.fieldFailures.set(key, {
            schema,
            field,
            count: 1,
            lastSeen: /* @__PURE__ */ new Date()
          });
        }
      }
    }
    this.schemaStats.set(schema, stats);
  }
  getTopFailingFields(schema, limit = 10) {
    let entries = [...this.fieldFailures.values()];
    if (schema) entries = entries.filter((e) => e.schema === schema);
    return entries.sort((a, b) => b.count - a.count).slice(0, limit);
  }
  getFailureRate(schema) {
    const stats = this.schemaStats.get(schema);
    if (!stats || stats.total === 0) return 0;
    return stats.failures / stats.total;
  }
  getSnapshot(schema) {
    const stats = this.schemaStats.get(schema) ?? { total: 0, failures: 0 };
    return {
      schema,
      totalValidations: stats.total,
      failures: stats.failures,
      failureRate: stats.total ? stats.failures / stats.total : 0,
      topFailingFields: this.getTopFailingFields(schema)
    };
  }
  reset() {
    this.fieldFailures.clear();
    this.schemaStats.clear();
  }
};
var defaultAnalytics = new SchemaAnalytics();
function createSchemaAnalytics() {
  return new SchemaAnalytics();
}

// src/observability/health.ts
var START_TIME = Date.now();
function checkSchemaIntegrity(entry, options = {}) {
  const start = performance.now();
  const name = entry.id;
  try {
    if (!entry.schema || typeof entry.schema.safeParse !== "function") {
      return {
        name,
        status: "fail",
        message: "Invalid schema instance",
        durationMs: performance.now() - start
      };
    }
    const sample = entry.sample ?? options.samples?.[entry.id] ?? inferSample(entry.schema);
    const result = entry.schema.safeParse(sample);
    const durationMs = performance.now() - start;
    if (!result.success && sample !== void 0) {
      return {
        name,
        status: "warn",
        message: `Sample validation failed: ${result.error.issues[0]?.message ?? "unknown"}`,
        durationMs
      };
    }
    if (options.checkFingerprints) {
      try {
        schemaFingerprint(entry.schema);
      } catch {
        return {
          name,
          status: "fail",
          message: "Schema fingerprint computation failed",
          durationMs
        };
      }
    }
    return {
      name,
      status: "pass",
      ...entry.description !== void 0 ? { message: entry.description } : {},
      durationMs
    };
  } catch (err) {
    return {
      name,
      status: "fail",
      message: err instanceof Error ? err.message : String(err),
      durationMs: performance.now() - start
    };
  }
}
function inferSample(schema) {
  const typeName = schema._def.typeName;
  switch (typeName) {
    case "InputFyString": {
      const checks = schema._def.checks ?? [];
      if (checks.some((c) => c.kind === "email")) return "health@example.com";
      if (checks.some((c) => c.kind === "uuid")) return "550e8400-e29b-41d4-a716-446655440000";
      if (checks.some((c) => c.kind === "url")) return "https://example.com";
      return "health-check";
    }
    case "InputFyNumber":
    case "InputFyBigInt":
      return 0;
    case "InputFyBoolean":
      return true;
    case "InputFyObject": {
      const shapeFn = schema._def.shape;
      if (!shapeFn) return {};
      const shape = shapeFn();
      const sample = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        sample[key] = inferSample(field);
      }
      return sample;
    }
    case "InputFyArray":
      return [];
    default:
      return void 0;
  }
}
function createHealthCheck(schemas, options = {}) {
  const entries = Array.isArray(schemas) ? schemas : Object.entries(schemas).map(([id, schema]) => ({ id, schema }));
  const checks = entries.map((entry) => checkSchemaIntegrity(entry, options));
  const hasFail = checks.some((c) => c.status === "fail");
  const hasWarn = checks.some((c) => c.status === "warn");
  return {
    status: hasFail ? "error" : hasWarn ? "degraded" : "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...options.version !== void 0 ? { version: options.version } : {},
    uptimeMs: Date.now() - START_TIME,
    checks
  };
}
function createHealthCheckHandler(schemas, options = {}) {
  return (_req, res) => {
    const result = createHealthCheck(schemas, options);
    const code = result.status === "error" ? 503 : result.status === "degraded" ? 200 : 200;
    res.status(code).json(result);
  };
}
var SchemaRegistry = class {
  schemas = /* @__PURE__ */ new Map();
  register(entry) {
    this.schemas.set(entry.id, entry);
  }
  unregister(id) {
    this.schemas.delete(id);
  }
  list() {
    return [...this.schemas.values()];
  }
  healthCheck(options) {
    return createHealthCheck(this.list(), options);
  }
  handler(options) {
    return createHealthCheckHandler(
      Object.fromEntries([...this.schemas.entries()].map(([id, e]) => [id, e.schema])),
      options
    );
  }
};
var defaultSchemaRegistry = new SchemaRegistry();
function createSchemaRegistry() {
  return new SchemaRegistry();
}

// src/observability/observed-parse.ts
function resolveSchemaId(schema, schemaId) {
  if (schemaId) return schemaId;
  const meta = schema.getMeta?.();
  return meta?.["title"] ?? schema._def.typeName;
}
function recordObservability(schemaId, result) {
  const cfg = getObservabilityConfig();
  const metrics = cfg.metrics ?? defaultMetrics;
  const analytics = cfg.analytics ?? defaultAnalytics;
  const issues = result.success ? [] : result.error.issues;
  metrics.recordValidation(schemaId, result.success, issues);
  analytics.recordParse(schemaId, result.success, issues);
}
function observedSafeParse(schema, data, options = {}) {
  const cfg = getObservabilityConfig();
  const schemaId = resolveSchemaId(schema, options.schemaId ?? cfg.defaultSchemaId);
  const enabled = isObservabilityEnabled();
  const run = () => {
    const result = schema.safeParse(data);
    if (enabled) recordObservability(schemaId, result);
    return result;
  };
  if (!enabled || !cfg.tracer) {
    return run();
  }
  return withValidationSpan(
    cfg.tracer.getTracer(cfg.serviceName ?? "inputfy"),
    schemaId,
    run,
    options.attributes
  );
}
function observedParse(schema, data, options) {
  const result = observedSafeParse(schema, data, options);
  if (result.success) return result.data;
  throw result.error;
}
function createObservedSchema(schema, schemaId) {
  return new Proxy(schema, {
    get(target, prop, receiver) {
      if (prop === "safeParse") {
        return (data) => observedSafeParse(schema, data, { schemaId });
      }
      if (prop === "parse") {
        return (data) => observedParse(schema, data, { schemaId });
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

export {
  toJSONSchema,
  toOpenAPISchema,
  compile,
  isCompilable,
  SchemaCache,
  defaultSchemaCache,
  cachedCompile,
  cachedParse,
  createSchemaCache,
  parseNDJSONLine,
  validateNDJSON,
  validateNDJSONStream,
  createNDJSONValidator,
  InputFyDeferred,
  deferred,
  defaultLazyRegistry,
  createLazyRegistry,
  ValidationWorkerPool,
  createValidationWorkerPool,
  isWorkerThreadsAvailable,
  runBenchmark,
  formatBenchmarkTable,
  createDefaultBenchmarkSuites,
  schemaFingerprint,
  signSchema,
  inputfySchemaSignature,
  SchemaTamperError,
  signedSchema,
  secureParse,
  secureParseAsync,
  configureObservability,
  getObservabilityConfig,
  resetObservabilityConfig,
  isObservabilityEnabled,
  InMemoryTracerProvider,
  withValidationSpan,
  createInMemoryTracerProvider,
  ValidationMetrics,
  defaultMetrics,
  createValidationMetrics,
  SchemaAnalytics,
  defaultAnalytics,
  createSchemaAnalytics,
  createHealthCheck,
  createHealthCheckHandler,
  SchemaRegistry,
  defaultSchemaRegistry,
  createSchemaRegistry,
  observedSafeParse,
  observedParse,
  createObservedSchema
};
