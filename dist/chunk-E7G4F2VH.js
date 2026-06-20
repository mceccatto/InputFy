import {
  getLocaleBundle
} from "./chunk-GMXKR4ET.js";

// src/i18n/config.ts
var globalConfig = {
  locale: "en",
  defaultSeverity: "error",
  suggestions: true
};
function getGlobalConfig() {
  return globalConfig;
}
function config(options) {
  globalConfig = {
    ...globalConfig,
    ...options,
    ...options.errorMap !== void 0 ? { errorMap: options.errorMap } : {}
  };
}
function setLocale(locale) {
  globalConfig = { ...globalConfig, locale };
}
function getLocale() {
  return globalConfig.locale ?? "en";
}
function resetConfig() {
  globalConfig = {
    locale: "en",
    defaultSeverity: "error",
    suggestions: true
  };
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
var MAX_OBJECT_KEYS = 1e4;
var MAX_ARRAY_LENGTH = 1e5;
var MAX_STRING_LENGTH = 1e7;
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
function childContext(ctx, data, pathSegment) {
  const depth = ctx.depth + 1;
  if (depth > MAX_PARSE_DEPTH) {
    throw new Error(`Maximum parse depth of ${MAX_PARSE_DEPTH} exceeded`);
  }
  return {
    common: ctx.common,
    path: pathSegment !== void 0 ? [...ctx.path, pathSegment] : ctx.path,
    parent: ctx,
    data,
    parsedType: getParsedType(data),
    depth
  };
}
function makeRefinementCtx(ctx) {
  return {
    path: ctx.path,
    addIssue: (issue) => addIssue(ctx, issue)
  };
}

export {
  config,
  setLocale,
  getLocale,
  resetConfig,
  getIssueSuggestion,
  resolveIssueSeverity,
  MAX_PARSE_DEPTH,
  MAX_OBJECT_KEYS,
  MAX_ARRAY_LENGTH,
  MAX_STRING_LENGTH,
  DANGEROUS_KEYS,
  createParseContext,
  getParsedType,
  isPromise,
  addIssue,
  childContext,
  makeRefinementCtx
};
