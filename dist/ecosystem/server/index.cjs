"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ecosystem/server/index.ts
var server_exports = {};
__export(server_exports, {
  cachedParse: () => cachedParse,
  compile: () => compile,
  createHealthCheck: () => createHealthCheck,
  createHealthCheckHandler: () => createHealthCheckHandler,
  createSchemaCache: () => createSchemaCache,
  createServerValidator: () => createServerValidator,
  expressValidate: () => expressValidate,
  fastifyValidate: () => fastifyValidate,
  koaValidate: () => koaValidate,
  observedParse: () => observedParse,
  observedSafeParse: () => observedSafeParse,
  secureParse: () => secureParse,
  secureParseAsync: () => secureParseAsync,
  validate: () => validate
});
module.exports = __toCommonJS(server_exports);

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

// src/errors.ts
var InputFyError = class _InputFyError extends Error {
  issues;
  constructor(issues) {
    super(formatIssues(issues));
    this.name = "InputFyError";
    this.issues = issues;
    Object.setPrototypeOf(this, _InputFyError.prototype);
  }
  static create(issues) {
    return new _InputFyError(issues);
  }
  format() {
    const fieldErrors = {};
    const formErrors = [];
    for (const issue of this.issues) {
      if (issue.path.length === 0) {
        formErrors.push(issue.message);
      } else {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
    }
    return { _errors: formErrors, ...fieldErrors };
  }
  flatten() {
    const fieldErrors = {};
    const formErrors = [];
    for (const issue of this.issues) {
      if (issue.path.length === 0) {
        formErrors.push(issue.message);
      } else {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
    }
    return { formErrors, fieldErrors };
  }
  addIssue(issue) {
    this.issues.push(issue);
    this.message = formatIssues(this.issues);
  }
  addIssues(issues) {
    this.issues.push(...issues);
    this.message = formatIssues(this.issues);
  }
  get errors() {
    return this.issues;
  }
};
function formatIssues(issues) {
  if (issues.length === 0) return "Validation error";
  return issues.map((i) => `${i.path.length ? `[${i.path.join(".")}] ` : ""}${i.message}`).join("; ");
}

// src/interop/schema-walker.ts
function unwrapSchema(schema) {
  let current = schema;
  let optional = false;
  let nullable = false;
  let defaultValue;
  let isReadonly = false;
  for (let i = 0; i < 32; i++) {
    const typeName = current._def.typeName;
    if (typeName === "InputFyOptional") {
      optional = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyNullable") {
      nullable = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyDefault") {
      optional = true;
      const def = current._def;
      defaultValue = def.defaultValue();
      current = def.innerType;
      continue;
    }
    if (typeName === "InputFyReadonly") {
      isReadonly = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyCatch") {
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyEffects") {
      current = current._def.schema;
      continue;
    }
    if (typeName === "InputFyPreprocess") {
      current = current._def.schema;
      continue;
    }
    if (typeName === "InputFyPipeline") {
      current = current._def.out;
      continue;
    }
    if (typeName === "InputFyLazy") {
      current = current._def.getter();
      continue;
    }
    if (typeName === "InputFyPromise") {
      current = current._def.type;
      continue;
    }
    if (typeName === "InputFyCodec") {
      current = current._def.decodedSchema;
      continue;
    }
    if (typeName === "InputFyCrossField") {
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyContextual") {
      break;
    }
    if (typeName === "InputFyWhen" || typeName === "InputFyFile") {
      break;
    }
    break;
  }
  return { schema: current, optional, nullable, defaultValue, readonly: isReadonly };
}

// src/patterns.ts
var EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/;
var UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
function testRegexSafe(regex, value, maxLength = 1e4) {
  if (value.length > maxLength) return false;
  return regex.test(value);
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
  const validate2 = (data) => {
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
    validate: validate2,
    validateAsync: (data) => schema.safeParseAsync(data)
  };
}

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
function cachedParse(schema, data) {
  return defaultSchemaCache.parse(schema, data);
}
function createSchemaCache(options) {
  return new SchemaCache(options);
}

// src/security/config.ts
var currentSecurityConfig = {
  paranoid: false,
  blockUnsafeRegex: true,
  sandboxRefinements: false,
  refinementTimeoutMs: 100
};
function getSecurityConfig() {
  return currentSecurityConfig;
}

// src/security/sandbox.ts
var RefinementSandboxError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RefinementSandboxError";
  }
};
function sandboxedRefinementSync(value, check, timeoutMs = 100) {
  const start = Date.now();
  const result = check(value);
  if (Date.now() - start > timeoutMs) {
    throw new RefinementSandboxError(`Refinement exceeded ${timeoutMs}ms`);
  }
  return result;
}

// src/locales/en.ts
var EN_MESSAGES = {
  invalid_type: "Expected {{expected}}, received {{received}}",
  invalid_literal: "Invalid literal value, expected {{expected}}",
  unrecognized_keys: "Unrecognized key(s) in object: {{keys}}",
  invalid_union: "Invalid input",
  invalid_union_discriminator: "Invalid discriminator value. Expected {{options}}",
  invalid_enum_value: "Invalid enum value. Expected {{options}}, received '{{received}}'",
  invalid_arguments: "Invalid function arguments",
  invalid_return_type: "Invalid function return type",
  invalid_date: "Invalid date",
  invalid_string: "Invalid {{validation}}",
  too_small: "Must be greater than or equal to {{minimum}}",
  too_big: "Must be less than or equal to {{maximum}}",
  invalid_intersection_types: "Invalid intersection",
  not_multiple_of: "Number must be a multiple of {{multipleOf}}",
  not_finite: "Number must be finite",
  custom: "Invalid input"
};
var EN_BUNDLE = {
  code: "en",
  name: "English",
  messages: EN_MESSAGES,
  didYouMean: "Did you mean '{{suggestion}}'?"
};
function createLocaleBundle(code, name, messages, didYouMean2) {
  return {
    code,
    name,
    messages: { ...EN_MESSAGES, ...messages },
    ...didYouMean2 !== void 0 ? { didYouMean: didYouMean2 } : EN_BUNDLE.didYouMean ? { didYouMean: EN_BUNDLE.didYouMean } : {}
  };
}

