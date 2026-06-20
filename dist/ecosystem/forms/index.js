import {
  inputfyHookFormResolver,
  inputfyResolver
} from "../../chunk-UTREZU63.js";
import {
  aggregateBySeverity,
  countBySeverity,
  formatErrorHTML
} from "../../chunk-QF4SUL76.js";
import {
  issuesToFieldErrors
} from "../../chunk-237IRJ4U.js";
import "../../chunk-E7G4F2VH.js";
import "../../chunk-GMXKR4ET.js";
import "../../chunk-MCKGQKYU.js";

// src/ecosystem/forms/helpers.ts
function errorToFormFields(error) {
  const fields = /* @__PURE__ */ Object.create(null);
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "root";
    if (!fields[key]) {
      fields[key] = { type: "validation", message: issue.message };
    }
  }
  return fields;
}
function issuesToNestedFormErrors(issues) {
  const root = /* @__PURE__ */ Object.create(null);
  for (const issue of issues) {
    let node = root;
    const path = issue.path.map(String);
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (i === path.length - 1) {
        node[segment] = { type: "validation", message: issue.message };
      } else {
        if (!node[segment] || typeof node[segment] !== "object") {
          node[segment] = /* @__PURE__ */ Object.create(null);
        }
        node = node[segment];
      }
    }
    if (path.length === 0) {
      root["root"] = { type: "validation", message: issue.message };
    }
  }
  return root;
}
function groupFormErrorsByField(error) {
  const grouped = /* @__PURE__ */ Object.create(null);
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "root";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(issue.message);
  }
  return grouped;
}
function hasFieldError(fields, path) {
  return path in fields;
}
function getFieldErrorMessage(fields, path) {
  return fields[path]?.message;
}

// src/ecosystem/forms/index.ts
function createFormValidator(schema) {
  return {
    resolver: inputfyResolver(schema),
    mapErrors: errorToFormFields,
    formatHTML: formatErrorHTML
  };
}
export {
  aggregateBySeverity,
  countBySeverity,
  createFormValidator,
  errorToFormFields,
  formatErrorHTML,
  getFieldErrorMessage,
  groupFormErrorsByField,
  hasFieldError,
  inputfyHookFormResolver,
  inputfyResolver,
  issuesToFieldErrors,
  issuesToNestedFormErrors
};
