import {
  formatValidationFailure
} from "./chunk-237IRJ4U.js";

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

export {
  validate,
  expressValidate,
  fastifyValidate,
  koaValidate
};
