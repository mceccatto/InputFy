import {
  getIssueSuggestion,
  resolveIssueSeverity
} from "./chunk-E7G4F2VH.js";

// src/i18n/severity.ts
function getIssueSeverity(issue) {
  return resolveIssueSeverity(issue);
}
function aggregateBySeverity(error) {
  const groups = { errors: [], warnings: [], info: [] };
  for (const issue of error.issues) {
    const severity = getIssueSeverity(issue);
    switch (severity) {
      case "warning":
        groups.warnings.push(issue);
        break;
      case "info":
        groups.info.push(issue);
        break;
      default:
        groups.errors.push(issue);
    }
  }
  return groups;
}
function countBySeverity(error) {
  const groups = aggregateBySeverity(error);
  return {
    error: groups.errors.length,
    warning: groups.warnings.length,
    info: groups.info.length
  };
}

// src/i18n/html-report.ts
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function pathToField(path) {
  return path.map(String).join(".");
}
function renderIssue(issue, prefix, options) {
  const field = pathToField(issue.path);
  const severity = getIssueSeverity(issue);
  const suggestion = options.showSuggestions ? getIssueSuggestion(issue) : void 0;
  const attrs = [
    `class="${prefix}issue ${prefix}issue--${severity}"`,
    `data-code="${escapeHtml(issue.code)}"`,
    field ? `data-field="${escapeHtml(field)}"` : "",
    options.showSeverity ? `data-severity="${severity}"` : ""
  ].filter(Boolean).join(" ");
  const suggestionHtml = suggestion ? `<span class="${prefix}suggestion">${escapeHtml(suggestion)}</span>` : "";
  return `<li ${attrs}><span class="${prefix}message">${escapeHtml(issue.message)}</span>${suggestionHtml}</li>`;
}
function formatErrorHTML(error, options = {}) {
  const prefix = options.classPrefix ?? "inputfy-";
  const showSuggestions = options.showSuggestions ?? true;
  const showSeverity = options.showSeverity ?? true;
  const title = options.title ?? "Validation errors";
  const fieldMap = /* @__PURE__ */ new Map();
  const formIssues = [];
  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      formIssues.push(issue);
    } else {
      const key = pathToField(issue.path);
      const list = fieldMap.get(key) ?? [];
      list.push(issue);
      fieldMap.set(key, list);
    }
  }
  const renderOpts = { showSuggestions, showSeverity };
  const formHtml = formIssues.length > 0 ? `<ul class="${prefix}form-errors">${formIssues.map((i) => renderIssue(i, prefix, renderOpts)).join("")}</ul>` : "";
  const fieldsHtml = [...fieldMap.entries()].map(([field, issues]) => {
    const items = issues.map((i) => renderIssue(i, prefix, renderOpts)).join("");
    return `<div class="${prefix}field" data-field="${escapeHtml(field)}"><ul class="${prefix}field-errors">${items}</ul></div>`;
  }).join("");
  return [
    `<div class="${prefix}error-report" role="alert" aria-live="polite">`,
    `<h2 class="${prefix}title">${escapeHtml(title)}</h2>`,
    formHtml,
    fieldsHtml,
    `</div>`
  ].join("");
}

// src/i18n/index.ts
function issueCodeErrorMap(map) {
  return map;
}

export {
  aggregateBySeverity,
  countBySeverity,
  formatErrorHTML,
  issueCodeErrorMap
};
