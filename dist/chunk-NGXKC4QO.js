import {
  InputFyError
} from "./chunk-WKU77X7G.js";
import {
  DANGEROUS_KEYS,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS,
  MAX_PARSE_DEPTH,
  MAX_STRING_LENGTH,
  addIssue,
  childContext,
  createParseContext,
  getParsedType,
  isPromise,
  makeRefinementCtx
} from "./chunk-E7G4F2VH.js";

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
function configureSecurity(options) {
  currentSecurityConfig = {
    ...currentSecurityConfig,
    ...options,
    ...options.paranoidOptions !== void 0 ? { paranoidOptions: options.paranoidOptions } : {}
  };
}
var securityConfig = configureSecurity;
function resetSecurityConfig() {
  currentSecurityConfig = {
    paranoid: false,
    blockUnsafeRegex: true,
    sandboxRefinements: false,
    refinementTimeoutMs: 100
  };
}

// src/security/sandbox.ts
var RefinementSandboxError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RefinementSandboxError";
  }
};
async function sandboxedRefinement(value, check, timeoutMs = 100) {
  let timer;
  try {
    const result = await Promise.race([
      Promise.resolve(check(value)),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new RefinementSandboxError(`Refinement timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      })
    ]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
function sandboxedRefinementSync(value, check, timeoutMs = 100) {
  const start = Date.now();
  const result = check(value);
  if (Date.now() - start > timeoutMs) {
    throw new RefinementSandboxError(`Refinement exceeded ${timeoutMs}ms`);
  }
  return result;
}
var RefinementSandbox = class {
  constructor(timeoutMs = 100) {
    this.timeoutMs = timeoutMs;
  }
  timeoutMs;
  run(check, value) {
    return sandboxedRefinementSync(value, check, this.timeoutMs);
  }
  async runAsync(check, value) {
    return sandboxedRefinement(value, check, this.timeoutMs);
  }
};
function createRefinementSandbox(timeoutMs = 100) {
  return new RefinementSandbox(timeoutMs);
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

// src/security/redos.ts
var NESTED_QUANTIFIER = /(\([^)]*[+*][^)]*\)[+*])|(\([^)]*[+*][^)]*\)\{)/;
var OVERLAPPING_ALTERNATION = /\([^)]*\|[^)]*\)[+*]/;
var LONG_QUANTIFIER = /\{\d{4,},?\d*\}/;
var BACKTRACK_HEAVY = /(\.\*){2,}|(\.\+){2,}|(\.?\\s\*){2,}/;
var UnsafeRegexError = class extends Error {
  analysis;
  constructor(analysis) {
    super(`Unsafe regex detected (${analysis.risk}): ${analysis.reasons.join("; ")}`);
    this.name = "UnsafeRegexError";
    this.analysis = analysis;
  }
};
function analyzeRegex(regex) {
  const source = regex.source;
  const reasons = [];
  let risk = "low";
  if (NESTED_QUANTIFIER.test(source)) {
    reasons.push("Nested quantifiers detected");
    risk = "high";
  }
  if (OVERLAPPING_ALTERNATION.test(source)) {
    reasons.push("Quantified alternation may cause backtracking");
    risk = elevate(risk, "high");
  }
  if (LONG_QUANTIFIER.test(source)) {
    reasons.push("Very large repetition bounds");
    risk = elevate(risk, "medium");
  }
  if (BACKTRACK_HEAVY.test(source)) {
    reasons.push("Multiple greedy wildcards");
    risk = elevate(risk, "medium");
  }
  if (source.length > 500) {
    reasons.push("Regex source exceeds 500 characters");
    risk = elevate(risk, "medium");
  }
  return {
    risk,
    safe: risk !== "high",
    reasons,
    source
  };
}
function elevate(current, next) {
  const order = ["low", "medium", "high"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}
function assertSafeRegex(regex) {
  const analysis = analyzeRegex(regex);
  if (!analysis.safe) {
    throw new UnsafeRegexError(analysis);
  }
}
function isRegexSafe(regex) {
  return analyzeRegex(regex).safe;
}

// src/patterns.ts
var EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/;
var UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
var CUID_REGEX = /^c[a-z0-9]{24}$/;
var CUID2_REGEX = /^[a-z0-9]{2,128}$/;
var ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;
var NANOID_REGEX = /^[A-Za-z0-9_-]{21}$/;
var IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
var BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
var ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
var ISO_TIME_REGEX = /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;
var ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ftp:";
  } catch {
    return false;
  }
}
function isValidJwt(value) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  return parts.every((part) => BASE64_REGEX.test(part.replace(/-/g, "+").replace(/_/g, "/")));
}
function testRegexSafe(regex, value, maxLength = 1e4) {
  if (value.length > maxLength) return false;
  return regex.test(value);
}

// src/utils.ts
function deepClone(value) {
  return cloneValue(value, /* @__PURE__ */ new WeakMap(), 0);
}
function cloneValue(value, seen, depth) {
  if (depth > 128) {
    throw new Error("Maximum clone depth exceeded");
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      throw new Error(`Array length exceeds maximum of ${MAX_ARRAY_LENGTH}`);
    }
    return value.map((item) => cloneValue(item, seen, depth + 1));
  }
  if (value instanceof Map) {
    const map2 = /* @__PURE__ */ new Map();
    seen.set(value, map2);
    for (const [k, v] of value) {
      map2.set(cloneValue(k, seen, depth + 1), cloneValue(v, seen, depth + 1));
    }
    return map2;
  }
  if (value instanceof Set) {
    const set2 = /* @__PURE__ */ new Set();
    seen.set(value, set2);
    for (const v of value) {
      set2.add(cloneValue(v, seen, depth + 1));
    }
    return set2;
  }
  if (seen.has(value)) {
    return seen.get(value);
  }
  const result = /* @__PURE__ */ Object.create(null);
  seen.set(value, result);
  const keys = Object.keys(value);
  if (keys.length > MAX_OBJECT_KEYS) {
    throw new Error(`Object key count exceeds maximum of ${MAX_OBJECT_KEYS}`);
  }
  for (const key of keys) {
    if (DANGEROUS_KEYS.has(key)) continue;
    result[key] = cloneValue(value[key], seen, depth + 1);
  }
  return result;
}
function isSafeKey(key) {
  return !DANGEROUS_KEYS.has(key) && key.length <= 256;
}
function assertSafeString(value, context) {
  if (value.length > MAX_STRING_LENGTH) {
    throw new Error(`${context}: string length exceeds maximum of ${MAX_STRING_LENGTH}`);
  }
}
function getOwnKeys(obj) {
  return Object.keys(obj).filter(isSafeKey);
}
function parseNumberInput(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "") {
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "bigint") return Number(val);
  return null;
}
function parseBooleanInput(val) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0" || lower === "") return false;
  }
  if (typeof val === "number") return val !== 0;
  return null;
}
function parseBigIntInput(val) {
  if (typeof val === "bigint") return val;
  if (typeof val === "number" && Number.isInteger(val)) return BigInt(val);
  if (typeof val === "string" && val.trim() !== "") {
    try {
      return BigInt(val);
    } catch {
      return null;
    }
  }
  return null;
}
function parseDateInput(val) {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const date = new Date(val);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}
function getEnumValues(enumObj) {
  const values = Object.values(enumObj);
  const isNumericEnum = values.some((v) => typeof v === "number");
  if (isNumericEnum) {
    return values.filter((v) => typeof v === "number");
  }
  return values.filter((v) => typeof v === "string");
}
function readonly(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return Object.freeze(value.map(readonly));
  }
  const result = /* @__PURE__ */ Object.create(null);
  for (const [k, v] of Object.entries(value)) {
    result[k] = readonly(v);
  }
  return Object.freeze(result);
}

// src/schemas/primitives.ts
var InputFyString = class _InputFyString extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce && typeof data !== "string") {
      if (data == null) {
        addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
        return "";
      }
      data = String(data);
    }
    if (typeof data !== "string") {
      addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
      return "";
    }
    assertSafeString(data, "string validation");
    let result = data;
    for (const check of this._def.checks) {
      if (check.kind === "trim") {
        result = result.trim();
        continue;
      }
      if (check.kind === "toLowerCase") {
        result = result.toLowerCase();
        continue;
      }
      if (check.kind === "toUpperCase") {
        result = result.toUpperCase();
        continue;
      }
      const valid = runStringCheck(result, check);
      if (!valid) {
        if (check.kind === "min" || check.kind === "max" || check.kind === "length") {
          addIssue(ctx, {
            code: check.kind === "min" ? "too_small" : "too_big",
            minimum: check.kind === "min" || check.kind === "length" ? check.value : 0,
            maximum: check.kind === "max" || check.kind === "length" ? check.value : 0,
            inclusive: true,
            exact: check.kind === "length",
            type: "string",
            message: check.message ?? defaultStringMessage(check)
          });
        } else {
          addIssue(ctx, {
            code: "invalid_string",
            validation: checkToValidation(check),
            message: check.message ?? `Invalid string validation: ${check.kind}`
          });
        }
      }
    }
    return result;
  }
  _clone() {
    return new _InputFyString({ ...this._def, checks: [...this._def.checks] });
  }
  min(len, message) {
    return this._addCheck({ kind: "min", value: len, message });
  }
  max(len, message) {
    return this._addCheck({ kind: "max", value: len, message });
  }
  length(len, message) {
    return this._addCheck({ kind: "length", value: len, message });
  }
  email(message) {
    return this._addCheck({ kind: "email", message });
  }
  url(message) {
    return this._addCheck({ kind: "url", message });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", message });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", message });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", message });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", message });
  }
  regex(regex, message) {
    const sec = getSecurityConfig();
    if (sec.blockUnsafeRegex !== false) {
      const analysis = analyzeRegex(regex);
      if (!analysis.safe) {
        sec.auditLog?.log({
          type: "redos_blocked",
          message: `Unsafe regex blocked: ${analysis.reasons.join(", ")}`,
          pattern: regex.source
        });
        throw new UnsafeRegexError(analysis);
      }
    }
    return this._addCheck({ kind: "regex", regex, message });
  }
  includes(value, message) {
    return this._addCheck({ kind: "includes", value, message });
  }
  startsWith(value, message) {
    return this._addCheck({ kind: "startsWith", value, message });
  }
  endsWith(value, message) {
    return this._addCheck({ kind: "endsWith", value, message });
  }
  datetime(message) {
    return this._addCheck({ kind: "datetime", message });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", version: options?.version, message: options?.message });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", message });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", message });
  }
  jwt(message) {
    return this._addCheck({ kind: "jwt", message });
  }
  trim() {
    return this._addCheck({ kind: "trim" });
  }
  toLowerCase() {
    return this._addCheck({ kind: "toLowerCase" });
  }
  toUpperCase() {
    return this._addCheck({ kind: "toUpperCase" });
  }
  _addCheck(check) {
    const cloned = this._clone();
    cloned._def.checks.push(check);
    return cloned;
  }
};
function runStringCheck(value, check) {
  switch (check.kind) {
    case "min":
      return value.length >= check.value;
    case "max":
      return value.length <= check.value;
    case "length":
      return value.length === check.value;
    case "email":
      return testRegexSafe(EMAIL_REGEX, value);
    case "url":
      return isValidUrl(value);
    case "uuid":
      return testRegexSafe(UUID_REGEX, value);
    case "cuid":
      return testRegexSafe(CUID_REGEX, value);
    case "cuid2":
      return testRegexSafe(CUID2_REGEX, value);
    case "ulid":
      return testRegexSafe(ULID_REGEX, value);
    case "regex":
      return testRegexSafe(check.regex, value);
    case "includes":
      return value.includes(check.value);
    case "startsWith":
      return value.startsWith(check.value);
    case "endsWith":
      return value.endsWith(check.value);
    case "datetime":
      return !Number.isNaN(Date.parse(value));
    case "ip":
      return true;
    // simplified — full IP validation in patterns
    case "base64":
      return testRegexSafe(BASE64_REGEX, value);
    case "nanoid":
      return testRegexSafe(NANOID_REGEX, value);
    case "jwt":
      return isValidJwt(value);
    default:
      return true;
  }
}
function checkToValidation(check) {
  if (check.kind === "regex") return "regex";
  if (check.kind === "jwt") return "regex";
  if (check.kind === "ip") return "ip";
  return check.kind;
}
function defaultStringMessage(check) {
  if (check.kind === "min") return `String must contain at least ${check.value} character(s)`;
  if (check.kind === "max") return `String must contain at most ${check.value} character(s)`;
  if (check.kind === "length") return `String must contain exactly ${check.value} character(s)`;
  return "Invalid string";
}
var InputFyNumber = class _InputFyNumber extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseNumberInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "number", received: ctx.parsedType });
        return 0;
      }
      data = coerced;
    }
    if (typeof data !== "number" || Number.isNaN(data)) {
      addIssue(ctx, { code: "invalid_type", expected: "number", received: ctx.parsedType });
      return 0;
    }
    let value = data;
    for (const check of this._def.checks) {
      if (!runNumberCheck(value, check)) {
        if (check.kind === "finite") {
          addIssue(ctx, { code: "not_finite", ...check.message ? { message: check.message } : {} });
        } else if (check.kind === "multipleOf") {
          addIssue(ctx, {
            code: "not_multiple_of",
            multipleOf: check.value,
            ...check.message ? { message: check.message } : {}
          });
        } else if (check.kind === "int") {
          addIssue(ctx, { code: "invalid_type", expected: "integer", received: "number" });
        } else {
          addIssue(ctx, {
            code: check.kind === "min" ? "too_small" : "too_big",
            minimum: "value" in check ? check.value : 0,
            maximum: "value" in check ? check.value : 0,
            inclusive: "inclusive" in check ? check.inclusive : true,
            type: "number",
            message: check.message
          });
        }
      }
    }
    return value;
  }
  _clone() {
    return new _InputFyNumber({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    return this._addCheck({ kind: "min", value, inclusive: true, message });
  }
  max(value, message) {
    return this._addCheck({ kind: "max", value, inclusive: true, message });
  }
  gt(value, message) {
    return this._addCheck({ kind: "min", value, inclusive: false, message });
  }
  gte(value, message) {
    return this.min(value, message);
  }
  lt(value, message) {
    return this._addCheck({ kind: "max", value, inclusive: false, message });
  }
  lte(value, message) {
    return this.max(value, message);
  }
  int(message) {
    return this._addCheck({ kind: "int", message });
  }
  positive(message) {
    return this._addCheck({ kind: "positive", message });
  }
  negative(message) {
    return this._addCheck({ kind: "negative", message });
  }
  nonnegative(message) {
    return this._addCheck({ kind: "nonnegative", message });
  }
  nonpositive(message) {
    return this._addCheck({ kind: "nonpositive", message });
  }
  multipleOf(value, message) {
    return this._addCheck({ kind: "multipleOf", value, message });
  }
  finite(message) {
    return this._addCheck({ kind: "finite", message });
  }
  step(value, message) {
    return this.multipleOf(value, message);
  }
  _addCheck(check) {
    const cloned = this._clone();
    cloned._def.checks.push(check);
    return cloned;
  }
};
function runNumberCheck(value, check) {
  switch (check.kind) {
    case "min":
      return check.inclusive ? value >= check.value : value > check.value;
    case "max":
      return check.inclusive ? value <= check.value : value < check.value;
    case "int":
      return Number.isInteger(value);
    case "multipleOf":
      return value % check.value === 0;
    case "finite":
      return Number.isFinite(value);
    case "positive":
      return value > 0;
    case "negative":
      return value < 0;
    case "nonnegative":
      return value >= 0;
    case "nonpositive":
      return value <= 0;
    default:
      return true;
  }
}
var InputFyBoolean = class _InputFyBoolean extends InputFyType {
  _def;
  constructor(def = { typeName: "InputFyBoolean" }) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseBooleanInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "boolean", received: ctx.parsedType });
        return false;
      }
      data = coerced;
    }
    if (typeof data !== "boolean") {
      addIssue(ctx, { code: "invalid_type", expected: "boolean", received: ctx.parsedType });
      return false;
    }
    return data;
  }
  _clone() {
    return new _InputFyBoolean({ ...this._def });
  }
};
var InputFyBigInt = class _InputFyBigInt extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyBigInt",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseBigIntInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
        return 0n;
      }
      data = coerced;
    }
    if (typeof data !== "bigint") {
      addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
      return 0n;
    }
    for (const check of this._def.checks) {
      if (!runBigIntCheck(data, check)) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value,
          maximum: check.value,
          inclusive: check.inclusive,
          type: "bigint",
          message: check.message
        });
      }
    }
    return data;
  }
  _clone() {
    return new _InputFyBigInt({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, inclusive: true, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, inclusive: true, message });
    return c;
  }
};
function runBigIntCheck(value, check) {
  if (check.kind === "min") return check.inclusive ? value >= check.value : value > check.value;
  return check.inclusive ? value <= check.value : value < check.value;
}
var InputFyDate = class _InputFyDate extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyDate",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseDateInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_date" });
        return /* @__PURE__ */ new Date(NaN);
      }
      data = coerced;
    }
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      addIssue(ctx, { code: "invalid_date" });
      return /* @__PURE__ */ new Date(NaN);
    }
    for (const check of this._def.checks) {
      const cmp = check.kind === "min" ? data >= check.value : data <= check.value;
      if (!cmp) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value.getTime(),
          maximum: check.value.getTime(),
          inclusive: true,
          type: "date",
          message: check.message
        });
      }
    }
    return new Date(data.getTime());
  }
  _clone() {
    return new _InputFyDate({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, message });
    return c;
  }
};
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
var InputFyAny = class _InputFyAny extends InputFyType {
  _def = { typeName: "InputFyAny" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyAny();
  }
};
var InputFyUnknown = class _InputFyUnknown extends InputFyType {
  _def = { typeName: "InputFyUnknown" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyUnknown();
  }
};
var InputFyNever = class _InputFyNever extends InputFyType {
  _def = { typeName: "InputFyNever" };
  _parse(ctx) {
    addIssue(ctx, { code: "invalid_type", expected: "never", received: ctx.parsedType });
    return void 0;
  }
  _clone() {
    return new _InputFyNever();
  }
};
var InputFyVoid = class _InputFyVoid extends InputFyType {
  _def = { typeName: "InputFyVoid" };
  _parse(ctx) {
    if (ctx.data !== void 0) {
      addIssue(ctx, { code: "invalid_type", expected: "void", received: ctx.parsedType });
    }
  }
  _clone() {
    return new _InputFyVoid();
  }
};
var InputFyNaN = class _InputFyNaN extends InputFyType {
  _def = { typeName: "InputFyNaN" };
  _parse(ctx) {
    if (typeof ctx.data !== "number" || !Number.isNaN(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "nan", received: ctx.parsedType });
      return NaN;
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNaN();
  }
};
var InputFyLiteral = class _InputFyLiteral extends InputFyType {
  _def;
  constructor(value) {
    super();
    this._def = { typeName: "InputFyLiteral", value };
  }
  _parse(ctx) {
    if (ctx.data !== this._def.value) {
      addIssue(ctx, {
        code: "invalid_literal",
        expected: this._def.value,
        received: ctx.data
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyLiteral(this._def.value);
  }
};
var InputFyEnum = class _InputFyEnum extends InputFyType {
  _def;
  constructor(values) {
    super();
    this._def = { typeName: "InputFyEnum", values };
  }
  get enum() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const v of this._def.values) result[v] = v;
    return result;
  }
  get options() {
    return this._def.values;
  }
  _parse(ctx) {
    if (typeof ctx.data !== "string" || !this._def.values.includes(ctx.data)) {
      addIssue(ctx, {
        code: "invalid_enum_value",
        options: this._def.values,
        received: ctx.data
      });
      return this._def.values[0];
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyEnum(this._def.values);
  }
  extract(values) {
    const filtered = this._def.values.filter((v) => values.includes(v));
    return new _InputFyEnum(filtered);
  }
  exclude(values) {
    const filtered = this._def.values.filter((v) => !values.includes(v));
    return new _InputFyEnum(filtered);
  }
};
var InputFyNativeEnum = class _InputFyNativeEnum extends InputFyType {
  _def;
  constructor(enumObj) {
    super();
    this._def = { typeName: "InputFyNativeEnum", enum: enumObj };
  }
  _parse(ctx) {
    const values = getEnumValues(this._def.enum);
    if (typeof ctx.data !== "string" && typeof ctx.data !== "number" || !values.includes(ctx.data)) {
      addIssue(ctx, {
        code: "invalid_enum_value",
        options: values,
        received: ctx.data
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNativeEnum(this._def.enum);
  }
};
var InputFyInstanceof = class _InputFyInstanceof extends InputFyType {
  _def;
  constructor(cls) {
    super();
    this._def = { typeName: "InputFyInstanceof", cls };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof this._def.cls)) {
      addIssue(ctx, {
        code: "invalid_type",
        expected: this._def.cls.name,
        received: ctx.parsedType
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyInstanceof(this._def.cls);
  }
};
var InputFyCustom = class _InputFyCustom extends InputFyType {
  _def;
  constructor(fn, message) {
    super();
    this._def = { typeName: "InputFyCustom", fn, message };
  }
  _parse(ctx) {
    if (!this._def.fn(ctx.data)) {
      addIssue(ctx, { code: "custom", message: this._def.message ?? "Invalid input" });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyCustom(this._def.fn, this._def.message);
  }
};

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
var InputFyArray = class _InputFyArray extends InputFyType {
  _def;
  constructor(type, constraints = {}) {
    super();
    this._def = {
      typeName: "InputFyArray",
      type,
      minLength: constraints.minLength ?? null,
      maxLength: constraints.maxLength ?? null,
      exactLength: constraints.exactLength ?? null
    };
  }
  get element() {
    return this._def.type;
  }
  _parse(ctx) {
    if (!Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "array", received: ctx.parsedType });
      return [];
    }
    if (ctx.data.length > MAX_ARRAY_LENGTH) {
      addIssue(ctx, {
        code: "too_big",
        maximum: MAX_ARRAY_LENGTH,
        inclusive: true,
        type: "array",
        message: `Array size exceeds maximum of ${MAX_ARRAY_LENGTH}`
      });
      return [];
    }
    const len = ctx.data.length;
    if (this._def.exactLength !== null && len !== this._def.exactLength) {
      addIssue(ctx, {
        code: "too_small",
        minimum: this._def.exactLength,
        inclusive: true,
        exact: true,
        type: "array"
      });
    }
    if (this._def.minLength !== null && len < this._def.minLength) {
      addIssue(ctx, {
        code: "too_small",
        minimum: this._def.minLength,
        inclusive: true,
        type: "array"
      });
    }
    if (this._def.maxLength !== null && len > this._def.maxLength) {
      addIssue(ctx, {
        code: "too_big",
        maximum: this._def.maxLength,
        inclusive: true,
        type: "array"
      });
    }
    const result = [];
    for (let i = 0; i < ctx.data.length; i++) {
      result.push(parseInner(this._def.type, ctx, ctx.data[i], i));
    }
    return result;
  }
  _clone() {
    return new _InputFyArray(this._def.type, {
      minLength: this._def.minLength,
      maxLength: this._def.maxLength,
      exactLength: this._def.exactLength
    });
  }
  min(length) {
    const c = this._clone();
    c._def.minLength = length;
    return c;
  }
  max(length) {
    const c = this._clone();
    c._def.maxLength = length;
    return c;
  }
  length(length) {
    const c = this._clone();
    c._def.exactLength = length;
    return c;
  }
  nonempty() {
    return this.min(1);
  }
};
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
function createNeverCatchall() {
  return NEVER_CATCHALL;
}
var InputFyObject = class _InputFyObject extends InputFyType {
  _def;
  constructor(shape, params = {}) {
    super();
    this._def = {
      typeName: "InputFyObject",
      shape: () => shape,
      unknownKeys: params.unknownKeys ?? "strip",
      catchall: params.catchall ?? createNeverCatchall()
    };
  }
  get shape() {
    return this._def.shape();
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null || Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return {};
    }
    const input = ctx.data;
    const keys = getOwnKeys(input);
    if (keys.length > MAX_OBJECT_KEYS) {
      addIssue(ctx, {
        code: "custom",
        message: `Object key count exceeds maximum of ${MAX_OBJECT_KEYS}`
      });
      return {};
    }
    const shape = this._def.shape();
    const shapeKeys = new Set(Object.keys(shape));
    const result = /* @__PURE__ */ Object.create(null);
    for (const key of Object.keys(shape)) {
      const value = Object.prototype.hasOwnProperty.call(input, key) ? input[key] : void 0;
      result[key] = parseInner(shape[key], ctx, value, key);
    }
    const unrecognized = [];
    for (const key of keys) {
      if (!shapeKeys.has(key)) {
        if (this._def.unknownKeys === "strict") {
          unrecognized.push(key);
        } else if (this._def.unknownKeys === "passthrough") {
          result[key] = input[key];
        }
      }
    }
    if (unrecognized.length > 0) {
      addIssue(ctx, { code: "unrecognized_keys", keys: unrecognized });
    }
    return result;
  }
  _clone() {
    return new _InputFyObject(this._def.shape(), {
      unknownKeys: this._def.unknownKeys,
      catchall: this._def.catchall
    });
  }
  extend(shape) {
    return new _InputFyObject({ ...this._def.shape(), ...shape }, {
      unknownKeys: this._def.unknownKeys,
      catchall: this._def.catchall
    });
  }
  merge(other) {
    return this.extend(other._def.shape());
  }
  pick(mask) {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const key of Object.keys(mask)) {
      if (mask[key]) newShape[key] = this._def.shape()[key];
    }
    return new _InputFyObject(newShape);
  }
  omit(mask) {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const [key, schema] of Object.entries(this._def.shape())) {
      if (!mask[key]) newShape[key] = schema;
    }
    return new _InputFyObject(newShape);
  }
  partial() {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const [key, schema] of Object.entries(this._def.shape())) {
      newShape[key] = schema.optional();
    }
    return new _InputFyObject(newShape);
  }
  required() {
    return this;
  }
  strict() {
    const c = this._clone();
    c._def.unknownKeys = "strict";
    return c;
  }
  strip() {
    const c = this._clone();
    c._def.unknownKeys = "strip";
    return c;
  }
  passthrough() {
    const c = this._clone();
    c._def.unknownKeys = "passthrough";
    return c;
  }
  catchall(schema) {
    const c = this._clone();
    c._def.catchall = schema;
    return c;
  }
  keyof() {
    const keys = Object.keys(this._def.shape());
    return new InputFyEnum(keys);
  }
};
var InputFyTuple = class _InputFyTuple extends InputFyType {
  _def;
  constructor(items, rest = null) {
    super();
    this._def = { typeName: "InputFyTuple", items, rest };
  }
  _parse(ctx) {
    if (!Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "array", received: ctx.parsedType });
      return [];
    }
    const items = this._def.items;
    const data = ctx.data;
    if (data.length < items.length) {
      addIssue(ctx, {
        code: "too_small",
        minimum: items.length,
        inclusive: true,
        type: "array"
      });
    }
    const result = [];
    for (let i = 0; i < items.length; i++) {
      result.push(parseInner(items[i], childContext(ctx, data[i], i)));
    }
    if (this._def.rest) {
      for (let i = items.length; i < data.length; i++) {
        result.push(parseInner(this._def.rest, childContext(ctx, data[i], i)));
      }
    } else if (data.length > items.length) {
      addIssue(ctx, {
        code: "too_big",
        maximum: items.length,
        inclusive: true,
        type: "array"
      });
    }
    return result;
  }
  _clone() {
    return new _InputFyTuple(this._def.items, this._def.rest);
  }
  rest(rest) {
    return new _InputFyTuple(this._def.items, rest);
  }
};
var InputFyUnion = class _InputFyUnion extends InputFyType {
  _def;
  constructor(options) {
    super();
    this._def = { typeName: "InputFyUnion", options };
  }
  get options() {
    return this._def.options;
  }
  _parse(ctx) {
    const errors = [];
    const startIssueCount = ctx.common.issues.length;
    for (const option of this._def.options) {
      const optionCtx = childContext(ctx, ctx.data);
      optionCtx.common = { ...ctx.common, issues: [] };
      const result = option._parse(optionCtx);
      if (optionCtx.common.issues.length === 0) {
        ctx.common.issues.length = startIssueCount;
        return result;
      }
      errors.push(new InputFyError(optionCtx.common.issues));
    }
    ctx.common.issues.length = startIssueCount;
    addIssue(ctx, { code: "invalid_union", unionErrors: errors, message: "Invalid input" });
    return ctx.data;
  }
  _clone() {
    const cloned = new _InputFyUnion(this._def.options);
    cloned._def = { ...this._def, options: this._def.options };
    return cloned;
  }
};
var InputFyDiscriminatedUnion = class _InputFyDiscriminatedUnion extends InputFyType {
  _def;
  constructor(discriminator, options) {
    super();
    this._def = { typeName: "InputFyDiscriminatedUnion", discriminator, options };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return ctx.data;
    }
    const discriminatorValue = ctx.data[this._def.discriminator];
    const option = this._def.options.find((opt) => {
      const field = opt.shape[this._def.discriminator];
      if (!field || field._def.typeName !== "InputFyLiteral") return false;
      return field._def.value === discriminatorValue;
    });
    if (!option) {
      const values = this._def.options.map((opt) => {
        const field = opt.shape[this._def.discriminator];
        return field ? field._def.value : "";
      });
      addIssue(ctx, {
        code: "invalid_union_discriminator",
        options: values,
        message: `Invalid discriminator value. Expected ${values.map(String).join(" | ")}`
      });
      return ctx.data;
    }
    return parseInner(option, ctx);
  }
  _clone() {
    return new _InputFyDiscriminatedUnion(this._def.discriminator, this._def.options);
  }
};
var InputFyIntersection = class _InputFyIntersection extends InputFyType {
  _def;
  constructor(left, right) {
    super();
    this._def = { typeName: "InputFyIntersection", left, right };
  }
  _parse(ctx) {
    const leftCtx = childContext(ctx, ctx.data);
    leftCtx.common.issues = [...ctx.common.issues];
    const left = this._def.left._parse(leftCtx);
    const rightCtx = childContext(ctx, ctx.data);
    rightCtx.common.issues = [...ctx.common.issues];
    const right = this._def.right._parse(rightCtx);
    ctx.common.issues = [...leftCtx.common.issues, ...rightCtx.common.issues.filter(
      (i) => !leftCtx.common.issues.includes(i)
    )];
    if (ctx.common.issues.length > 0) {
      addIssue(ctx, { code: "invalid_intersection_types", message: "Invalid intersection" });
    }
    if (typeof left === "object" && left !== null && typeof right === "object" && right !== null && !Array.isArray(left) && !Array.isArray(right)) {
      return { ...left, ...right };
    }
    return left;
  }
  _clone() {
    return new _InputFyIntersection(this._def.left, this._def.right);
  }
};
var InputFyRecord = class _InputFyRecord extends InputFyType {
  _def;
  constructor(keyType, valueType) {
    super();
    this._def = { typeName: "InputFyRecord", keyType, valueType };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null || Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return {};
    }
    const result = /* @__PURE__ */ Object.create(null);
    for (const [key, value] of Object.entries(ctx.data)) {
      parseInner(this._def.keyType, childContext(ctx, key, key));
      result[key] = parseInner(this._def.valueType, childContext(ctx, value, key));
    }
    return result;
  }
  _clone() {
    return new _InputFyRecord(this._def.keyType, this._def.valueType);
  }
};
var InputFyMap = class _InputFyMap extends InputFyType {
  _def;
  constructor(keyType, valueType) {
    super();
    this._def = { typeName: "InputFyMap", keyType, valueType };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Map)) {
      addIssue(ctx, { code: "invalid_type", expected: "map", received: ctx.parsedType });
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    let index = 0;
    for (const [key, value] of ctx.data.entries()) {
      const parsedKey = parseInner(this._def.keyType, childContext(ctx, key, index));
      const parsedValue = parseInner(this._def.valueType, childContext(ctx, value, index));
      result.set(parsedKey, parsedValue);
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFyMap(this._def.keyType, this._def.valueType);
  }
};
var InputFySet = class _InputFySet extends InputFyType {
  _def;
  constructor(valueType, constraints = {}) {
    super();
    this._def = {
      typeName: "InputFySet",
      valueType,
      minSize: constraints.minSize ?? null,
      maxSize: constraints.maxSize ?? null
    };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Set)) {
      addIssue(ctx, { code: "invalid_type", expected: "set", received: ctx.parsedType });
      return /* @__PURE__ */ new Set();
    }
    const size = ctx.data.size;
    if (this._def.minSize !== null && size < this._def.minSize) {
      addIssue(ctx, { code: "too_small", minimum: this._def.minSize, inclusive: true, type: "set" });
    }
    if (this._def.maxSize !== null && size > this._def.maxSize) {
      addIssue(ctx, { code: "too_big", maximum: this._def.maxSize, inclusive: true, type: "set" });
    }
    const result = /* @__PURE__ */ new Set();
    let index = 0;
    for (const value of ctx.data.values()) {
      result.add(parseInner(this._def.valueType, childContext(ctx, value, index)));
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFySet(this._def.valueType, {
      minSize: this._def.minSize,
      maxSize: this._def.maxSize
    });
  }
  min(size) {
    const c = this._clone();
    c._def.minSize = size;
    return c;
  }
  max(size) {
    const c = this._clone();
    c._def.maxSize = size;
    return c;
  }
  size(size) {
    return this.min(size).max(size);
  }
  nonempty() {
    return this.min(1);
  }
};
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
var InputFyPromise = class _InputFyPromise extends InputFyType {
  _def;
  constructor(type) {
    super();
    this._def = { typeName: "InputFyPromise", type };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Promise)) {
      addIssue(ctx, { code: "invalid_type", expected: "promise", received: ctx.parsedType });
      return Promise.resolve(void 0);
    }
    return ctx.data.then((value) => {
      const innerCtx = childContext(ctx, value);
      return parseInner(this._def.type, innerCtx);
    });
  }
  _clone() {
    return new _InputFyPromise(this._def.type);
  }
};
var InputFyFunction = class _InputFyFunction extends InputFyType {
  _def;
  constructor(args, returns) {
    super();
    this._def = {
      typeName: "InputFyFunction",
      args: args ?? new InputFyTuple([]),
      returns: returns ?? void 0
    };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "function") {
      addIssue(ctx, { code: "invalid_type", expected: "function", received: ctx.parsedType });
      return (() => void 0);
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyFunction(this._def.args, this._def.returns);
  }
  args(args) {
    return new _InputFyFunction(args, this._def.returns);
  }
  returns(returns) {
    return new _InputFyFunction(this._def.args, returns);
  }
  implement(fn) {
    return ((...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = fn(...argsResult.data);
      const returnResult = this._def.returns.safeParse(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
  }
  implementAsync(fn) {
    return (async (...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = await fn(...argsResult.data);
      const returnResult = await this._def.returns.safeParseAsync(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
  }
};
var InputFyPipeline = class _InputFyPipeline extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    const intermediate = parseInner(this._def.in, ctx);
    if (ctx.common.issues.length > 0) return intermediate;
    return parseInner(this._def.out, childContext(ctx, intermediate));
  }
  _clone() {
    return new _InputFyPipeline({ ...this._def });
  }
};
var InputFyPreprocess = class _InputFyPreprocess extends InputFyType {
  _def;
  constructor(preprocess2, schema) {
    super();
    this._def = { typeName: "InputFyPreprocess", preprocess: preprocess2, schema };
  }
  _parse(ctx) {
    const preprocessed = this._def.preprocess(ctx.data);
    return parseInner(this._def.schema, childContext(ctx, preprocessed));
  }
  _clone() {
    return new _InputFyPreprocess(this._def.preprocess, this._def.schema);
  }
};
function array(schema) {
  return new InputFyArray(schema);
}
function object(shape) {
  return new InputFyObject(shape);
}
function strictObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "strict" });
}
function looseObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "passthrough" });
}
function tuple(items) {
  return new InputFyTuple(items);
}
function union(options) {
  return new InputFyUnion(options);
}
function discriminatedUnion(discriminator, options) {
  return new InputFyDiscriminatedUnion(discriminator, options);
}
function intersection(left, right) {
  return new InputFyIntersection(left, right);
}
function record(keyOrValue, maybeValue) {
  if (maybeValue !== void 0) {
    return new InputFyRecord(keyOrValue, maybeValue);
  }
  return new InputFyRecord(new InputFyString({ typeName: "InputFyString", checks: [] }), keyOrValue);
}
function map(keyType, valueType) {
  return new InputFyMap(keyType, valueType);
}
function set(valueType) {
  return new InputFySet(valueType);
}
function lazy(getter) {
  return new InputFyLazy(getter);
}
function promise(schema) {
  return new InputFyPromise(schema);
}
function preprocess(preprocess2, schema) {
  return new InputFyPreprocess(preprocess2, schema);
}
function _function() {
  return new InputFyFunction();
}
function pipeline(inSchema, outSchema) {
  return new InputFyPipeline({ in: inSchema, out: outSchema, typeName: "InputFyPipeline" });
}

export {
  getSecurityConfig,
  configureSecurity,
  securityConfig,
  resetSecurityConfig,
  RefinementSandboxError,
  createRefinementSandbox,
  InputFyType,
  readonly,
  parseInner,
  EMAIL_REGEX,
  UUID_REGEX,
  IPV4_REGEX,
  ISO_DATE_REGEX,
  ISO_TIME_REGEX,
  ISO_DATETIME_REGEX,
  testRegexSafe,
  UnsafeRegexError,
  analyzeRegex,
  assertSafeRegex,
  isRegexSafe,
  InputFyString,
  InputFyNumber,
  InputFyBoolean,
  InputFyBigInt,
  InputFyDate,
  InputFySymbol,
  InputFyUndefined,
  InputFyNull,
  InputFyAny,
  InputFyUnknown,
  InputFyNever,
  InputFyVoid,
  InputFyNaN,
  InputFyLiteral,
  InputFyEnum,
  InputFyNativeEnum,
  InputFyInstanceof,
  InputFyCustom,
  InputFyArray,
  InputFyObject,
  InputFyTuple,
  InputFyUnion,
  InputFyLazy,
  InputFyFunction,
  InputFyPipeline,
  array,
  object,
  strictObject,
  looseObject,
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
  _function,
  pipeline
};
