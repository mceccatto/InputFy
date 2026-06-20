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

// src/integrations/express/index.ts
var express_exports = {};
__export(express_exports, {
  expressValidate: () => expressValidate,
  fastifyValidate: () => fastifyValidate,
  koaValidate: () => koaValidate,
  validate: () => validate
});
module.exports = __toCommonJS(express_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expressValidate,
  fastifyValidate,
  koaValidate,
  validate
});