// src/locales/registry.ts
var LOCALE_DATA = [
  EN_BUNDLE,
  createLocaleBundle("pt-BR", "Portugu\xEAs (Brasil)", {
    invalid_type: "Esperado {{expected}}, recebido {{received}}",
    invalid_literal: "Valor literal inv\xE1lido, esperado {{expected}}",
    unrecognized_keys: "Chave(s) n\xE3o reconhecida(s) no objeto: {{keys}}",
    invalid_union: "Entrada inv\xE1lida",
    invalid_union_discriminator: "Valor discriminador inv\xE1lido. Esperado {{options}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Esperado {{options}}, recebido '{{received}}'",
    invalid_date: "Data inv\xE1lida",
    invalid_string: "{{validation}} inv\xE1lido",
    too_small: "Deve ser maior ou igual a {{minimum}}",
    too_big: "Deve ser menor ou igual a {{maximum}}",
    not_multiple_of: "N\xFAmero deve ser m\xFAltiplo de {{multipleOf}}",
    not_finite: "N\xFAmero deve ser finito",
    custom: "Entrada inv\xE1lida"
  }, "Voc\xEA quis dizer '{{suggestion}}'?"),
  createLocaleBundle("pt-PT", "Portugu\xEAs (Portugal)", {
    invalid_type: "Esperado {{expected}}, recebido {{received}}",
    invalid_enum_value: "Valor de enumera\xE7\xE3o inv\xE1lido. Esperado {{options}}, recebido '{{received}}'",
    unrecognized_keys: "Chave(s) n\xE3o reconhecida(s) no objecto: {{keys}}",
    too_small: "Deve ser superior ou igual a {{minimum}}",
    too_big: "Deve ser inferior ou igual a {{maximum}}"
  }, "Quis dizer '{{suggestion}}'?"),
  createLocaleBundle("es", "Espa\xF1ol", {
    invalid_type: "Se esperaba {{expected}}, se recibi\xF3 {{received}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Se esperaba {{options}}, se recibi\xF3 '{{received}}'",
    unrecognized_keys: "Clave(s) no reconocida(s) en el objeto: {{keys}}",
    too_small: "Debe ser mayor o igual a {{minimum}}",
    too_big: "Debe ser menor o igual a {{maximum}}",
    invalid_date: "Fecha inv\xE1lida"
  }, "\xBFQuiso decir '{{suggestion}}'?"),
  createLocaleBundle("es-MX", "Espa\xF1ol (M\xE9xico)", {
    invalid_type: "Se esperaba {{expected}}, se recibi\xF3 {{received}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Se esperaba {{options}}, se recibi\xF3 '{{received}}'"
  }, "\xBFQuisiste decir '{{suggestion}}'?"),
  createLocaleBundle("fr", "Fran\xE7ais", {
    invalid_type: "Attendu {{expected}}, re\xE7u {{received}}",
    invalid_enum_value: "Valeur d'\xE9num\xE9ration invalide. Attendu {{options}}, re\xE7u '{{received}}'",
    unrecognized_keys: "Cl\xE9(s) non reconnue(s) dans l'objet : {{keys}}",
    too_small: "Doit \xEAtre sup\xE9rieur ou \xE9gal \xE0 {{minimum}}",
    too_big: "Doit \xEAtre inf\xE9rieur ou \xE9gal \xE0 {{maximum}}",
    invalid_date: "Date invalide"
  }, "Vouliez-vous dire '{{suggestion}}' ?"),
  createLocaleBundle("de", "Deutsch", {
    invalid_type: "Erwartet {{expected}}, erhalten {{received}}",
    invalid_enum_value: "Ung\xFCltiger Enum-Wert. Erwartet {{options}}, erhalten '{{received}}'",
    unrecognized_keys: "Nicht erkannte Schl\xFCssel im Objekt: {{keys}}",
    too_small: "Muss gr\xF6\xDFer oder gleich {{minimum}} sein",
    too_big: "Muss kleiner oder gleich {{maximum}} sein"
  }, "Meinten Sie '{{suggestion}}'?"),
  createLocaleBundle("it", "Italiano", {
    invalid_type: "Atteso {{expected}}, ricevuto {{received}}",
    invalid_enum_value: "Valore enum non valido. Atteso {{options}}, ricevuto '{{received}}'",
    too_small: "Deve essere maggiore o uguale a {{minimum}}",
    too_big: "Deve essere minore o uguale a {{maximum}}"
  }, "Intendevi '{{suggestion}}'?"),
  createLocaleBundle("ja", "\u65E5\u672C\u8A9E", {
    invalid_type: "{{expected}} \u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001{{received}} \u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F",
    invalid_enum_value: "\u7121\u52B9\u306A\u5217\u6319\u5024\u3002{{options}} \u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001'{{received}}' \u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F",
    too_small: "{{minimum}} \u4EE5\u4E0A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
    too_big: "{{maximum}} \u4EE5\u4E0B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
  }, "'{{suggestion}}' \u306E\u3053\u3068\u3067\u3059\u304B\uFF1F"),
  createLocaleBundle("ko", "\uD55C\uAD6D\uC5B4", {
    invalid_type: "{{expected}}\uC774(\uAC00) \uD544\uC694\uD558\uC9C0\uB9CC {{received}}\uC744(\uB97C) \uBC1B\uC558\uC2B5\uB2C8\uB2E4",
    invalid_enum_value: "\uC798\uBABB\uB41C \uC5F4\uAC70\uD615 \uAC12. {{options}}\uC774(\uAC00) \uD544\uC694\uD558\uC9C0\uB9CC '{{received}}'\uC744(\uB97C) \uBC1B\uC558\uC2B5\uB2C8\uB2E4",
    too_small: "{{minimum}} \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
    too_big: "{{maximum}} \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4"
  }, "'{{suggestion}}'\uC744(\uB97C) \uC758\uBBF8\uD558\uC168\uB098\uC694?"),
  createLocaleBundle("zh-CN", "\u7B80\u4F53\u4E2D\u6587", {
    invalid_type: "\u671F\u671B {{expected}}\uFF0C\u5B9E\u9645\u6536\u5230 {{received}}",
    invalid_enum_value: "\u65E0\u6548\u7684\u679A\u4E3E\u503C\u3002\u671F\u671B {{options}}\uFF0C\u5B9E\u9645\u6536\u5230 '{{received}}'",
    too_small: "\u5FC5\u987B\u5927\u4E8E\u6216\u7B49\u4E8E {{minimum}}",
    too_big: "\u5FC5\u987B\u5C0F\u4E8E\u6216\u7B49\u4E8E {{maximum}}"
  }, "\u60A8\u662F\u5426\u6307\u7684\u662F '{{suggestion}}'\uFF1F"),
  createLocaleBundle("zh-TW", "\u7E41\u9AD4\u4E2D\u6587", {
    invalid_type: "\u9810\u671F {{expected}}\uFF0C\u6536\u5230 {{received}}",
    invalid_enum_value: "\u7121\u6548\u7684\u5217\u8209\u503C\u3002\u9810\u671F {{options}}\uFF0C\u6536\u5230 '{{received}}'",
    too_small: "\u5FC5\u9808\u5927\u65BC\u6216\u7B49\u65BC {{minimum}}",
    too_big: "\u5FC5\u9808\u5C0F\u65BC\u6216\u7B49\u65BC {{maximum}}"
  }, "\u60A8\u662F\u6307 '{{suggestion}}' \u55CE\uFF1F"),
  createLocaleBundle("ru", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", {
    invalid_type: "\u041E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C {{expected}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 enum. \u041E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C {{options}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E '{{received}}'",
    too_small: "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E {{minimum}}",
    too_big: "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E {{maximum}}"
  }, "\u0412\u044B \u0438\u043C\u0435\u043B\u0438 \u0432 \u0432\u0438\u0434\u0443 '{{suggestion}}'?"),
  createLocaleBundle("ar", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", {
    invalid_type: "\u0645\u062A\u0648\u0642\u0639 {{expected}}\u060C \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 {{received}}",
    invalid_enum_value: "\u0642\u064A\u0645\u0629 \u062A\u0639\u062F\u0627\u062F \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629. \u0645\u062A\u0648\u0642\u0639 {{options}}\u060C \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 '{{received}}'",
    too_small: "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u0648 \u064A\u0633\u0627\u0648\u064A {{minimum}}",
    too_big: "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 \u0623\u0648 \u064A\u0633\u0627\u0648\u064A {{maximum}}"
  }, "\u0647\u0644 \u062A\u0642\u0635\u062F '{{suggestion}}'\u061F"),
  createLocaleBundle("hi", "\u0939\u093F\u0928\u094D\u0926\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924 \u0925\u093E, {{received}} \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0906",
    invalid_enum_value: "\u0905\u092E\u093E\u0928\u094D\u092F enum \u092E\u093E\u0928\u0964 {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    too_small: "{{minimum}} \u0938\u0947 \u0905\u0927\u093F\u0915 \u092F\u093E \u092C\u0930\u093E\u092C\u0930 \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F",
    too_big: "{{maximum}} \u0938\u0947 \u0915\u092E \u092F\u093E \u092C\u0930\u093E\u092C\u0930 \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F"
  }, "\u0915\u094D\u092F\u093E \u0906\u092A\u0915\u093E \u092E\u0924\u0932\u092C '{{suggestion}}' \u0925\u093E?"),
  createLocaleBundle("bn", "\u09AC\u09BE\u0982\u09B2\u09BE", {
    invalid_type: "{{expected}} \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4, {{received}} \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u0997\u09C7\u099B\u09C7",
    invalid_enum_value: "\u0985\u09AC\u09C8\u09A7 enum \u09AE\u09BE\u09A8\u0964 {{options}} \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4, '{{received}}' \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u0997\u09C7\u099B\u09C7"
  }, "\u0986\u09AA\u09A8\u09BF \u0995\u09BF '{{suggestion}}' \u09AC\u09CB\u099D\u09BE\u09A4\u09C7 \u099A\u09C7\u09AF\u09BC\u09C7\u099B\u09BF\u09B2\u09C7\u09A8?"),
  createLocaleBundle("tr", "T\xFCrk\xE7e", {
    invalid_type: "{{expected}} bekleniyordu, {{received}} al\u0131nd\u0131",
    invalid_enum_value: "Ge\xE7ersiz enum de\u011Feri. {{options}} bekleniyordu, '{{received}}' al\u0131nd\u0131",
    too_small: "{{minimum}} de\u011Ferinden b\xFCy\xFCk veya e\u015Fit olmal\u0131",
    too_big: "{{maximum}} de\u011Ferinden k\xFC\xE7\xFCk veya e\u015Fit olmal\u0131"
  }, "'{{suggestion}}' mi demek istediniz?"),
  createLocaleBundle("vi", "Ti\u1EBFng Vi\u1EC7t", {
    invalid_type: "Mong \u0111\u1EE3i {{expected}}, nh\u1EADn \u0111\u01B0\u1EE3c {{received}}",
    invalid_enum_value: "Gi\xE1 tr\u1ECB enum kh\xF4ng h\u1EE3p l\u1EC7. Mong \u0111\u1EE3i {{options}}, nh\u1EADn \u0111\u01B0\u1EE3c '{{received}}'",
    too_small: "Ph\u1EA3i l\u1EDBn h\u01A1n ho\u1EB7c b\u1EB1ng {{minimum}}",
    too_big: "Ph\u1EA3i nh\u1ECF h\u01A1n ho\u1EB7c b\u1EB1ng {{maximum}}"
  }, "B\u1EA1n c\xF3 \xFD l\xE0 '{{suggestion}}'?"),
  createLocaleBundle("pl", "Polski", {
    invalid_type: "Oczekiwano {{expected}}, otrzymano {{received}}",
    invalid_enum_value: "Nieprawid\u0142owa warto\u015B\u0107 enum. Oczekiwano {{options}}, otrzymano '{{received}}'",
    too_small: "Musi by\u0107 wi\u0119ksze lub r\xF3wne {{minimum}}",
    too_big: "Musi by\u0107 mniejsze lub r\xF3wne {{maximum}}"
  }, "Czy chodzi\u0142o o '{{suggestion}}'?"),
  createLocaleBundle("nl", "Nederlands", {
    invalid_type: "Verwacht {{expected}}, ontvangen {{received}}",
    invalid_enum_value: "Ongeldige enum-waarde. Verwacht {{options}}, ontvangen '{{received}}'",
    too_small: "Moet groter dan of gelijk aan {{minimum}} zijn",
    too_big: "Moet kleiner dan of gelijk aan {{maximum}} zijn"
  }, "Bedoelde u '{{suggestion}}'?"),
  createLocaleBundle("sv", "Svenska", {
    invalid_type: "F\xF6rv\xE4ntade {{expected}}, fick {{received}}",
    invalid_enum_value: "Ogiltigt enum-v\xE4rde. F\xF6rv\xE4ntade {{options}}, fick '{{received}}'",
    too_small: "M\xE5ste vara st\xF6rre \xE4n eller lika med {{minimum}}",
    too_big: "M\xE5ste vara mindre \xE4n eller lika med {{maximum}}"
  }, "Menade du '{{suggestion}}'?"),
  createLocaleBundle("da", "Dansk", {
    invalid_type: "Forventede {{expected}}, modtog {{received}}",
    invalid_enum_value: "Ugyldig enum-v\xE6rdi. Forventede {{options}}, modtog '{{received}}'",
    too_small: "Skal v\xE6re st\xF8rre end eller lig med {{minimum}}",
    too_big: "Skal v\xE6re mindre end eller lig med {{maximum}}"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("no", "Norsk", {
    invalid_type: "Forventet {{expected}}, mottok {{received}}",
    invalid_enum_value: "Ugyldig enum-verdi. Forventet {{options}}, mottok '{{received}}'",
    too_small: "M\xE5 v\xE6re st\xF8rre enn eller lik {{minimum}}",
    too_big: "M\xE5 v\xE6re mindre enn eller lik {{maximum}}"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("nb", "Norsk Bokm\xE5l", {
    invalid_type: "Forventet {{expected}}, mottok {{received}}",
    invalid_enum_value: "Ugyldig enum-verdi. Forventet {{options}}, mottok '{{received}}'"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("fi", "Suomi", {
    invalid_type: "Odotettiin {{expected}}, saatiin {{received}}",
    invalid_enum_value: "Virheellinen enum-arvo. Odotettiin {{options}}, saatiin '{{received}}'",
    too_small: "On oltava v\xE4hint\xE4\xE4n {{minimum}}",
    too_big: "On oltava enint\xE4\xE4n {{maximum}}"
  }, "Tarkoititko '{{suggestion}}'?"),
  createLocaleBundle("cs", "\u010Ce\u0161tina", {
    invalid_type: "O\u010Dek\xE1v\xE1no {{expected}}, obdr\u017Eeno {{received}}",
    invalid_enum_value: "Neplatn\xE1 hodnota enum. O\u010Dek\xE1v\xE1no {{options}}, obdr\u017Eeno '{{received}}'",
    too_small: "Mus\xED b\xFDt v\u011Bt\u0161\xED nebo rovno {{minimum}}",
    too_big: "Mus\xED b\xFDt men\u0161\xED nebo rovno {{maximum}}"
  }, "Mysleli jste '{{suggestion}}'?"),
  createLocaleBundle("sk", "Sloven\u010Dina", {
    invalid_type: "O\u010Dak\xE1van\xE9 {{expected}}, prijat\xE9 {{received}}",
    invalid_enum_value: "Neplatn\xE1 hodnota enum. O\u010Dak\xE1van\xE9 {{options}}, prijat\xE9 '{{received}}'",
    too_small: "Mus\xED by\u0165 v\xE4\u010D\u0161ie alebo rovn\xE9 {{minimum}}",
    too_big: "Mus\xED by\u0165 men\u0161ie alebo rovn\xE9 {{maximum}}"
  }, "Mysleli ste '{{suggestion}}'?"),
  createLocaleBundle("hu", "Magyar", {
    invalid_type: "{{expected}} v\xE1rhat\xF3, {{received}} \xE9rkezett",
    invalid_enum_value: "\xC9rv\xE9nytelen enum \xE9rt\xE9k. {{options}} v\xE1rhat\xF3, '{{received}}' \xE9rkezett",
    too_small: "Legal\xE1bb {{minimum}} kell legyen",
    too_big: "Legfeljebb {{maximum}} lehet"
  }, "'{{suggestion}}'-ra gondolt?"),
  createLocaleBundle("ro", "Rom\xE2n\u0103", {
    invalid_type: "A\u0219teptat {{expected}}, primit {{received}}",
    invalid_enum_value: "Valoare enum invalid\u0103. A\u0219teptat {{options}}, primit '{{received}}'",
    too_small: "Trebuie s\u0103 fie cel pu\u021Bin {{minimum}}",
    too_big: "Trebuie s\u0103 fie cel mult {{maximum}}"
  }, "A\u021Bi vrut s\u0103 spune\u021Bi '{{suggestion}}'?"),
  createLocaleBundle("bg", "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438", {
    invalid_type: "\u041E\u0447\u0430\u043A\u0432\u0430\u043D\u043E {{expected}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 enum \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442. \u041E\u0447\u0430\u043A\u0432\u0430\u043D\u043E {{options}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E '{{received}}'",
    too_small: "\u0422\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043F\u043E\u043D\u0435 {{minimum}}",
    too_big: "\u0422\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043D\u0430\u0439-\u043C\u043D\u043E\u0433\u043E {{maximum}}"
  }, "\u0418\u043C\u0430\u0445\u0442\u0435 \u043F\u0440\u0435\u0434\u0432\u0438\u0434 '{{suggestion}}'?"),
  createLocaleBundle("hr", "Hrvatski", {
    invalid_type: "O\u010Dekivano {{expected}}, primljeno {{received}}",
    invalid_enum_value: "Nevaljana enum vrijednost. O\u010Dekivano {{options}}, primljeno '{{received}}'",
    too_small: "Mora biti ve\u0107e ili jednako {{minimum}}",
    too_big: "Mora biti manje ili jednako {{maximum}}"
  }, "Jeste li mislili '{{suggestion}}'?"),
  createLocaleBundle("sr", "\u0421\u0440\u043F\u0441\u043A\u0438", {
    invalid_type: "\u041E\u0447\u0435\u043A\u0438\u0432\u0430\u043D\u043E {{expected}}, \u043F\u0440\u0438\u043C\u0459\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u0436\u0435\u045B\u0430 enum \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442. \u041E\u0447\u0435\u043A\u0438\u0432\u0430\u043D\u043E {{options}}, \u043F\u0440\u0438\u043C\u0459\u0435\u043D\u043E '{{received}}'",
    too_small: "\u041C\u043E\u0440\u0430 \u0431\u0438\u0442\u0438 \u0432\u0435\u045B\u0435 \u0438\u043B\u0438 \u0458\u0435\u0434\u043D\u0430\u043A\u043E {{minimum}}",
    too_big: "\u041C\u043E\u0440\u0430 \u0431\u0438\u0442\u0438 \u043C\u0430\u045A\u0435 \u0438\u043B\u0438 \u0458\u0435\u0434\u043D\u0430\u043A\u043E {{maximum}}"
  }, "\u0414\u0430 \u043B\u0438 \u0441\u0442\u0435 \u043C\u0438\u0441\u043B\u0438\u043B\u0438 '{{suggestion}}'?"),
  createLocaleBundle("sl", "Sloven\u0161\u010Dina", {
    invalid_type: "Pri\u010Dakovano {{expected}}, prejeto {{received}}",
    invalid_enum_value: "Neveljavna enum vrednost. Pri\u010Dakovano {{options}}, prejeto '{{received}}'",
    too_small: "Mora biti vsaj {{minimum}}",
    too_big: "Mora biti najve\u010D {{maximum}}"
  }, "Ste mislili '{{suggestion}}'?"),
  createLocaleBundle("uk", "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", {
    invalid_type: "\u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043B\u043E\u0441\u044C {{expected}}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F enum. \u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043B\u043E\u0441\u044C {{options}}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E '{{received}}'",
    too_small: "\u041C\u0430\u0454 \u0431\u0443\u0442\u0438 \u043D\u0435 \u043C\u0435\u043D\u0448\u0435 {{minimum}}",
    too_big: "\u041C\u0430\u0454 \u0431\u0443\u0442\u0438 \u043D\u0435 \u0431\u0456\u043B\u044C\u0448\u0435 {{maximum}}"
  }, "\u0412\u0438 \u043C\u0430\u043B\u0438 \u043D\u0430 \u0443\u0432\u0430\u0437\u0456 '{{suggestion}}'?"),
  createLocaleBundle("el", "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", {
    invalid_type: "\u0391\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD {{expected}}, \u03B5\u03BB\u03AE\u03C6\u03B8\u03B7 {{received}}",
    invalid_enum_value: "\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C4\u03B9\u03BC\u03AE enum. \u0391\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD {{options}}, \u03B5\u03BB\u03AE\u03C6\u03B8\u03B7 '{{received}}'",
    too_small: "\u03A0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD {{minimum}}",
    too_big: "\u03A0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C4\u03BF \u03C0\u03BF\u03BB\u03CD {{maximum}}"
  }, "\u0395\u03BD\u03BD\u03BF\u03BF\u03CD\u03C3\u03B1\u03C4\u03B5 '{{suggestion}}';"),
  createLocaleBundle("he", "\u05E2\u05D1\u05E8\u05D9\u05EA", {
    invalid_type: "\u05E6\u05E4\u05D5\u05D9 {{expected}}, \u05D4\u05EA\u05E7\u05D1\u05DC {{received}}",
    invalid_enum_value: "\u05E2\u05E8\u05DA enum \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9. \u05E6\u05E4\u05D5\u05D9 {{options}}, \u05D4\u05EA\u05E7\u05D1\u05DC '{{received}}'",
    too_small: "\u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05E4\u05D7\u05D5\u05EA {{minimum}}",
    too_big: "\u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8 {{maximum}}"
  }, "\u05D4\u05EA\u05DB\u05D5\u05D5\u05E0\u05EA \u05DC-'{{suggestion}}'?"),
  createLocaleBundle("th", "\u0E44\u0E17\u0E22", {
    invalid_type: "\u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07 {{expected}} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A {{received}}",
    invalid_enum_value: "\u0E04\u0E48\u0E32 enum \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07 {{options}} \u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A '{{received}}'",
    too_small: "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A {{minimum}}",
    too_big: "\u0E15\u0E49\u0E2D\u0E07\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A {{maximum}}"
  }, "\u0E04\u0E38\u0E13\u0E2B\u0E21\u0E32\u0E22\u0E16\u0E36\u0E07 '{{suggestion}}' \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?"),
  createLocaleBundle("id", "Bahasa Indonesia", {
    invalid_type: "Diharapkan {{expected}}, diterima {{received}}",
    invalid_enum_value: "Nilai enum tidak valid. Diharapkan {{options}}, diterima '{{received}}'",
    too_small: "Harus lebih besar atau sama dengan {{minimum}}",
    too_big: "Harus lebih kecil atau sama dengan {{maximum}}"
  }, "Apakah maksud Anda '{{suggestion}}'?"),
  createLocaleBundle("ms", "Bahasa Melayu", {
    invalid_type: "Dijangka {{expected}}, diterima {{received}}",
    invalid_enum_value: "Nilai enum tidak sah. Dijangka {{options}}, diterima '{{received}}'",
    too_small: "Mesti lebih besar atau sama dengan {{minimum}}",
    too_big: "Mesti lebih kecil atau sama dengan {{maximum}}"
  }, "Adakah anda maksudkan '{{suggestion}}'?"),
  createLocaleBundle("fa", "\u0641\u0627\u0631\u0633\u06CC", {
    invalid_type: "{{expected}} \u0645\u0648\u0631\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0648\u062F\u060C {{received}} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
    invalid_enum_value: "\u0645\u0642\u062F\u0627\u0631 enum \u0646\u0627\u0645\u0639\u062A\u0628\u0631. {{options}} \u0645\u0648\u0631\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0648\u062F\u060C '{{received}}' \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
    too_small: "\u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 {{minimum}} \u0628\u0627\u0634\u062F",
    too_big: "\u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u06A9\u062B\u0631 {{maximum}} \u0628\u0627\u0634\u062F"
  }, "\u0645\u0646\u0638\u0648\u0631\u062A\u0627\u0646 '{{suggestion}}' \u0628\u0648\u062F\u061F"),
  createLocaleBundle("ur", "\u0627\u0631\u062F\u0648", {
    invalid_type: "{{expected}} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C {{received}} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627",
    invalid_enum_value: "\u063A\u0644\u0637 enum \u0642\u062F\u0631\u06D4 {{options}} \u0645\u062A\u0648\u0642\u0639\u060C '{{received}}' \u0645\u0648\u0635\u0648\u0644",
    too_small: "\u06A9\u0645 \u0627\u0632 \u06A9\u0645 {{minimum}} \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2",
    too_big: "\u0632\u06CC\u0627\u062F\u06C1 \u0633\u06D2 \u0632\u06CC\u0627\u062F\u06C1 {{maximum}} \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2"
  }, "\u06A9\u06CC\u0627 \u0622\u067E \u06A9\u0627 \u0645\u0637\u0644\u0628 '{{suggestion}}' \u062A\u06BE\u0627\u061F"),
  createLocaleBundle("sw", "Kiswahili", {
    invalid_type: "Ilitarajiwa {{expected}}, ilipokelewa {{received}}",
    invalid_enum_value: "Thamani ya enum si sahihi. Ilitarajiwa {{options}}, ilipokelewa '{{received}}'",
    too_small: "Lazima iwe angalau {{minimum}}",
    too_big: "Lazima iwe si zaidi ya {{maximum}}"
  }, "Ulimaanisha '{{suggestion}}'?"),
  createLocaleBundle("af", "Afrikaans", {
    invalid_type: "Verwag {{expected}}, ontvang {{received}}",
    invalid_enum_value: "Ongeldige enum-waarde. Verwag {{options}}, ontvang '{{received}}'",
    too_small: "Moet groter as of gelyk aan {{minimum}} wees",
    too_big: "Moet kleiner as of gelyk aan {{maximum}} wees"
  }, "Het jy '{{suggestion}}' bedoel?"),
  createLocaleBundle("ca", "Catal\xE0", {
    invalid_type: "S'esperava {{expected}}, s'ha rebut {{received}}",
    invalid_enum_value: "Valor d'enum no v\xE0lid. S'esperava {{options}}, s'ha rebut '{{received}}'",
    too_small: "Ha de ser superior o igual a {{minimum}}",
    too_big: "Ha de ser inferior o igual a {{maximum}}"
  }, "Volies dir '{{suggestion}}'?"),
  createLocaleBundle("lt", "Lietuvi\u0173", {
    invalid_type: "Tik\u0117tasi {{expected}}, gauta {{received}}",
    invalid_enum_value: "Netinkama enum reik\u0161m\u0117. Tik\u0117tasi {{options}}, gauta '{{received}}'",
    too_small: "Turi b\u016Bti ne ma\u017Eiau kaip {{minimum}}",
    too_big: "Turi b\u016Bti ne daugiau kaip {{maximum}}"
  }, "Ar tur\u0117jote omenyje '{{suggestion}}'?"),
  createLocaleBundle("lv", "Latvie\u0161u", {
    invalid_type: "Gaid\u012Bts {{expected}}, sa\u0146emts {{received}}",
    invalid_enum_value: "Neder\u012Bga enum v\u0113rt\u012Bba. Gaid\u012Bts {{options}}, sa\u0146emts '{{received}}'",
    too_small: "J\u0101b\u016Bt vismaz {{minimum}}",
    too_big: "J\u0101b\u016Bt ne vair\u0101k k\u0101 {{maximum}}"
  }, "Vai dom\u0101j\u0101t '{{suggestion}}'?"),
  createLocaleBundle("et", "Eesti", {
    invalid_type: "Oodati {{expected}}, saadi {{received}}",
    invalid_enum_value: "Vigane enum v\xE4\xE4rtus. Oodati {{options}}, saadi '{{received}}'",
    too_small: "Peab olema v\xE4hemalt {{minimum}}",
    too_big: "Peab olema kuni {{maximum}}"
  }, "Kas m\xF5tlesite '{{suggestion}}'?"),
  createLocaleBundle("is", "\xCDslenska", {
    invalid_type: "B\xFAist var vi\xF0 {{expected}}, f\xE9kk {{received}}",
    invalid_enum_value: "\xD3gilt enum gildi. B\xFAist var vi\xF0 {{options}}, f\xE9kk '{{received}}'",
    too_small: "Ver\xF0ur a\xF0 vera a\xF0 minnsta kosti {{minimum}}",
    too_big: "Ver\xF0ur a\xF0 vera a\xF0 h\xE1marki {{maximum}}"
  }, "\xC1ttir\xF0u vi\xF0 '{{suggestion}}'?"),
  createLocaleBundle("mk", "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438", {
    invalid_type: "\u0421\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430\u0448\u0435 {{expected}}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 enum \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442. \u0421\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430\u0448\u0435 {{options}}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E '{{received}}'",
    too_small: "\u041C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u043D\u0430\u0458\u043C\u0430\u043B\u043A\u0443 {{minimum}}",
    too_big: "\u041C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u043D\u0430\u0458\u043C\u043D\u043E\u0433\u0443 {{maximum}}"
  }, "\u0414\u0430\u043B\u0438 \u043C\u0438\u0441\u043B\u0435\u0432\u0442\u0435 \u043D\u0430 '{{suggestion}}'?"),
  createLocaleBundle("sq", "Shqip", {
    invalid_type: "Pritet {{expected}}, u mor {{received}}",
    invalid_enum_value: "Vler\xEB enum e pavlefshme. Pritet {{options}}, u mor '{{received}}'",
    too_small: "Duhet t\xEB jet\xEB t\xEB pakt\xEBn {{minimum}}",
    too_big: "Duhet t\xEB jet\xEB s\xEB shumti {{maximum}}"
  }, "A mendonit '{{suggestion}}'?"),
  createLocaleBundle("ka", "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8", {
    invalid_type: "\u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 \u10D8\u10E7\u10DD {{expected}}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0 {{received}}",
    invalid_enum_value: "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 enum \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0. \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 {{options}}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 '{{received}}'",
    too_small: "\u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10DB\u10D8\u10DC\u10D8\u10DB\u10E3\u10DB {{minimum}}",
    too_big: "\u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10DB\u10D0\u10E5\u10E1\u10D8\u10DB\u10E3\u10DB {{maximum}}"
  }, "\u10D2\u10E3\u10DA\u10D8\u10E1\u10EE\u10DB\u10DD\u10D1\u10D3\u10D8\u10D7 '{{suggestion}}'?"),
  createLocaleBundle("az", "Az\u0259rbaycan", {
    invalid_type: "{{expected}} g\xF6zl\u0259nilirdi, {{received}} al\u0131nd\u0131",
    invalid_enum_value: "Yanl\u0131\u015F enum d\u0259y\u0259ri. {{options}} g\xF6zl\u0259nilirdi, '{{received}}' al\u0131nd\u0131",
    too_small: "\u018Fn az\u0131 {{minimum}} olmal\u0131d\u0131r",
    too_big: "\u018Fn \xE7oxu {{maximum}} olmal\u0131d\u0131r"
  }, "'{{suggestion}}' dem\u0259k ist\u0259diniz?"),
  createLocaleBundle("kk", "\u049A\u0430\u0437\u0430\u049B", {
    invalid_type: "{{expected}} \u043A\u04AF\u0442\u0456\u043B\u0434\u0456, {{received}} \u0430\u043B\u044B\u043D\u0434\u044B",
    invalid_enum_value: "\u0416\u0430\u0440\u0430\u043C\u0441\u044B\u0437 enum \u043C\u04D9\u043D\u0456. {{options}} \u043A\u04AF\u0442\u0456\u043B\u0434\u0456, '{{received}}' \u0430\u043B\u044B\u043D\u0434\u044B",
    too_small: "\u041A\u0435\u043C\u0456\u043D\u0434\u0435 {{minimum}} \u0431\u043E\u043B\u0443\u044B \u043A\u0435\u0440\u0435\u043A",
    too_big: "\u0415\u04A3 \u043A\u04E9\u0431\u0456 {{maximum}} \u0431\u043E\u043B\u0443\u044B \u043A\u0435\u0440\u0435\u043A"
  }, "'{{suggestion}}' \u0434\u0435\u043F \u043E\u0439\u043B\u0430\u0434\u044B\u04A3\u044B\u0437 \u0431\u0430?"),
  createLocaleBundle("uz", "O\u02BBzbek", {
    invalid_type: "{{expected}} kutilgan, {{received}} olindi",
    invalid_enum_value: "Noto'g'ri enum qiymati. {{options}} kutilgan, '{{received}}' olindi",
    too_small: "Kamida {{minimum}} bo'lishi kerak",
    too_big: "Ko'pi bilan {{maximum}} bo'lishi kerak"
  }, "'{{suggestion}}' demoqchimisiz?"),
  createLocaleBundle("mn", "\u041C\u043E\u043D\u0433\u043E\u043B", {
    invalid_type: "{{expected}} \u0445\u04AF\u043B\u044D\u044D\u0433\u0434\u0441\u044D\u043D, {{received}} \u0438\u0440\u0441\u044D\u043D",
    invalid_enum_value: "\u0411\u0443\u0440\u0443\u0443 enum \u0443\u0442\u0433\u0430. {{options}} \u0445\u04AF\u043B\u044D\u044D\u0433\u0434\u0441\u044D\u043D, '{{received}}' \u0438\u0440\u0441\u044D\u043D",
    too_small: "\u0425\u0430\u043C\u0433\u0438\u0439\u043D \u0431\u0430\u0433\u0430\u0434\u0430\u0430 {{minimum}} \u0431\u0430\u0439\u0445 \u0451\u0441\u0442\u043E\u0439",
    too_big: "\u0425\u0430\u043C\u0433\u0438\u0439\u043D \u0438\u0445\u0434\u044D\u044D {{maximum}} \u0431\u0430\u0439\u0445 \u0451\u0441\u0442\u043E\u0439"
  }, "'{{suggestion}}' \u0433\u044D\u0436 \u04AF\u04AF?"),
  createLocaleBundle("ne", "\u0928\u0947\u092A\u093E\u0932\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, {{received}} \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    invalid_enum_value: "\u0905\u092E\u093E\u0928\u094D\u092F enum \u092E\u093E\u0928\u0964 {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    too_small: "\u0915\u092E\u094D\u0924\u0940\u092E\u093E {{minimum}} \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B",
    too_big: "\u092C\u0922\u0940\u092E\u093E {{maximum}} \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B"
  }, "\u0915\u0947 \u0924\u092A\u093E\u0908\u0902 '{{suggestion}}' \u092D\u0928\u094D\u0928 \u0916\u094B\u091C\u094D\u0928\u0941\u0939\u0941\u0928\u094D\u0925\u094D\u092F\u094B?"),
  createLocaleBundle("ta", "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", {
    invalid_type: "{{expected}} \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1, {{received}} \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1",
    invalid_enum_value: "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 enum \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1. {{options}} \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1, '{{received}}' \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1",
    too_small: "\u0B95\u0BC1\u0BB1\u0BC8\u0BA8\u0BCD\u0BA4\u0BA4\u0BC1 {{minimum}} \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    too_big: "\u0B85\u0BA4\u0BBF\u0B95\u0BAA\u0B9F\u0BCD\u0B9A\u0BAE\u0BCD {{maximum}} \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD"
  }, "'{{suggestion}}' \u0B8E\u0BA9\u0BCD\u0BB1\u0BC1 \u0B9A\u0BCA\u0BB2\u0BCD\u0BB2 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAE\u0BCD\u0BAA\u0BBF\u0BA9\u0BC0\u0BB0\u0BCD\u0B95\u0BB3\u0BBE?"),
  createLocaleBundle("te", "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", {
    invalid_type: "{{expected}} \u0C05\u0C02\u0C1A\u0C28\u0C3E, {{received}} \u0C05\u0C02\u0C26\u0C3F\u0C02\u0C26\u0C3F",
    invalid_enum_value: "\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C28\u0C3F enum \u0C35\u0C3F\u0C32\u0C41\u0C35. {{options}} \u0C05\u0C02\u0C1A\u0C28\u0C3E, '{{received}}' \u0C05\u0C02\u0C26\u0C3F\u0C02\u0C26\u0C3F",
    too_small: "\u0C15\u0C28\u0C40\u0C38\u0C02 {{minimum}} \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F",
    too_big: "\u0C17\u0C30\u0C3F\u0C37\u0C4D\u0C1F\u0C02\u0C17\u0C3E {{maximum}} \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F"
  }, "'{{suggestion}}' \u0C05\u0C28\u0C3F \u0C05\u0C30\u0C4D\u0C25\u0C2E\u0C3E?"),
  createLocaleBundle("kn", "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", {
    invalid_type: "{{expected}} \u0CA8\u0CBF\u0CB0\u0CC0\u0C95\u0CCD\u0CB7\u0CBF\u0CB8\u0CB2\u0CBE\u0C97\u0CBF\u0CA6\u0CC6, {{received}} \u0CB8\u0CBF\u0C95\u0CCD\u0C95\u0CBF\u0CA6\u0CC6",
    invalid_enum_value: "\u0C85\u0CAE\u0CBE\u0CA8\u0CCD\u0CAF enum \u0CAE\u0CCC\u0CB2\u0CCD\u0CAF. {{options}} \u0CA8\u0CBF\u0CB0\u0CC0\u0C95\u0CCD\u0CB7\u0CBF\u0CB8\u0CB2\u0CBE\u0C97\u0CBF\u0CA6\u0CC6, '{{received}}' \u0CB8\u0CBF\u0C95\u0CCD\u0C95\u0CBF\u0CA6\u0CC6",
    too_small: "\u0C95\u0CA8\u0CBF\u0CB7\u0CCD\u0CA0 {{minimum}} \u0C87\u0CB0\u0CAC\u0CC7\u0C95\u0CC1",
    too_big: "\u0C97\u0CB0\u0CBF\u0CB7\u0CCD\u0CA0 {{maximum}} \u0C87\u0CB0\u0CAC\u0CC7\u0C95\u0CC1"
  }, "'{{suggestion}}' \u0C8E\u0C82\u0CA6\u0CC1 \u0C85\u0CB0\u0CCD\u0CA5\u0CB5\u0CC7?"),
  createLocaleBundle("ml", "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", {
    invalid_type: "{{expected}} \u0D2A\u0D4D\u0D30\u0D24\u0D40\u0D15\u0D4D\u0D37\u0D3F\u0D1A\u0D4D\u0D1A\u0D41, {{received}} \u0D32\u0D2D\u0D3F\u0D1A\u0D4D\u0D1A\u0D41",
    invalid_enum_value: "\u0D05\u0D38\u0D3E\u0D27\u0D41\u0D35\u0D3E\u0D2F enum \u0D2E\u0D42\u0D32\u0D4D\u0D2F\u0D02. {{options}} \u0D2A\u0D4D\u0D30\u0D24\u0D40\u0D15\u0D4D\u0D37\u0D3F\u0D1A\u0D4D\u0D1A\u0D41, '{{received}}' \u0D32\u0D2D\u0D3F\u0D1A\u0D4D\u0D1A\u0D41",
    too_small: "\u0D15\u0D41\u0D31\u0D1E\u0D4D\u0D1E\u0D24\u0D4D {{minimum}} \u0D06\u0D2F\u0D3F\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D23\u0D02",
    too_big: "\u0D2A\u0D30\u0D2E\u0D3E\u0D35\u0D27\u0D3F {{maximum}} \u0D06\u0D2F\u0D3F\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D23\u0D02"
  }, "'{{suggestion}}' \u0D0E\u0D28\u0D4D\u0D28\u0D4D \u0D05\u0D7C\u0D24\u0D4D\u0D25\u0D2E\u0D3E\u0D15\u0D4D\u0D15\u0D3F\u0D2F\u0D4B?"),
  createLocaleBundle("mr", "\u092E\u0930\u093E\u0920\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, {{received}} \u092E\u093F\u0933\u093E\u0932\u0947",
    invalid_enum_value: "\u0905\u0935\u0948\u0927 enum \u092E\u0942\u0932\u094D\u092F. {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092E\u093F\u0933\u093E\u0932\u0947",
    too_small: "\u0915\u093F\u092E\u093E\u0928 {{minimum}} \u0905\u0938\u093E\u0935\u0947",
    too_big: "\u091C\u093E\u0938\u094D\u0924\u0940\u0924 \u091C\u093E\u0938\u094D\u0924 {{maximum}} \u0905\u0938\u093E\u0935\u0947"
  }, "\u0924\u0941\u092E\u094D\u0939\u093E\u0932\u093E '{{suggestion}}' \u092E\u094D\u0939\u0923\u093E\u092F\u091A\u0947 \u0939\u094B\u0924\u0947 \u0915\u093E?"),
  createLocaleBundle("gu", "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", {
    invalid_type: "{{expected}} \u0A85\u0AAA\u0AC7\u0A95\u0ACD\u0AB7\u0ABF\u0AA4, {{received}} \u0AAE\u0AB3\u0ACD\u0AAF\u0AC1\u0A82",
    invalid_enum_value: "\u0A85\u0AAE\u0ABE\u0AA8\u0ACD\u0AAF enum \u0AAE\u0AC2\u0AB2\u0ACD\u0AAF. {{options}} \u0A85\u0AAA\u0AC7\u0A95\u0ACD\u0AB7\u0ABF\u0AA4, '{{received}}' \u0AAE\u0AB3\u0ACD\u0AAF\u0AC1\u0A82",
    too_small: "\u0A93\u0A9B\u0ABE\u0AAE\u0ABE\u0A82 \u0A93\u0A9B\u0AC1\u0A82 {{minimum}} \u0AB9\u0ACB\u0AB5\u0AC1\u0A82 \u0A9C\u0ACB\u0A88\u0A8F",
    too_big: "\u0AB5\u0AA7\u0AC1\u0AAE\u0ABE\u0A82 \u0AB5\u0AA7\u0AC1 {{maximum}} \u0AB9\u0ACB\u0AB5\u0AC1\u0A82 \u0A9C\u0ACB\u0A88\u0A8F"
  }, "\u0AB6\u0AC1\u0A82 \u0AA4\u0AAE\u0ABE\u0AB0\u0ACB \u0A85\u0AB0\u0ACD\u0AA5 '{{suggestion}}' \u0AB9\u0AA4\u0ACB?"),
  createLocaleBundle("pa", "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", {
    invalid_type: "{{expected}} \u0A09\u0A2E\u0A40\u0A26, {{received}} \u0A2E\u0A3F\u0A32\u0A3F\u0A06",
    invalid_enum_value: "\u0A05\u0A35\u0A48\u0A27 enum \u0A2E\u0A41\u0A71\u0A32. {{options}} \u0A09\u0A2E\u0A40\u0A26, '{{received}}' \u0A2E\u0A3F\u0A32\u0A3F\u0A06",
    too_small: "\u0A18\u0A71\u0A1F\u0A4B-\u0A18\u0A71\u0A1F {{minimum}} \u0A39\u0A4B\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A40\u0A26\u0A3E \u0A39\u0A48",
    too_big: "\u0A35\u0A71\u0A27 \u0A24\u0A4B\u0A02 \u0A35\u0A71\u0A27 {{maximum}} \u0A39\u0A4B\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A40\u0A26\u0A3E \u0A39\u0A48"
  }, "\u0A15\u0A40 \u0A24\u0A41\u0A39\u0A3E\u0A21\u0A3E \u0A2E\u0A24\u0A32\u0A2C '{{suggestion}}' \u0A38\u0A40?"),
  createLocaleBundle("am", "\u12A0\u121B\u122D\u129B", {
    invalid_type: "{{expected}} \u12E8\u121A\u1320\u1260\u1240\u12CD\u1363 {{received}} \u12F0\u122D\u1237\u120D",
    invalid_enum_value: "\u12E8\u121B\u12ED\u1230\u122B enum \u12A5\u1234\u1275\u1362 {{options}} \u12E8\u121A\u1320\u1260\u1240\u12CD\u1363 '{{received}}' \u12F0\u122D\u1237\u120D",
    too_small: "\u1262\u12EB\u1295\u1235 {{minimum}} \u1218\u1206\u1295 \u12A0\u1208\u1260\u1275",
    too_big: "\u1262\u1260\u12DB {{maximum}} \u1218\u1206\u1295 \u12A0\u1208\u1260\u1275"
  }, "'{{suggestion}}' \u121B\u1208\u1275 \u1290\u1260\u122D?"),
  createLocaleBundle("yo", "Yor\xF9b\xE1", {
    invalid_type: "A nireti {{expected}}, a gba {{received}}",
    invalid_enum_value: "Iye enum ti ko t\u1ECD. A nireti {{options}}, a gba '{{received}}'",
    too_small: "Gb\u1ECDd\u1ECD j\u1EB9 o kere ju {{minimum}} l\u1ECD",
    too_big: "Gb\u1ECDd\u1ECD j\u1EB9 ko ju {{maximum}} l\u1ECD"
  }, "Se o tum\u1ECD si '{{suggestion}}'?"),
  createLocaleBundle("ig", "Igbo", {
    invalid_type: "A t\u1EE5r\u1EE5 anya {{expected}}, enwetara {{received}}",
    invalid_enum_value: "Ur\xFA enum na-ad\u1ECBgh\u1ECB mma. A t\u1EE5r\u1EE5 anya {{options}}, enwetara '{{received}}'",
    too_small: "Ga-ab\u1EE5r\u1ECBr\u1ECB na opekata mgbe {{minimum}}",
    too_big: "Ga-ab\u1EE5r\u1ECBr\u1ECB na \u1ECD d\u1ECBgh\u1ECB kar\u1ECBa {{maximum}}"
  }, "\u1ECA p\u1EE5tara '{{suggestion}}'?"),
  createLocaleBundle("ha", "Hausa", {
    invalid_type: "Ana sa ran {{expected}}, an kar\u0253i {{received}}",
    invalid_enum_value: "Darajar enum mara inganci. Ana sa ran {{options}}, an kar\u0253i '{{received}}'",
    too_small: "Dole ya kasance a\u0199alla {{minimum}}",
    too_big: "Dole ya kasance mafi yawa {{maximum}}"
  }, "Kuna nufin '{{suggestion}}'?"),
  createLocaleBundle("eu", "Euskara", {
    invalid_type: "{{expected}} espero zen, {{received}} jaso da",
    invalid_enum_value: "Enum balio baliogabea. {{options}} espero zen, '{{received}}' jaso da",
    too_small: "Gutxienez {{minimum}} izan behar da",
    too_big: "Gehienez {{maximum}} izan behar da"
  }, "'{{suggestion}}' esan nahi zenuen?"),
  createLocaleBundle("gl", "Galego", {
    invalid_type: "Agard\xE1base {{expected}}, recibiuse {{received}}",
    invalid_enum_value: "Valor de enum non v\xE1lido. Agard\xE1base {{options}}, recibiuse '{{received}}'",
    too_small: "Debe ser maior ou igual a {{minimum}}",
    too_big: "Debe ser menor ou igual a {{maximum}}"
  }, "Quixo dicir '{{suggestion}}'?")
];
var registry = new Map(
  LOCALE_DATA.map((bundle) => [bundle.code, bundle])
);
function getLocaleBundle(code) {
  return registry.get(code) ?? EN_BUNDLE;
}

// src/i18n/config.ts
var globalConfig = {
  locale: "en",
  defaultSeverity: "error",
  suggestions: true
};
function getGlobalConfig() {
  return globalConfig;
}

// src/i18n/suggest.ts
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, row[j] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[n];
}
var MAX_SUGGESTION_DISTANCE = 3;
function didYouMean(received, options) {
  if (received === void 0 || options.length === 0) return void 0;
  const input = String(received);
  let best;
  for (const option of options) {
    const candidate = String(option);
    const distance = levenshtein(input.toLowerCase(), candidate.toLowerCase());
    const threshold = Math.max(1, Math.floor(candidate.length / 3));
    if (distance > Math.min(MAX_SUGGESTION_DISTANCE, threshold)) continue;
    if (!best || distance < best.distance) {
      best = { value: candidate, distance };
    }
  }
  return best?.value;
}

// src/i18n/format-issue.ts
function getIssueSuggestion(issue, data, path) {
  const config2 = getGlobalConfig();
  if (config2.suggestions === false) return void 0;
  switch (issue.code) {
    case "invalid_enum_value":
      return didYouMean(issue.received, issue.options);
    case "invalid_union_discriminator": {
      let received;
      if (typeof data === "object" && data !== null && path && path.length > 0) {
        received = data[String(path[path.length - 1])];
      }
      return didYouMean(received, issue.options);
    }
    case "invalid_literal": {
      const expected = issue.expected;
      if (typeof expected === "string" || typeof expected === "number") {
        return didYouMean(issue.received, [expected]);
      }
      return void 0;
    }
    default:
      return void 0;
  }
}
function issueVars(issue, suggestion) {
  const base = { suggestion: suggestion ?? "" };
  switch (issue.code) {
    case "invalid_type":
      return { ...base, expected: String(issue.expected), received: String(issue.received) };
    case "invalid_literal":
      return { ...base, expected: JSON.stringify(issue.expected), received: JSON.stringify(issue.received) };
    case "unrecognized_keys":
      return { ...base, keys: issue.keys.map((k) => `'${k}'`).join(", ") };
    case "invalid_union_discriminator":
      return { ...base, options: issue.options.map(String).join(" | ") };
    case "invalid_enum_value":
      return {
        ...base,
        options: issue.options.map(String).join(" | "),
        received: String(issue.received ?? "")
      };
    case "invalid_string":
      return { ...base, validation: issue.validation };
    case "too_small":
      return { ...base, minimum: String(issue.minimum), type: issue.type };
    case "too_big":
      return { ...base, maximum: String(issue.maximum), type: issue.type };
    case "not_multiple_of":
      return { ...base, multipleOf: String(issue.multipleOf) };
    default:
      return base;
  }
}
function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
function localeMessage(issue, suggestion) {
  const bundle = getLocaleBundle(getGlobalConfig().locale ?? "en");
  const template = bundle.messages[issue.code];
  if (!template) return void 0;
  let message = interpolate(template, issueVars(issue, suggestion));
  if (suggestion && bundle.didYouMean) {
    message += ` ${interpolate(bundle.didYouMean, { suggestion })}`;
  }
  return message;
}
function applyErrorMap(issue, errorMap, ctx) {
  if (!errorMap) return void 0;
  const messageCtx = {
    defaultError: ctx.defaultError,
    data: ctx.data,
    suggestion: ctx.suggestion,
    locale: getGlobalConfig().locale ?? "en"
  };
  if (typeof errorMap === "function") {
    return errorMap(issue, messageCtx)?.message;
  }
  const fn = errorMap[issue.code];
  return fn?.(issue, messageCtx)?.message;
}
function resolveIssueSeverity(issue) {
  const explicit = issue.severity;
  if (explicit) return explicit;
  return getGlobalConfig().defaultSeverity ?? "error";
}
function formatIssueMessage(issue, ctx, explicitMessage, knownSuggestion) {
  if (explicitMessage) return explicitMessage;
  const suggestion = knownSuggestion ?? getIssueSuggestion(issue, ctx.data, ctx.path);
  const fallback = defaultErrorMessage(issue);
  const config2 = getGlobalConfig();
  const fromParams = applyErrorMap(issue, ctx.common.contextualErrorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromParams) return fromParams;
  const fromGlobal = applyErrorMap(issue, config2.errorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromGlobal) return fromGlobal;
  const fromLocale = localeMessage(issue, suggestion);
  if (fromLocale) return fromLocale;
  if (suggestion) {
    const bundle = getLocaleBundle(config2.locale ?? "en");
    const hint = bundle.didYouMean ? interpolate(bundle.didYouMean, { suggestion }) : `Did you mean '${suggestion}'?`;
    return `${fallback} ${hint}`;
  }
  return fallback;
}

// src/types-core.ts
var MAX_PARSE_DEPTH = 128;
var DANGEROUS_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function createParseContext(data, params) {
  return {
    common: {
      issues: [],
      contextualErrorMap: params?.errorMap,
      async: params?.async ?? false,
      context: params?.context ?? {}
    },
    path: params?.path ?? [],
    parent: null,
    data,
    parsedType: getParsedType(data),
    depth: 0
  };
}
function getParsedType(data) {
  if (data === void 0) return "undefined";
  if (data === null) return "null";
  if (typeof data === "number") return Number.isNaN(data) ? "nan" : "number";
  if (typeof data === "boolean") return "boolean";
  if (typeof data === "bigint") return "bigint";
  if (typeof data === "string") return "string";
  if (typeof data === "symbol") return "symbol";
  if (typeof data === "function") return "function";
  if (data instanceof Date) return "date";
  if (data instanceof Promise) return "promise";
  if (Array.isArray(data)) return "array";
  if (data instanceof Map) return "map";
  if (data instanceof Set) return "set";
  if (typeof data === "object") return "object";
  return "unknown";
}
function isPromise(val) {
  return val instanceof Promise || typeof val === "object" && val !== null && "then" in val && typeof val.then === "function";
}
function addIssue(ctx, issue) {
  const fullIssue = issue;
  const suggestion = fullIssue.suggestion ?? getIssueSuggestion(fullIssue, ctx.data, ctx.path);
  const message = fullIssue.message ? fullIssue.message : formatIssueMessage(fullIssue, ctx, void 0, suggestion);
  const severity = resolveIssueSeverity(fullIssue);
  ctx.common.issues.push({
    ...fullIssue,
    path: fullIssue.path ?? ctx.path,
    message,
    severity,
    ...suggestion !== void 0 ? { suggestion } : {}
  });
}
function defaultErrorMessage(issue) {
  switch (issue.code) {
    case "invalid_type":
      return `Expected ${issue.expected}, received ${issue.received}`;
    case "invalid_literal":
      return `Invalid literal value, expected ${JSON.stringify(issue.expected)}`;
    case "unrecognized_keys":
      return `Unrecognized key(s) in object: ${issue.keys.map((k) => `'${k}'`).join(", ")}`;
    case "invalid_union":
      return "Invalid input";
    case "invalid_union_discriminator":
      return `Invalid discriminator value. Expected ${issue.options.map(String).join(" | ")}`;
    case "invalid_enum_value":
      return `Invalid enum value. Expected ${issue.options.map(String).join(" | ")}, received '${String(issue.received)}'`;
    case "invalid_date":
      return "Invalid date";
    case "invalid_string":
      return `Invalid ${issue.validation}`;
    case "too_small":
      if (issue.exact) return `Must contain exactly ${issue.minimum} element(s)`;
      return issue.inclusive ? `Must be greater than or equal to ${issue.minimum}` : `Must be greater than ${issue.minimum}`;
    case "too_big":
      if (issue.exact) return `Must contain exactly ${issue.maximum} element(s)`;
      return issue.inclusive ? `Must be less than or equal to ${issue.maximum}` : `Must be less than ${issue.maximum}`;
    case "not_multiple_of":
      return `Number must be a multiple of ${issue.multipleOf}`;
    case "not_finite":
      return "Number must be finite";
    case "custom":
      return issue.message;
    default:
      return "Invalid input";
  }
}
function makeRefinementCtx(ctx) {
  return {
    path: ctx.path,
    addIssue: (issue) => addIssue(ctx, issue)
  };
}

// src/core.ts
var InputFyType = class {
  _input;
  _output;
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = createParseContext(data, params);
    try {
      const result = this._parseSync(ctx);
      if (ctx.common.issues.length > 0) {
        return { success: false, error: new InputFyError(ctx.common.issues) };
      }
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof InputFyError) return { success: false, error: err };
      throw err;
    }
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = createParseContext(data, { ...params, async: true });
    try {
      const result = await this._parseAsync(ctx);
      if (ctx.common.issues.length > 0) {
        return { success: false, error: new InputFyError(ctx.common.issues) };
      }
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof InputFyError) return { success: false, error: err };
      throw err;
    }
  }
  describe(description) {
    const cloned = this._clone();
    cloned._def = {
      ...cloned._def,
      description,
      metadata: { ...cloned._def.metadata ?? {}, description }
    };
    return cloned;
  }
  brand() {
    return this;
  }
  refine(check, message) {
    const msg = typeof message === "string" ? message : message?.message;
    const fatal = typeof message === "object" ? message.fatal : void 0;
    return this._addRefine(check, msg, fatal);
  }
  superRefine(check) {
    return this._addSuperRefine(check);
  }
  transform(transform) {
    return this._addTransform(transform);
  }
  _addRefine(check, message, fatal) {
    return this._withEffect({
      type: "refinement",
      refinement: check,
      message,
      fatal
    });
  }
  _addSuperRefine(check) {
    const refinement = async (val, ctx) => {
      await check(val, ctx);
      return true;
    };
    return this._withEffect({ type: "refinement", refinement, fatal: true });
  }
  _addTransform(transform) {
    return this._withEffect({
      type: "transform",
      transform
    });
  }
  _withEffect(effect) {
    const cloned = this._clone();
    cloned._def = {
      ...cloned._def,
      effects: [...cloned._def.effects ?? [], effect]
    };
    return cloned;
  }
  _parseSync(ctx) {
    const result = this._parseWithEffects(ctx);
    if (isPromise(result)) {
      throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
    }
    return result;
  }
  async _parseAsync(ctx) {
    return await Promise.resolve(this._parseWithEffects(ctx));
  }
  _parseWithEffects(ctx) {
    const baseResult = this._parse(ctx);
    const effects = this._def.effects;
    if (!effects || effects.length === 0) return baseResult;
    const runRefinement = (effect, current) => {
      const sec = getSecurityConfig();
      const fn = effect.refinement;
      if (sec.sandboxRefinements) {
        try {
          return sandboxedRefinementSync(
            current,
            (v) => {
              const r2 = fn(v, makeRefinementCtx(ctx));
              if (r2 instanceof Promise) {
                throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
              }
              return r2 !== false;
            },
            sec.refinementTimeoutMs ?? 100
          );
        } catch (err) {
          if (err instanceof RefinementSandboxError) {
            sec.auditLog?.log({
              type: "sandbox_timeout",
              message: err.message
            });
            addIssue(ctx, { code: "custom", message: err.message });
            return false;
          }
          throw err;
        }
      }
      const r = fn(current, makeRefinementCtx(ctx));
      if (r instanceof Promise) return r.then((ok) => ok !== false);
      return r !== false;
    };
    const runEffects = (value) => {
      let current = value;
      for (const effect of effects) {
        if (effect.type === "preprocess") {
          const next = effect.transform(current, makeRefinementCtx(ctx));
          if (next instanceof Promise) {
            return next.then((resolved) => runEffectsSync(resolved, effects.indexOf(effect) + 1));
          }
          current = next;
          continue;
        }
        if (effect.type === "transform") {
          const next = effect.transform(current, makeRefinementCtx(ctx));
          if (next instanceof Promise) {
            return next.then((resolved) => runEffectsSync(resolved, effects.indexOf(effect) + 1));
          }
          current = next;
          continue;
        }
        if (effect.type === "refinement") {
          const result = runRefinement(effect, current);
          if (result instanceof Promise) {
            return result.then((ok) => {
              if (ok === false) {
                addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
                if (effect.fatal) return current;
              }
              return runEffectsSync(current, effects.indexOf(effect) + 1);
            });
          }
          if (result === false) {
            addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
            if (effect.fatal) break;
          }
        }
      }
      return current;
    };
    const runEffectsSync = (value, startIndex) => {
      let current = value;
      for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        if (effect.type === "preprocess" || effect.type === "transform") {
          throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
        }
        if (effect.type === "refinement") {
          const result = runRefinement(effect, current);
          if (result instanceof Promise) {
            throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
          }
          if (result === false) {
            addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
            if (effect.fatal) break;
          }
        }
      }
      return current;
    };
    if (isPromise(baseResult)) {
      return baseResult.then(runEffects);
    }
    return runEffects(baseResult);
  }
};

