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

export {
  issuesToFieldErrors,
  formatValidationFailure
};
