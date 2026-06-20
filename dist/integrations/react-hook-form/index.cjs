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

// src/integrations/react-hook-form/index.ts
var react_hook_form_exports = {};
__export(react_hook_form_exports, {
  inputfyHookFormResolver: () => inputfyHookFormResolver,
  inputfyResolver: () => inputfyResolver
});
module.exports = __toCommonJS(react_hook_form_exports);

// src/integrations/shared.ts
function issuesToFieldErrors(issues) {
  const root = /* @__PURE__ */ Object.create(null);
  for (const issue of issues) {
    setNestedFieldError(root, issue.path.map(String), issue.message);
  }
  return flattenFieldErrors(root);
}
function setNestedFieldError(node, path, message) {
  if (path.length === 0) {
    node["_errors"] = [{ type: "validation", message }];
    return;
  }
  const [head, ...rest] = path;
  if (!head) return;
  if (rest.length === 0) {
    node[head] = { type: "validation", message };
    return;
  }
  if (!node[head] || typeof node[head] !== "object" || Array.isArray(node[head])) {
    node[head] = /* @__PURE__ */ Object.create(null);
  }
  setNestedFieldError(node[head], rest, message);
}
function flattenFieldErrors(node) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of Object.entries(node)) {
    if (key === "_errors" && Array.isArray(value)) {
      const first = value[0];
      if (first) out["root"] = first;
      continue;
    }
    if (value && typeof value === "object" && "type" in value && "message" in value) {
      out[key] = value;
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = flattenFieldErrors(value);
      for (const [nestedKey, nestedVal] of Object.entries(nested)) {
        out[`${key}.${nestedKey}`] = nestedVal;
      }
    }
  }
  return out;
}

// src/integrations/react-hook-form/index.ts
function buildErrors(issues) {
  return issuesToFieldErrors(
    issues.map((i) => ({
      code: "custom",
      message: i.message,
      path: i.path
    }))
  );
}
function inputfyResolver(schema, _options) {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    return {
      values: {},
      errors: buildErrors(result.error.issues)
    };
  };
}
var inputfyHookFormResolver = inputfyResolver;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  inputfyHookFormResolver,
  inputfyResolver
});