// src/schemas/primitives.ts
function createSimpleType(typeName, expected, predicate, fallback) {
  return new class extends InputFyType {
    _def = { typeName };
    _parse(ctx) {
      if (!predicate(ctx.data, ctx)) {
        addIssue(ctx, { code: "invalid_type", expected, received: ctx.parsedType });
        return fallback;
      }
      return ctx.data;
    }
    _clone() {
      return new this.constructor();
    }
  }();
}
var InputFySymbol = createSimpleType(
  "InputFySymbol",
  "symbol",
  (d) => typeof d === "symbol",
  /* @__PURE__ */ Symbol()
);
var InputFyUndefined = createSimpleType(
  "InputFyUndefined",
  "undefined",
  (d) => d === void 0,
  void 0
);
var InputFyNull = createSimpleType(
  "InputFyNull",
  "null",
  (d) => d === null,
  null
);

// src/schemas/parse-inner.ts
function parseInner(schema, ctx, data, pathSegment) {
  const input = arguments.length >= 3 ? data : ctx.data;
  const depth = ctx.depth + 1;
  if (depth > MAX_PARSE_DEPTH) {
    throw new Error(`Maximum parse depth of ${MAX_PARSE_DEPTH} exceeded`);
  }
  const innerCtx = {
    common: ctx.common,
    path: pathSegment !== void 0 ? [...ctx.path, pathSegment] : ctx.path,
    parent: ctx,
    data: input,
    parsedType: getParsedType(input),
    depth
  };
  return schema._parse(innerCtx);
}

