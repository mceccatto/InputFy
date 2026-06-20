import {
  DANGEROUS_KEYS
} from "./chunk-E7G4F2VH.js";

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

export {
  detectSuspiciousPatterns,
  sanitizeInput,
  applyParanoidMode
};
