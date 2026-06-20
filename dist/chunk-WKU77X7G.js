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
function flattenError(error) {
  return error.flatten();
}
function prettifyError(error) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `  \u2192 at ${issue.path.join(".")}` : "";
    return `\u2716 ${issue.message}${path ? `
${path}` : ""}`;
  }).join("\n");
}
function treeifyError(error) {
  const root = { errors: [] };
  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      root["errors"].push(issue.message);
      continue;
    }
    let current = root;
    for (let i = 0; i < issue.path.length; i++) {
      const segment = issue.path[i];
      const isLast = i === issue.path.length - 1;
      if (isLast) {
        const key = String(segment);
        if (typeof segment === "number") {
          if (!current["items"]) current["items"] = [];
          const items = current["items"];
          if (!items[segment]) items[segment] = { errors: [] };
          items[segment]["errors"].push(issue.message);
        } else {
          if (!current["properties"]) current["properties"] = {};
          const props = current["properties"];
          if (!props[key]) props[key] = { errors: [] };
          props[key]["errors"].push(issue.message);
        }
      } else {
        if (typeof segment === "number") {
          if (!current["items"]) current["items"] = [];
          const items = current["items"];
          if (!items[segment]) items[segment] = {};
          current = items[segment];
        } else {
          if (!current["properties"]) current["properties"] = {};
          const props = current["properties"];
          if (!props[segment]) props[segment] = {};
          current = props[segment];
        }
      }
    }
  }
  return root;
}

export {
  InputFyError,
  flattenError,
  prettifyError,
  treeifyError
};
