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

// src/integrations/trpc/index.ts
var trpc_exports = {};
__export(trpc_exports, {
  TRPCInputFyError: () => TRPCInputFyError,
  createInputFyValidator: () => createInputFyValidator,
  inputfyInput: () => inputfyInput,
  inputfyMiddleware: () => inputfyMiddleware,
  inputfyProcedure: () => inputfyProcedure
});
module.exports = __toCommonJS(trpc_exports);

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

// src/integrations/trpc/index.ts
var TRPCInputFyError = class _TRPCInputFyError extends InputFyError {
  code = "BAD_REQUEST";
  constructor(error) {
    super(error.issues);
    this.name = "TRPCInputFyError";
    Object.setPrototypeOf(this, _TRPCInputFyError.prototype);
  }
};
function inputfyInput(schema) {
  return {
    _type: "inputfy",
    schema,
    parse(input) {
      const result = schema.safeParse(input);
      if (!result.success) throw new TRPCInputFyError(result.error);
      return result.data;
    },
    safeParse(input) {
      return schema.safeParse(input);
    }
  };
}
function createInputFyValidator(schema) {
  return inputfyInput(schema).parse;
}
function inputfyMiddleware(schema) {
  return async ({ next, rawInput, ctx }) => {
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCInputFyError(result.error);
    return next({ ctx: { ...ctx, validatedInput: result.data } });
  };
}
function inputfyProcedure(schema) {
  const input = inputfyInput(schema);
  return {
    input,
    parse: input.parse,
    middleware: inputfyMiddleware(schema)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TRPCInputFyError,
  createInputFyValidator,
  inputfyInput,
  inputfyMiddleware,
  inputfyProcedure
});