// src/schemas/complex.ts
var NeverCatchall = class extends InputFyType {
  _def = { typeName: "NeverCatchall" };
  _parse(ctx) {
    addIssue(ctx, { code: "invalid_type", expected: "never", received: ctx.parsedType });
    return void 0;
  }
  _clone() {
    return this;
  }
};
var NEVER_CATCHALL = new NeverCatchall();
var InputFyLazy = class _InputFyLazy extends InputFyType {
  _def;
  constructor(getter) {
    super();
    this._def = { typeName: "InputFyLazy", getter };
  }
  get schema() {
    return this._def.getter();
  }
  _parse(ctx) {
    return parseInner(this._def.getter(), ctx);
  }
  _clone() {
    return new _InputFyLazy(this._def.getter);
  }
};
function lazy(getter) {
  return new InputFyLazy(getter);
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

// src/performance/worker.ts
var import_node_url = require("url");
var import_node_path = require("path");

// src/security/paranoid.ts
var HTML_SCRIPT = /<script\b[^>]*>|javascript\s*:|data\s*:\s*text\/html/i;
var HTML_EVENT = /\bon\w+\s*=/i;
var SQL_PATTERNS = [
  /('\s*OR\s+'?\d+'?\s*=\s*'?\d)/i,
  /(;\s*--)/,
  /(UNION\s+SELECT)/i,
  /(DROP\s+TABLE)/i,
  /(INSERT\s+INTO)/i,
  /(DELETE\s+FROM)/i,
  /(UPDATE\s+\w+\s+SET)/i
];
var PATH_TRAVERSAL = /(\.\.[\\/])|([\\/]\.\.[\\/])|(%2e%2e)/i;
var RULES = [
  { kind: "html_script", regex: HTML_SCRIPT, enabled: (o) => o.html !== false },
  { kind: "html_event", regex: HTML_EVENT, enabled: (o) => o.html !== false },
  ...SQL_PATTERNS.map((regex) => ({
    kind: "sql_injection",
    regex,
    enabled: (o) => o.sql !== false
  })),
  { kind: "path_traversal", regex: PATH_TRAVERSAL, enabled: (o) => o.pathTraversal !== false }
];
function stripHtml(value) {
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]+>/g, "").replace(/javascript\s*:/gi, "").replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}
function neutralizeSql(value) {
  return value.replace(/'/g, "''").replace(/;\s*--/g, ";").replace(/UNION\s+SELECT/gi, "UNION SELECT blocked");
}
function scanString(value, path, opts) {
  const found = [];
  for (const rule of RULES) {
    if (!rule.enabled(opts)) continue;
    const match = value.match(rule.regex);
    if (match) {
      found.push({ kind: rule.kind, match: match[0], path });
    }
  }
  return found;
}
function detectSuspiciousPatterns(value, options = {}, path = "") {
  const results = [];
  if (typeof value === "string") {
    return scanString(value, path, options);
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      results.push(...detectSuspiciousPatterns(value[i], options, `${path}[${i}]`));
    }
    return results;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(key)) {
        results.push({
          kind: "prototype_pollution",
          match: key,
          path: path ? `${path}.${key}` : key
        });
        continue;
      }
      results.push(
        ...detectSuspiciousPatterns(val, options, path ? `${path}.${key}` : key)
      );
    }
  }
  return results;
}
function sanitizeString(value, opts) {
  let result = value;
  if (opts.html !== false) result = stripHtml(result);
  if (opts.sql !== false) result = neutralizeSql(result);
  if (opts.pathTraversal !== false) result = result.replace(/\.\.[\\/]/g, "");
  return result;
}
function sanitizeInput(value, options = {}) {
  if (typeof value === "string") {
    return sanitizeString(value, options);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item, options));
  }
  if (value !== null && typeof value === "object") {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [key, val] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      result[key] = sanitizeInput(val, options);
    }
    return result;
  }
  return value;
}
function applyParanoidMode(value, options) {
  const patterns = detectSuspiciousPatterns(value, options);
  if (patterns.length === 0) {
    return { value, patterns, rejected: false };
  }
  if (options.action === "sanitize") {
    return { value: sanitizeInput(value, options), patterns, rejected: false };
  }
  return { value, patterns, rejected: true };
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

// src/integrations/shared.ts
function formatValidationFailure(error) {
  const flat = error.flatten();
  return {
    statusCode: 400,
    body: {
      error: "Validation failed",
      issues: error.issues,
      fieldErrors: flat.fieldErrors
    }
  };
}

// src/integrations/express/index.ts
function resolveInput(req, source) {
  if (typeof source === "function") return source(req);
  switch (source) {
    case "query":
      return req.query;
    case "params":
      return req.params;
    case "headers":
      return req.headers;
    case "body":
    default:
      return req.body;
  }
}
function attachParsed(req, target, property, data) {
  if (target === "body" && property === "body") {
    req.body = data;
    return;
  }
  req[property] = data;
  if (property === "validated" || target === "validated") {
    req.validated = data;
  }
}
function validate(schema, options = {}) {
  const source = options.source ?? "body";
  const statusCode = options.statusCode ?? 400;
  const target = options.target ?? "validated";
  const property = options.property ?? (typeof source === "string" && target !== "validated" ? source : "validated");
  return (req, res, next) => {
    const raw = resolveInput(req, source);
    const result = schema.safeParse(raw);
    if (!result.success) {
      const failure = formatValidationFailure(result.error);
      res.status(statusCode).json({ ...failure.body, statusCode });
      return;
    }
    attachParsed(req, target, property, result.data);
    next();
  };
}
var expressValidate = validate;
function fastifyValidate(schema, options = {}) {
  const middleware = validate(schema, options);
  return {
    preValidation(req, reply, done) {
      middleware(req, reply, done);
    }
  };
}
function koaValidate(schema, options = {}) {
  const source = options.source ?? "body";
  const statusCode = options.statusCode ?? 400;
  const property = options.property ?? "validated";
  return async (ctx, next) => {
    const raw = resolveInput(ctx.request, source);
    const result = schema.safeParse(raw);
    if (!result.success) {
      const failure = formatValidationFailure(result.error);
      ctx.throw(statusCode, { ...failure.body, statusCode });
      return;
    }
    const data = result.data;
    if (property === "validated") ctx.validated = data;
    else if (property === "body") ctx.body = data;
    else ctx[property] = data;
    await next();
  };
}

// src/observability/config.ts
var config = {
  enabled: false,
  serviceName: "inputfy"
};
function getObservabilityConfig() {
  return config;
}
function isObservabilityEnabled() {
  return config.enabled !== false;
}

// src/observability/telemetry.ts
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

// src/security/schema-signature.ts
var import_node_crypto = require("crypto");
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

// src/ecosystem/server/index.ts
function createServerValidator(schema, options = {}) {
  const schemaId = options.schemaId ?? "schema";
  const cache = options.useCache !== false ? createSchemaCache(options.cacheOptions) : null;
  let compiled;
  if (options.useCompile !== false) {
    try {
      compiled = compile(schema);
    } catch {
      compiled = void 0;
    }
  }
  const safeParse = (data) => {
    if (options.observe) {
      return observedSafeParse(schema, data, { schemaId });
    }
    if (options.secure) {
      const result = secureParse(schema, data);
      return result;
    }
    if (compiled) {
      return compiled.validate(data);
    }
    if (cache) {
      return cache.parse(schema, data);
    }
    return schema.safeParse(data);
  };
  return {
    ...compiled !== void 0 ? { compiled } : {},
    safeParse,
    parse(data) {
      const result = safeParse(data);
      if (result.success) return result.data;
      throw result.error;
    },
    async parseAsync(data) {
      if (options.secure) {
        const result = await secureParseAsync(schema, data);
        if (result.success) return result.data;
        throw result.error;
      }
      return schema.parseAsync(data);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cachedParse,
  compile,
  createHealthCheck,
  createHealthCheckHandler,
  createSchemaCache,
  createServerValidator,
  expressValidate,
  fastifyValidate,
  koaValidate,
  observedParse,
  observedSafeParse,
  secureParse,
  secureParseAsync,
  validate
});
