"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/integrations/index.ts
var integrations_exports = {};
__export(integrations_exports, {
  InputFyBadRequestException: () => InputFyBadRequestException,
  InputFyDto: () => InputFyDto,
  InputFyValidationPipe: () => InputFyValidationPipe,
  TRPCInputFyError: () => TRPCInputFyError,
  createInputFyPipe: () => createInputFyPipe,
  createInputFyValidator: () => createInputFyValidator,
  createInsertSchema: () => createInsertSchema,
  createSelectSchema: () => createSelectSchema,
  createUpdateSchema: () => createUpdateSchema,
  expressValidate: () => expressValidate,
  extractDrizzleColumns: () => extractDrizzleColumns,
  fastifyValidate: () => fastifyValidate,
  formatValidationFailure: () => formatValidationFailure,
  fromDrizzleColumns: () => fromDrizzleColumns,
  fromDrizzleTable: () => fromDrizzleTable,
  fromDrizzleTableAsync: () => fromDrizzleTableAsync,
  getInputFyDtoSchema: () => getInputFyDtoSchema,
  inputfyHookFormResolver: () => inputfyHookFormResolver,
  inputfyInput: () => inputfyInput,
  inputfyMiddleware: () => inputfyMiddleware,
  inputfyProcedure: () => inputfyProcedure,
  inputfyResolver: () => inputfyResolver,
  issuesToFieldErrors: () => issuesToFieldErrors,
  koaValidate: () => koaValidate,
  parseIpcMessage: () => parseIpcMessage,
  registerSecureIpcHandler: () => registerSecureIpcHandler,
  validate: () => validate,
  validateDtoInstance: () => validateDtoInstance,
  validateIpcHandler: () => validateIpcHandler
});
module.exports = __toCommonJS(integrations_exports);

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

// src/integrations/nestjs/index.ts
var InputFyBadRequestException = class _InputFyBadRequestException extends Error {
  statusCode = 400;
  response;
  constructor(error) {
    super("Validation failed");
    this.name = "InputFyBadRequestException";
    this.response = {
      statusCode: 400,
      message: error.message,
      errors: error.format(),
      issues: error.issues
    };
    Object.setPrototypeOf(this, _InputFyBadRequestException.prototype);
  }
};
var InputFyValidationPipe = class {
  constructor(schema, options = {}) {
    this.schema = schema;
    this.options = options;
  }
  schema;
  options;
  transform(value, _metadata) {
    if (this.options.skipMissing && (value === void 0 || value === null)) {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      if (this.options.throwOnError !== false) {
        throw new InputFyBadRequestException(result.error);
      }
      throw result.error;
    }
    return result.data;
  }
};
function createInputFyPipe(schema, options) {
  return new InputFyValidationPipe(schema, options);
}
var dtoMetadata = /* @__PURE__ */ new WeakMap();
function InputFyDto(schema) {
  return function(target) {
    dtoMetadata.set(target, schema);
    return target;
  };
}
function getInputFyDtoSchema(target) {
  return dtoMetadata.get(target);
}
function validateDtoInstance(instance) {
  const schema = dtoMetadata.get(instance.constructor);
  if (!schema) return instance;
  const result = schema.safeParse(instance);
  if (!result.success) throw new InputFyBadRequestException(result.error);
  return result.data;
}

// src/locales/en.ts
var EN_MESSAGES = {
  invalid_type: "Expected {{expected}}, received {{received}}",
  invalid_literal: "Invalid literal value, expected {{expected}}",
  unrecognized_keys: "Unrecognized key(s) in object: {{keys}}",
  invalid_union: "Invalid input",
  invalid_union_discriminator: "Invalid discriminator value. Expected {{options}}",
  invalid_enum_value: "Invalid enum value. Expected {{options}}, received '{{received}}'",
  invalid_arguments: "Invalid function arguments",
  invalid_return_type: "Invalid function return type",
  invalid_date: "Invalid date",
  invalid_string: "Invalid {{validation}}",
  too_small: "Must be greater than or equal to {{minimum}}",
  too_big: "Must be less than or equal to {{maximum}}",
  invalid_intersection_types: "Invalid intersection",
  not_multiple_of: "Number must be a multiple of {{multipleOf}}",
  not_finite: "Number must be finite",
  custom: "Invalid input"
};
var EN_BUNDLE = {
  code: "en",
  name: "English",
  messages: EN_MESSAGES,
  didYouMean: "Did you mean '{{suggestion}}'?"
};
function createLocaleBundle(code, name, messages, didYouMean2) {
  return {
    code,
    name,
    messages: { ...EN_MESSAGES, ...messages },
    ...didYouMean2 !== void 0 ? { didYouMean: didYouMean2 } : EN_BUNDLE.didYouMean ? { didYouMean: EN_BUNDLE.didYouMean } : {}
  };
}

// src/locales/registry.ts
var LOCALE_DATA = [
  EN_BUNDLE,
  createLocaleBundle("pt-BR", "Portugu\xEAs (Brasil)", {
    invalid_type: "Esperado {{expected}}, recebido {{received}}",
    invalid_literal: "Valor literal inv\xE1lido, esperado {{expected}}",
    unrecognized_keys: "Chave(s) n\xE3o reconhecida(s) no objeto: {{keys}}",
    invalid_union: "Entrada inv\xE1lida",
    invalid_union_discriminator: "Valor discriminador inv\xE1lido. Esperado {{options}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Esperado {{options}}, recebido '{{received}}'",
    invalid_date: "Data inv\xE1lida",
    invalid_string: "{{validation}} inv\xE1lido",
    too_small: "Deve ser maior ou igual a {{minimum}}",
    too_big: "Deve ser menor ou igual a {{maximum}}",
    not_multiple_of: "N\xFAmero deve ser m\xFAltiplo de {{multipleOf}}",
    not_finite: "N\xFAmero deve ser finito",
    custom: "Entrada inv\xE1lida"
  }, "Voc\xEA quis dizer '{{suggestion}}'?"),
  createLocaleBundle("pt-PT", "Portugu\xEAs (Portugal)", {
    invalid_type: "Esperado {{expected}}, recebido {{received}}",
    invalid_enum_value: "Valor de enumera\xE7\xE3o inv\xE1lido. Esperado {{options}}, recebido '{{received}}'",
    unrecognized_keys: "Chave(s) n\xE3o reconhecida(s) no objecto: {{keys}}",
    too_small: "Deve ser superior ou igual a {{minimum}}",
    too_big: "Deve ser inferior ou igual a {{maximum}}"
  }, "Quis dizer '{{suggestion}}'?"),
  createLocaleBundle("es", "Espa\xF1ol", {
    invalid_type: "Se esperaba {{expected}}, se recibi\xF3 {{received}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Se esperaba {{options}}, se recibi\xF3 '{{received}}'",
    unrecognized_keys: "Clave(s) no reconocida(s) en el objeto: {{keys}}",
    too_small: "Debe ser mayor o igual a {{minimum}}",
    too_big: "Debe ser menor o igual a {{maximum}}",
    invalid_date: "Fecha inv\xE1lida"
  }, "\xBFQuiso decir '{{suggestion}}'?"),
  createLocaleBundle("es-MX", "Espa\xF1ol (M\xE9xico)", {
    invalid_type: "Se esperaba {{expected}}, se recibi\xF3 {{received}}",
    invalid_enum_value: "Valor de enum inv\xE1lido. Se esperaba {{options}}, se recibi\xF3 '{{received}}'"
  }, "\xBFQuisiste decir '{{suggestion}}'?"),
  createLocaleBundle("fr", "Fran\xE7ais", {
    invalid_type: "Attendu {{expected}}, re\xE7u {{received}}",
    invalid_enum_value: "Valeur d'\xE9num\xE9ration invalide. Attendu {{options}}, re\xE7u '{{received}}'",
    unrecognized_keys: "Cl\xE9(s) non reconnue(s) dans l'objet : {{keys}}",
    too_small: "Doit \xEAtre sup\xE9rieur ou \xE9gal \xE0 {{minimum}}",
    too_big: "Doit \xEAtre inf\xE9rieur ou \xE9gal \xE0 {{maximum}}",
    invalid_date: "Date invalide"
  }, "Vouliez-vous dire '{{suggestion}}' ?"),
  createLocaleBundle("de", "Deutsch", {
    invalid_type: "Erwartet {{expected}}, erhalten {{received}}",
    invalid_enum_value: "Ung\xFCltiger Enum-Wert. Erwartet {{options}}, erhalten '{{received}}'",
    unrecognized_keys: "Nicht erkannte Schl\xFCssel im Objekt: {{keys}}",
    too_small: "Muss gr\xF6\xDFer oder gleich {{minimum}} sein",
    too_big: "Muss kleiner oder gleich {{maximum}} sein"
  }, "Meinten Sie '{{suggestion}}'?"),
  createLocaleBundle("it", "Italiano", {
    invalid_type: "Atteso {{expected}}, ricevuto {{received}}",
    invalid_enum_value: "Valore enum non valido. Atteso {{options}}, ricevuto '{{received}}'",
    too_small: "Deve essere maggiore o uguale a {{minimum}}",
    too_big: "Deve essere minore o uguale a {{maximum}}"
  }, "Intendevi '{{suggestion}}'?"),
  createLocaleBundle("ja", "\u65E5\u672C\u8A9E", {
    invalid_type: "{{expected}} \u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001{{received}} \u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F",
    invalid_enum_value: "\u7121\u52B9\u306A\u5217\u6319\u5024\u3002{{options}} \u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001'{{received}}' \u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F",
    too_small: "{{minimum}} \u4EE5\u4E0A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
    too_big: "{{maximum}} \u4EE5\u4E0B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
  }, "'{{suggestion}}' \u306E\u3053\u3068\u3067\u3059\u304B\uFF1F"),
  createLocaleBundle("ko", "\uD55C\uAD6D\uC5B4", {
    invalid_type: "{{expected}}\uC774(\uAC00) \uD544\uC694\uD558\uC9C0\uB9CC {{received}}\uC744(\uB97C) \uBC1B\uC558\uC2B5\uB2C8\uB2E4",
    invalid_enum_value: "\uC798\uBABB\uB41C \uC5F4\uAC70\uD615 \uAC12. {{options}}\uC774(\uAC00) \uD544\uC694\uD558\uC9C0\uB9CC '{{received}}'\uC744(\uB97C) \uBC1B\uC558\uC2B5\uB2C8\uB2E4",
    too_small: "{{minimum}} \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
    too_big: "{{maximum}} \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4"
  }, "'{{suggestion}}'\uC744(\uB97C) \uC758\uBBF8\uD558\uC168\uB098\uC694?"),
  createLocaleBundle("zh-CN", "\u7B80\u4F53\u4E2D\u6587", {
    invalid_type: "\u671F\u671B {{expected}}\uFF0C\u5B9E\u9645\u6536\u5230 {{received}}",
    invalid_enum_value: "\u65E0\u6548\u7684\u679A\u4E3E\u503C\u3002\u671F\u671B {{options}}\uFF0C\u5B9E\u9645\u6536\u5230 '{{received}}'",
    too_small: "\u5FC5\u987B\u5927\u4E8E\u6216\u7B49\u4E8E {{minimum}}",
    too_big: "\u5FC5\u987B\u5C0F\u4E8E\u6216\u7B49\u4E8E {{maximum}}"
  }, "\u60A8\u662F\u5426\u6307\u7684\u662F '{{suggestion}}'\uFF1F"),
  createLocaleBundle("zh-TW", "\u7E41\u9AD4\u4E2D\u6587", {
    invalid_type: "\u9810\u671F {{expected}}\uFF0C\u6536\u5230 {{received}}",
    invalid_enum_value: "\u7121\u6548\u7684\u5217\u8209\u503C\u3002\u9810\u671F {{options}}\uFF0C\u6536\u5230 '{{received}}'",
    too_small: "\u5FC5\u9808\u5927\u65BC\u6216\u7B49\u65BC {{minimum}}",
    too_big: "\u5FC5\u9808\u5C0F\u65BC\u6216\u7B49\u65BC {{maximum}}"
  }, "\u60A8\u662F\u6307 '{{suggestion}}' \u55CE\uFF1F"),
  createLocaleBundle("ru", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", {
    invalid_type: "\u041E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C {{expected}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 enum. \u041E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C {{options}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E '{{received}}'",
    too_small: "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E {{minimum}}",
    too_big: "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435 \u0438\u043B\u0438 \u0440\u0430\u0432\u043D\u043E {{maximum}}"
  }, "\u0412\u044B \u0438\u043C\u0435\u043B\u0438 \u0432 \u0432\u0438\u0434\u0443 '{{suggestion}}'?"),
  createLocaleBundle("ar", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", {
    invalid_type: "\u0645\u062A\u0648\u0642\u0639 {{expected}}\u060C \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 {{received}}",
    invalid_enum_value: "\u0642\u064A\u0645\u0629 \u062A\u0639\u062F\u0627\u062F \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629. \u0645\u062A\u0648\u0642\u0639 {{options}}\u060C \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 '{{received}}'",
    too_small: "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0623\u0648 \u064A\u0633\u0627\u0648\u064A {{minimum}}",
    too_big: "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 \u0623\u0648 \u064A\u0633\u0627\u0648\u064A {{maximum}}"
  }, "\u0647\u0644 \u062A\u0642\u0635\u062F '{{suggestion}}'\u061F"),
  createLocaleBundle("hi", "\u0939\u093F\u0928\u094D\u0926\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924 \u0925\u093E, {{received}} \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0906",
    invalid_enum_value: "\u0905\u092E\u093E\u0928\u094D\u092F enum \u092E\u093E\u0928\u0964 {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    too_small: "{{minimum}} \u0938\u0947 \u0905\u0927\u093F\u0915 \u092F\u093E \u092C\u0930\u093E\u092C\u0930 \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F",
    too_big: "{{maximum}} \u0938\u0947 \u0915\u092E \u092F\u093E \u092C\u0930\u093E\u092C\u0930 \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F"
  }, "\u0915\u094D\u092F\u093E \u0906\u092A\u0915\u093E \u092E\u0924\u0932\u092C '{{suggestion}}' \u0925\u093E?"),
  createLocaleBundle("bn", "\u09AC\u09BE\u0982\u09B2\u09BE", {
    invalid_type: "{{expected}} \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4, {{received}} \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u0997\u09C7\u099B\u09C7",
    invalid_enum_value: "\u0985\u09AC\u09C8\u09A7 enum \u09AE\u09BE\u09A8\u0964 {{options}} \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4, '{{received}}' \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u0997\u09C7\u099B\u09C7"
  }, "\u0986\u09AA\u09A8\u09BF \u0995\u09BF '{{suggestion}}' \u09AC\u09CB\u099D\u09BE\u09A4\u09C7 \u099A\u09C7\u09AF\u09BC\u09C7\u099B\u09BF\u09B2\u09C7\u09A8?"),
  createLocaleBundle("tr", "T\xFCrk\xE7e", {
    invalid_type: "{{expected}} bekleniyordu, {{received}} al\u0131nd\u0131",
    invalid_enum_value: "Ge\xE7ersiz enum de\u011Feri. {{options}} bekleniyordu, '{{received}}' al\u0131nd\u0131",
    too_small: "{{minimum}} de\u011Ferinden b\xFCy\xFCk veya e\u015Fit olmal\u0131",
    too_big: "{{maximum}} de\u011Ferinden k\xFC\xE7\xFCk veya e\u015Fit olmal\u0131"
  }, "'{{suggestion}}' mi demek istediniz?"),
  createLocaleBundle("vi", "Ti\u1EBFng Vi\u1EC7t", {
    invalid_type: "Mong \u0111\u1EE3i {{expected}}, nh\u1EADn \u0111\u01B0\u1EE3c {{received}}",
    invalid_enum_value: "Gi\xE1 tr\u1ECB enum kh\xF4ng h\u1EE3p l\u1EC7. Mong \u0111\u1EE3i {{options}}, nh\u1EADn \u0111\u01B0\u1EE3c '{{received}}'",
    too_small: "Ph\u1EA3i l\u1EDBn h\u01A1n ho\u1EB7c b\u1EB1ng {{minimum}}",
    too_big: "Ph\u1EA3i nh\u1ECF h\u01A1n ho\u1EB7c b\u1EB1ng {{maximum}}"
  }, "B\u1EA1n c\xF3 \xFD l\xE0 '{{suggestion}}'?"),
  createLocaleBundle("pl", "Polski", {
    invalid_type: "Oczekiwano {{expected}}, otrzymano {{received}}",
    invalid_enum_value: "Nieprawid\u0142owa warto\u015B\u0107 enum. Oczekiwano {{options}}, otrzymano '{{received}}'",
    too_small: "Musi by\u0107 wi\u0119ksze lub r\xF3wne {{minimum}}",
    too_big: "Musi by\u0107 mniejsze lub r\xF3wne {{maximum}}"
  }, "Czy chodzi\u0142o o '{{suggestion}}'?"),
  createLocaleBundle("nl", "Nederlands", {
    invalid_type: "Verwacht {{expected}}, ontvangen {{received}}",
    invalid_enum_value: "Ongeldige enum-waarde. Verwacht {{options}}, ontvangen '{{received}}'",
    too_small: "Moet groter dan of gelijk aan {{minimum}} zijn",
    too_big: "Moet kleiner dan of gelijk aan {{maximum}} zijn"
  }, "Bedoelde u '{{suggestion}}'?"),
  createLocaleBundle("sv", "Svenska", {
    invalid_type: "F\xF6rv\xE4ntade {{expected}}, fick {{received}}",
    invalid_enum_value: "Ogiltigt enum-v\xE4rde. F\xF6rv\xE4ntade {{options}}, fick '{{received}}'",
    too_small: "M\xE5ste vara st\xF6rre \xE4n eller lika med {{minimum}}",
    too_big: "M\xE5ste vara mindre \xE4n eller lika med {{maximum}}"
  }, "Menade du '{{suggestion}}'?"),
  createLocaleBundle("da", "Dansk", {
    invalid_type: "Forventede {{expected}}, modtog {{received}}",
    invalid_enum_value: "Ugyldig enum-v\xE6rdi. Forventede {{options}}, modtog '{{received}}'",
    too_small: "Skal v\xE6re st\xF8rre end eller lig med {{minimum}}",
    too_big: "Skal v\xE6re mindre end eller lig med {{maximum}}"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("no", "Norsk", {
    invalid_type: "Forventet {{expected}}, mottok {{received}}",
    invalid_enum_value: "Ugyldig enum-verdi. Forventet {{options}}, mottok '{{received}}'",
    too_small: "M\xE5 v\xE6re st\xF8rre enn eller lik {{minimum}}",
    too_big: "M\xE5 v\xE6re mindre enn eller lik {{maximum}}"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("nb", "Norsk Bokm\xE5l", {
    invalid_type: "Forventet {{expected}}, mottok {{received}}",
    invalid_enum_value: "Ugyldig enum-verdi. Forventet {{options}}, mottok '{{received}}'"
  }, "Mente du '{{suggestion}}'?"),
  createLocaleBundle("fi", "Suomi", {
    invalid_type: "Odotettiin {{expected}}, saatiin {{received}}",
    invalid_enum_value: "Virheellinen enum-arvo. Odotettiin {{options}}, saatiin '{{received}}'",
    too_small: "On oltava v\xE4hint\xE4\xE4n {{minimum}}",
    too_big: "On oltava enint\xE4\xE4n {{maximum}}"
  }, "Tarkoititko '{{suggestion}}'?"),
  createLocaleBundle("cs", "\u010Ce\u0161tina", {
    invalid_type: "O\u010Dek\xE1v\xE1no {{expected}}, obdr\u017Eeno {{received}}",
    invalid_enum_value: "Neplatn\xE1 hodnota enum. O\u010Dek\xE1v\xE1no {{options}}, obdr\u017Eeno '{{received}}'",
    too_small: "Mus\xED b\xFDt v\u011Bt\u0161\xED nebo rovno {{minimum}}",
    too_big: "Mus\xED b\xFDt men\u0161\xED nebo rovno {{maximum}}"
  }, "Mysleli jste '{{suggestion}}'?"),
  createLocaleBundle("sk", "Sloven\u010Dina", {
    invalid_type: "O\u010Dak\xE1van\xE9 {{expected}}, prijat\xE9 {{received}}",
    invalid_enum_value: "Neplatn\xE1 hodnota enum. O\u010Dak\xE1van\xE9 {{options}}, prijat\xE9 '{{received}}'",
    too_small: "Mus\xED by\u0165 v\xE4\u010D\u0161ie alebo rovn\xE9 {{minimum}}",
    too_big: "Mus\xED by\u0165 men\u0161ie alebo rovn\xE9 {{maximum}}"
  }, "Mysleli ste '{{suggestion}}'?"),
  createLocaleBundle("hu", "Magyar", {
    invalid_type: "{{expected}} v\xE1rhat\xF3, {{received}} \xE9rkezett",
    invalid_enum_value: "\xC9rv\xE9nytelen enum \xE9rt\xE9k. {{options}} v\xE1rhat\xF3, '{{received}}' \xE9rkezett",
    too_small: "Legal\xE1bb {{minimum}} kell legyen",
    too_big: "Legfeljebb {{maximum}} lehet"
  }, "'{{suggestion}}'-ra gondolt?"),
  createLocaleBundle("ro", "Rom\xE2n\u0103", {
    invalid_type: "A\u0219teptat {{expected}}, primit {{received}}",
    invalid_enum_value: "Valoare enum invalid\u0103. A\u0219teptat {{options}}, primit '{{received}}'",
    too_small: "Trebuie s\u0103 fie cel pu\u021Bin {{minimum}}",
    too_big: "Trebuie s\u0103 fie cel mult {{maximum}}"
  }, "A\u021Bi vrut s\u0103 spune\u021Bi '{{suggestion}}'?"),
  createLocaleBundle("bg", "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438", {
    invalid_type: "\u041E\u0447\u0430\u043A\u0432\u0430\u043D\u043E {{expected}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 enum \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442. \u041E\u0447\u0430\u043A\u0432\u0430\u043D\u043E {{options}}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E '{{received}}'",
    too_small: "\u0422\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043F\u043E\u043D\u0435 {{minimum}}",
    too_big: "\u0422\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043D\u0430\u0439-\u043C\u043D\u043E\u0433\u043E {{maximum}}"
  }, "\u0418\u043C\u0430\u0445\u0442\u0435 \u043F\u0440\u0435\u0434\u0432\u0438\u0434 '{{suggestion}}'?"),
  createLocaleBundle("hr", "Hrvatski", {
    invalid_type: "O\u010Dekivano {{expected}}, primljeno {{received}}",
    invalid_enum_value: "Nevaljana enum vrijednost. O\u010Dekivano {{options}}, primljeno '{{received}}'",
    too_small: "Mora biti ve\u0107e ili jednako {{minimum}}",
    too_big: "Mora biti manje ili jednako {{maximum}}"
  }, "Jeste li mislili '{{suggestion}}'?"),
  createLocaleBundle("sr", "\u0421\u0440\u043F\u0441\u043A\u0438", {
    invalid_type: "\u041E\u0447\u0435\u043A\u0438\u0432\u0430\u043D\u043E {{expected}}, \u043F\u0440\u0438\u043C\u0459\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u0436\u0435\u045B\u0430 enum \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442. \u041E\u0447\u0435\u043A\u0438\u0432\u0430\u043D\u043E {{options}}, \u043F\u0440\u0438\u043C\u0459\u0435\u043D\u043E '{{received}}'",
    too_small: "\u041C\u043E\u0440\u0430 \u0431\u0438\u0442\u0438 \u0432\u0435\u045B\u0435 \u0438\u043B\u0438 \u0458\u0435\u0434\u043D\u0430\u043A\u043E {{minimum}}",
    too_big: "\u041C\u043E\u0440\u0430 \u0431\u0438\u0442\u0438 \u043C\u0430\u045A\u0435 \u0438\u043B\u0438 \u0458\u0435\u0434\u043D\u0430\u043A\u043E {{maximum}}"
  }, "\u0414\u0430 \u043B\u0438 \u0441\u0442\u0435 \u043C\u0438\u0441\u043B\u0438\u043B\u0438 '{{suggestion}}'?"),
  createLocaleBundle("sl", "Sloven\u0161\u010Dina", {
    invalid_type: "Pri\u010Dakovano {{expected}}, prejeto {{received}}",
    invalid_enum_value: "Neveljavna enum vrednost. Pri\u010Dakovano {{options}}, prejeto '{{received}}'",
    too_small: "Mora biti vsaj {{minimum}}",
    too_big: "Mora biti najve\u010D {{maximum}}"
  }, "Ste mislili '{{suggestion}}'?"),
  createLocaleBundle("uk", "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", {
    invalid_type: "\u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043B\u043E\u0441\u044C {{expected}}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F enum. \u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043B\u043E\u0441\u044C {{options}}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E '{{received}}'",
    too_small: "\u041C\u0430\u0454 \u0431\u0443\u0442\u0438 \u043D\u0435 \u043C\u0435\u043D\u0448\u0435 {{minimum}}",
    too_big: "\u041C\u0430\u0454 \u0431\u0443\u0442\u0438 \u043D\u0435 \u0431\u0456\u043B\u044C\u0448\u0435 {{maximum}}"
  }, "\u0412\u0438 \u043C\u0430\u043B\u0438 \u043D\u0430 \u0443\u0432\u0430\u0437\u0456 '{{suggestion}}'?"),
  createLocaleBundle("el", "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", {
    invalid_type: "\u0391\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD {{expected}}, \u03B5\u03BB\u03AE\u03C6\u03B8\u03B7 {{received}}",
    invalid_enum_value: "\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C4\u03B9\u03BC\u03AE enum. \u0391\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD {{options}}, \u03B5\u03BB\u03AE\u03C6\u03B8\u03B7 '{{received}}'",
    too_small: "\u03A0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD {{minimum}}",
    too_big: "\u03A0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C4\u03BF \u03C0\u03BF\u03BB\u03CD {{maximum}}"
  }, "\u0395\u03BD\u03BD\u03BF\u03BF\u03CD\u03C3\u03B1\u03C4\u03B5 '{{suggestion}}';"),
  createLocaleBundle("he", "\u05E2\u05D1\u05E8\u05D9\u05EA", {
    invalid_type: "\u05E6\u05E4\u05D5\u05D9 {{expected}}, \u05D4\u05EA\u05E7\u05D1\u05DC {{received}}",
    invalid_enum_value: "\u05E2\u05E8\u05DA enum \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9. \u05E6\u05E4\u05D5\u05D9 {{options}}, \u05D4\u05EA\u05E7\u05D1\u05DC '{{received}}'",
    too_small: "\u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05E4\u05D7\u05D5\u05EA {{minimum}}",
    too_big: "\u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8 {{maximum}}"
  }, "\u05D4\u05EA\u05DB\u05D5\u05D5\u05E0\u05EA \u05DC-'{{suggestion}}'?"),
  createLocaleBundle("th", "\u0E44\u0E17\u0E22", {
    invalid_type: "\u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07 {{expected}} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A {{received}}",
    invalid_enum_value: "\u0E04\u0E48\u0E32 enum \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E04\u0E32\u0E14\u0E2B\u0E27\u0E31\u0E07 {{options}} \u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A '{{received}}'",
    too_small: "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A {{minimum}}",
    too_big: "\u0E15\u0E49\u0E2D\u0E07\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A {{maximum}}"
  }, "\u0E04\u0E38\u0E13\u0E2B\u0E21\u0E32\u0E22\u0E16\u0E36\u0E07 '{{suggestion}}' \u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?"),
  createLocaleBundle("id", "Bahasa Indonesia", {
    invalid_type: "Diharapkan {{expected}}, diterima {{received}}",
    invalid_enum_value: "Nilai enum tidak valid. Diharapkan {{options}}, diterima '{{received}}'",
    too_small: "Harus lebih besar atau sama dengan {{minimum}}",
    too_big: "Harus lebih kecil atau sama dengan {{maximum}}"
  }, "Apakah maksud Anda '{{suggestion}}'?"),
  createLocaleBundle("ms", "Bahasa Melayu", {
    invalid_type: "Dijangka {{expected}}, diterima {{received}}",
    invalid_enum_value: "Nilai enum tidak sah. Dijangka {{options}}, diterima '{{received}}'",
    too_small: "Mesti lebih besar atau sama dengan {{minimum}}",
    too_big: "Mesti lebih kecil atau sama dengan {{maximum}}"
  }, "Adakah anda maksudkan '{{suggestion}}'?"),
  createLocaleBundle("fa", "\u0641\u0627\u0631\u0633\u06CC", {
    invalid_type: "{{expected}} \u0645\u0648\u0631\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0648\u062F\u060C {{received}} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
    invalid_enum_value: "\u0645\u0642\u062F\u0627\u0631 enum \u0646\u0627\u0645\u0639\u062A\u0628\u0631. {{options}} \u0645\u0648\u0631\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0648\u062F\u060C '{{received}}' \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F",
    too_small: "\u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 {{minimum}} \u0628\u0627\u0634\u062F",
    too_big: "\u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u06A9\u062B\u0631 {{maximum}} \u0628\u0627\u0634\u062F"
  }, "\u0645\u0646\u0638\u0648\u0631\u062A\u0627\u0646 '{{suggestion}}' \u0628\u0648\u062F\u061F"),
  createLocaleBundle("ur", "\u0627\u0631\u062F\u0648", {
    invalid_type: "{{expected}} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C {{received}} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627",
    invalid_enum_value: "\u063A\u0644\u0637 enum \u0642\u062F\u0631\u06D4 {{options}} \u0645\u062A\u0648\u0642\u0639\u060C '{{received}}' \u0645\u0648\u0635\u0648\u0644",
    too_small: "\u06A9\u0645 \u0627\u0632 \u06A9\u0645 {{minimum}} \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2",
    too_big: "\u0632\u06CC\u0627\u062F\u06C1 \u0633\u06D2 \u0632\u06CC\u0627\u062F\u06C1 {{maximum}} \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2"
  }, "\u06A9\u06CC\u0627 \u0622\u067E \u06A9\u0627 \u0645\u0637\u0644\u0628 '{{suggestion}}' \u062A\u06BE\u0627\u061F"),
  createLocaleBundle("sw", "Kiswahili", {
    invalid_type: "Ilitarajiwa {{expected}}, ilipokelewa {{received}}",
    invalid_enum_value: "Thamani ya enum si sahihi. Ilitarajiwa {{options}}, ilipokelewa '{{received}}'",
    too_small: "Lazima iwe angalau {{minimum}}",
    too_big: "Lazima iwe si zaidi ya {{maximum}}"
  }, "Ulimaanisha '{{suggestion}}'?"),
  createLocaleBundle("af", "Afrikaans", {
    invalid_type: "Verwag {{expected}}, ontvang {{received}}",
    invalid_enum_value: "Ongeldige enum-waarde. Verwag {{options}}, ontvang '{{received}}'",
    too_small: "Moet groter as of gelyk aan {{minimum}} wees",
    too_big: "Moet kleiner as of gelyk aan {{maximum}} wees"
  }, "Het jy '{{suggestion}}' bedoel?"),
  createLocaleBundle("ca", "Catal\xE0", {
    invalid_type: "S'esperava {{expected}}, s'ha rebut {{received}}",
    invalid_enum_value: "Valor d'enum no v\xE0lid. S'esperava {{options}}, s'ha rebut '{{received}}'",
    too_small: "Ha de ser superior o igual a {{minimum}}",
    too_big: "Ha de ser inferior o igual a {{maximum}}"
  }, "Volies dir '{{suggestion}}'?"),
  createLocaleBundle("lt", "Lietuvi\u0173", {
    invalid_type: "Tik\u0117tasi {{expected}}, gauta {{received}}",
    invalid_enum_value: "Netinkama enum reik\u0161m\u0117. Tik\u0117tasi {{options}}, gauta '{{received}}'",
    too_small: "Turi b\u016Bti ne ma\u017Eiau kaip {{minimum}}",
    too_big: "Turi b\u016Bti ne daugiau kaip {{maximum}}"
  }, "Ar tur\u0117jote omenyje '{{suggestion}}'?"),
  createLocaleBundle("lv", "Latvie\u0161u", {
    invalid_type: "Gaid\u012Bts {{expected}}, sa\u0146emts {{received}}",
    invalid_enum_value: "Neder\u012Bga enum v\u0113rt\u012Bba. Gaid\u012Bts {{options}}, sa\u0146emts '{{received}}'",
    too_small: "J\u0101b\u016Bt vismaz {{minimum}}",
    too_big: "J\u0101b\u016Bt ne vair\u0101k k\u0101 {{maximum}}"
  }, "Vai dom\u0101j\u0101t '{{suggestion}}'?"),
  createLocaleBundle("et", "Eesti", {
    invalid_type: "Oodati {{expected}}, saadi {{received}}",
    invalid_enum_value: "Vigane enum v\xE4\xE4rtus. Oodati {{options}}, saadi '{{received}}'",
    too_small: "Peab olema v\xE4hemalt {{minimum}}",
    too_big: "Peab olema kuni {{maximum}}"
  }, "Kas m\xF5tlesite '{{suggestion}}'?"),
  createLocaleBundle("is", "\xCDslenska", {
    invalid_type: "B\xFAist var vi\xF0 {{expected}}, f\xE9kk {{received}}",
    invalid_enum_value: "\xD3gilt enum gildi. B\xFAist var vi\xF0 {{options}}, f\xE9kk '{{received}}'",
    too_small: "Ver\xF0ur a\xF0 vera a\xF0 minnsta kosti {{minimum}}",
    too_big: "Ver\xF0ur a\xF0 vera a\xF0 h\xE1marki {{maximum}}"
  }, "\xC1ttir\xF0u vi\xF0 '{{suggestion}}'?"),
  createLocaleBundle("mk", "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438", {
    invalid_type: "\u0421\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430\u0448\u0435 {{expected}}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E {{received}}",
    invalid_enum_value: "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 enum \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442. \u0421\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430\u0448\u0435 {{options}}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E '{{received}}'",
    too_small: "\u041C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u043D\u0430\u0458\u043C\u0430\u043B\u043A\u0443 {{minimum}}",
    too_big: "\u041C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u043D\u0430\u0458\u043C\u043D\u043E\u0433\u0443 {{maximum}}"
  }, "\u0414\u0430\u043B\u0438 \u043C\u0438\u0441\u043B\u0435\u0432\u0442\u0435 \u043D\u0430 '{{suggestion}}'?"),
  createLocaleBundle("sq", "Shqip", {
    invalid_type: "Pritet {{expected}}, u mor {{received}}",
    invalid_enum_value: "Vler\xEB enum e pavlefshme. Pritet {{options}}, u mor '{{received}}'",
    too_small: "Duhet t\xEB jet\xEB t\xEB pakt\xEBn {{minimum}}",
    too_big: "Duhet t\xEB jet\xEB s\xEB shumti {{maximum}}"
  }, "A mendonit '{{suggestion}}'?"),
  createLocaleBundle("ka", "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8", {
    invalid_type: "\u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 \u10D8\u10E7\u10DD {{expected}}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0 {{received}}",
    invalid_enum_value: "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 enum \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0. \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 {{options}}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 '{{received}}'",
    too_small: "\u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10DB\u10D8\u10DC\u10D8\u10DB\u10E3\u10DB {{minimum}}",
    too_big: "\u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10DB\u10D0\u10E5\u10E1\u10D8\u10DB\u10E3\u10DB {{maximum}}"
  }, "\u10D2\u10E3\u10DA\u10D8\u10E1\u10EE\u10DB\u10DD\u10D1\u10D3\u10D8\u10D7 '{{suggestion}}'?"),
  createLocaleBundle("az", "Az\u0259rbaycan", {
    invalid_type: "{{expected}} g\xF6zl\u0259nilirdi, {{received}} al\u0131nd\u0131",
    invalid_enum_value: "Yanl\u0131\u015F enum d\u0259y\u0259ri. {{options}} g\xF6zl\u0259nilirdi, '{{received}}' al\u0131nd\u0131",
    too_small: "\u018Fn az\u0131 {{minimum}} olmal\u0131d\u0131r",
    too_big: "\u018Fn \xE7oxu {{maximum}} olmal\u0131d\u0131r"
  }, "'{{suggestion}}' dem\u0259k ist\u0259diniz?"),
  createLocaleBundle("kk", "\u049A\u0430\u0437\u0430\u049B", {
    invalid_type: "{{expected}} \u043A\u04AF\u0442\u0456\u043B\u0434\u0456, {{received}} \u0430\u043B\u044B\u043D\u0434\u044B",
    invalid_enum_value: "\u0416\u0430\u0440\u0430\u043C\u0441\u044B\u0437 enum \u043C\u04D9\u043D\u0456. {{options}} \u043A\u04AF\u0442\u0456\u043B\u0434\u0456, '{{received}}' \u0430\u043B\u044B\u043D\u0434\u044B",
    too_small: "\u041A\u0435\u043C\u0456\u043D\u0434\u0435 {{minimum}} \u0431\u043E\u043B\u0443\u044B \u043A\u0435\u0440\u0435\u043A",
    too_big: "\u0415\u04A3 \u043A\u04E9\u0431\u0456 {{maximum}} \u0431\u043E\u043B\u0443\u044B \u043A\u0435\u0440\u0435\u043A"
  }, "'{{suggestion}}' \u0434\u0435\u043F \u043E\u0439\u043B\u0430\u0434\u044B\u04A3\u044B\u0437 \u0431\u0430?"),
  createLocaleBundle("uz", "O\u02BBzbek", {
    invalid_type: "{{expected}} kutilgan, {{received}} olindi",
    invalid_enum_value: "Noto'g'ri enum qiymati. {{options}} kutilgan, '{{received}}' olindi",
    too_small: "Kamida {{minimum}} bo'lishi kerak",
    too_big: "Ko'pi bilan {{maximum}} bo'lishi kerak"
  }, "'{{suggestion}}' demoqchimisiz?"),
  createLocaleBundle("mn", "\u041C\u043E\u043D\u0433\u043E\u043B", {
    invalid_type: "{{expected}} \u0445\u04AF\u043B\u044D\u044D\u0433\u0434\u0441\u044D\u043D, {{received}} \u0438\u0440\u0441\u044D\u043D",
    invalid_enum_value: "\u0411\u0443\u0440\u0443\u0443 enum \u0443\u0442\u0433\u0430. {{options}} \u0445\u04AF\u043B\u044D\u044D\u0433\u0434\u0441\u044D\u043D, '{{received}}' \u0438\u0440\u0441\u044D\u043D",
    too_small: "\u0425\u0430\u043C\u0433\u0438\u0439\u043D \u0431\u0430\u0433\u0430\u0434\u0430\u0430 {{minimum}} \u0431\u0430\u0439\u0445 \u0451\u0441\u0442\u043E\u0439",
    too_big: "\u0425\u0430\u043C\u0433\u0438\u0439\u043D \u0438\u0445\u0434\u044D\u044D {{maximum}} \u0431\u0430\u0439\u0445 \u0451\u0441\u0442\u043E\u0439"
  }, "'{{suggestion}}' \u0433\u044D\u0436 \u04AF\u04AF?"),
  createLocaleBundle("ne", "\u0928\u0947\u092A\u093E\u0932\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, {{received}} \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    invalid_enum_value: "\u0905\u092E\u093E\u0928\u094D\u092F enum \u092E\u093E\u0928\u0964 {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092A\u094D\u0930\u093E\u092A\u094D\u0924",
    too_small: "\u0915\u092E\u094D\u0924\u0940\u092E\u093E {{minimum}} \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B",
    too_big: "\u092C\u0922\u0940\u092E\u093E {{maximum}} \u0939\u0941\u0928\u0941\u092A\u0930\u094D\u091B"
  }, "\u0915\u0947 \u0924\u092A\u093E\u0908\u0902 '{{suggestion}}' \u092D\u0928\u094D\u0928 \u0916\u094B\u091C\u094D\u0928\u0941\u0939\u0941\u0928\u094D\u0925\u094D\u092F\u094B?"),
  createLocaleBundle("ta", "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", {
    invalid_type: "{{expected}} \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1, {{received}} \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1",
    invalid_enum_value: "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 enum \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1. {{options}} \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1, '{{received}}' \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1",
    too_small: "\u0B95\u0BC1\u0BB1\u0BC8\u0BA8\u0BCD\u0BA4\u0BA4\u0BC1 {{minimum}} \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    too_big: "\u0B85\u0BA4\u0BBF\u0B95\u0BAA\u0B9F\u0BCD\u0B9A\u0BAE\u0BCD {{maximum}} \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD"
  }, "'{{suggestion}}' \u0B8E\u0BA9\u0BCD\u0BB1\u0BC1 \u0B9A\u0BCA\u0BB2\u0BCD\u0BB2 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAE\u0BCD\u0BAA\u0BBF\u0BA9\u0BC0\u0BB0\u0BCD\u0B95\u0BB3\u0BBE?"),
  createLocaleBundle("te", "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", {
    invalid_type: "{{expected}} \u0C05\u0C02\u0C1A\u0C28\u0C3E, {{received}} \u0C05\u0C02\u0C26\u0C3F\u0C02\u0C26\u0C3F",
    invalid_enum_value: "\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C28\u0C3F enum \u0C35\u0C3F\u0C32\u0C41\u0C35. {{options}} \u0C05\u0C02\u0C1A\u0C28\u0C3E, '{{received}}' \u0C05\u0C02\u0C26\u0C3F\u0C02\u0C26\u0C3F",
    too_small: "\u0C15\u0C28\u0C40\u0C38\u0C02 {{minimum}} \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F",
    too_big: "\u0C17\u0C30\u0C3F\u0C37\u0C4D\u0C1F\u0C02\u0C17\u0C3E {{maximum}} \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C3F"
  }, "'{{suggestion}}' \u0C05\u0C28\u0C3F \u0C05\u0C30\u0C4D\u0C25\u0C2E\u0C3E?"),
  createLocaleBundle("kn", "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", {
    invalid_type: "{{expected}} \u0CA8\u0CBF\u0CB0\u0CC0\u0C95\u0CCD\u0CB7\u0CBF\u0CB8\u0CB2\u0CBE\u0C97\u0CBF\u0CA6\u0CC6, {{received}} \u0CB8\u0CBF\u0C95\u0CCD\u0C95\u0CBF\u0CA6\u0CC6",
    invalid_enum_value: "\u0C85\u0CAE\u0CBE\u0CA8\u0CCD\u0CAF enum \u0CAE\u0CCC\u0CB2\u0CCD\u0CAF. {{options}} \u0CA8\u0CBF\u0CB0\u0CC0\u0C95\u0CCD\u0CB7\u0CBF\u0CB8\u0CB2\u0CBE\u0C97\u0CBF\u0CA6\u0CC6, '{{received}}' \u0CB8\u0CBF\u0C95\u0CCD\u0C95\u0CBF\u0CA6\u0CC6",
    too_small: "\u0C95\u0CA8\u0CBF\u0CB7\u0CCD\u0CA0 {{minimum}} \u0C87\u0CB0\u0CAC\u0CC7\u0C95\u0CC1",
    too_big: "\u0C97\u0CB0\u0CBF\u0CB7\u0CCD\u0CA0 {{maximum}} \u0C87\u0CB0\u0CAC\u0CC7\u0C95\u0CC1"
  }, "'{{suggestion}}' \u0C8E\u0C82\u0CA6\u0CC1 \u0C85\u0CB0\u0CCD\u0CA5\u0CB5\u0CC7?"),
  createLocaleBundle("ml", "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", {
    invalid_type: "{{expected}} \u0D2A\u0D4D\u0D30\u0D24\u0D40\u0D15\u0D4D\u0D37\u0D3F\u0D1A\u0D4D\u0D1A\u0D41, {{received}} \u0D32\u0D2D\u0D3F\u0D1A\u0D4D\u0D1A\u0D41",
    invalid_enum_value: "\u0D05\u0D38\u0D3E\u0D27\u0D41\u0D35\u0D3E\u0D2F enum \u0D2E\u0D42\u0D32\u0D4D\u0D2F\u0D02. {{options}} \u0D2A\u0D4D\u0D30\u0D24\u0D40\u0D15\u0D4D\u0D37\u0D3F\u0D1A\u0D4D\u0D1A\u0D41, '{{received}}' \u0D32\u0D2D\u0D3F\u0D1A\u0D4D\u0D1A\u0D41",
    too_small: "\u0D15\u0D41\u0D31\u0D1E\u0D4D\u0D1E\u0D24\u0D4D {{minimum}} \u0D06\u0D2F\u0D3F\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D23\u0D02",
    too_big: "\u0D2A\u0D30\u0D2E\u0D3E\u0D35\u0D27\u0D3F {{maximum}} \u0D06\u0D2F\u0D3F\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D23\u0D02"
  }, "'{{suggestion}}' \u0D0E\u0D28\u0D4D\u0D28\u0D4D \u0D05\u0D7C\u0D24\u0D4D\u0D25\u0D2E\u0D3E\u0D15\u0D4D\u0D15\u0D3F\u0D2F\u0D4B?"),
  createLocaleBundle("mr", "\u092E\u0930\u093E\u0920\u0940", {
    invalid_type: "{{expected}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, {{received}} \u092E\u093F\u0933\u093E\u0932\u0947",
    invalid_enum_value: "\u0905\u0935\u0948\u0927 enum \u092E\u0942\u0932\u094D\u092F. {{options}} \u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924, '{{received}}' \u092E\u093F\u0933\u093E\u0932\u0947",
    too_small: "\u0915\u093F\u092E\u093E\u0928 {{minimum}} \u0905\u0938\u093E\u0935\u0947",
    too_big: "\u091C\u093E\u0938\u094D\u0924\u0940\u0924 \u091C\u093E\u0938\u094D\u0924 {{maximum}} \u0905\u0938\u093E\u0935\u0947"
  }, "\u0924\u0941\u092E\u094D\u0939\u093E\u0932\u093E '{{suggestion}}' \u092E\u094D\u0939\u0923\u093E\u092F\u091A\u0947 \u0939\u094B\u0924\u0947 \u0915\u093E?"),
  createLocaleBundle("gu", "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", {
    invalid_type: "{{expected}} \u0A85\u0AAA\u0AC7\u0A95\u0ACD\u0AB7\u0ABF\u0AA4, {{received}} \u0AAE\u0AB3\u0ACD\u0AAF\u0AC1\u0A82",
    invalid_enum_value: "\u0A85\u0AAE\u0ABE\u0AA8\u0ACD\u0AAF enum \u0AAE\u0AC2\u0AB2\u0ACD\u0AAF. {{options}} \u0A85\u0AAA\u0AC7\u0A95\u0ACD\u0AB7\u0ABF\u0AA4, '{{received}}' \u0AAE\u0AB3\u0ACD\u0AAF\u0AC1\u0A82",
    too_small: "\u0A93\u0A9B\u0ABE\u0AAE\u0ABE\u0A82 \u0A93\u0A9B\u0AC1\u0A82 {{minimum}} \u0AB9\u0ACB\u0AB5\u0AC1\u0A82 \u0A9C\u0ACB\u0A88\u0A8F",
    too_big: "\u0AB5\u0AA7\u0AC1\u0AAE\u0ABE\u0A82 \u0AB5\u0AA7\u0AC1 {{maximum}} \u0AB9\u0ACB\u0AB5\u0AC1\u0A82 \u0A9C\u0ACB\u0A88\u0A8F"
  }, "\u0AB6\u0AC1\u0A82 \u0AA4\u0AAE\u0ABE\u0AB0\u0ACB \u0A85\u0AB0\u0ACD\u0AA5 '{{suggestion}}' \u0AB9\u0AA4\u0ACB?"),
  createLocaleBundle("pa", "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", {
    invalid_type: "{{expected}} \u0A09\u0A2E\u0A40\u0A26, {{received}} \u0A2E\u0A3F\u0A32\u0A3F\u0A06",
    invalid_enum_value: "\u0A05\u0A35\u0A48\u0A27 enum \u0A2E\u0A41\u0A71\u0A32. {{options}} \u0A09\u0A2E\u0A40\u0A26, '{{received}}' \u0A2E\u0A3F\u0A32\u0A3F\u0A06",
    too_small: "\u0A18\u0A71\u0A1F\u0A4B-\u0A18\u0A71\u0A1F {{minimum}} \u0A39\u0A4B\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A40\u0A26\u0A3E \u0A39\u0A48",
    too_big: "\u0A35\u0A71\u0A27 \u0A24\u0A4B\u0A02 \u0A35\u0A71\u0A27 {{maximum}} \u0A39\u0A4B\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A40\u0A26\u0A3E \u0A39\u0A48"
  }, "\u0A15\u0A40 \u0A24\u0A41\u0A39\u0A3E\u0A21\u0A3E \u0A2E\u0A24\u0A32\u0A2C '{{suggestion}}' \u0A38\u0A40?"),
  createLocaleBundle("am", "\u12A0\u121B\u122D\u129B", {
    invalid_type: "{{expected}} \u12E8\u121A\u1320\u1260\u1240\u12CD\u1363 {{received}} \u12F0\u122D\u1237\u120D",
    invalid_enum_value: "\u12E8\u121B\u12ED\u1230\u122B enum \u12A5\u1234\u1275\u1362 {{options}} \u12E8\u121A\u1320\u1260\u1240\u12CD\u1363 '{{received}}' \u12F0\u122D\u1237\u120D",
    too_small: "\u1262\u12EB\u1295\u1235 {{minimum}} \u1218\u1206\u1295 \u12A0\u1208\u1260\u1275",
    too_big: "\u1262\u1260\u12DB {{maximum}} \u1218\u1206\u1295 \u12A0\u1208\u1260\u1275"
  }, "'{{suggestion}}' \u121B\u1208\u1275 \u1290\u1260\u122D?"),
  createLocaleBundle("yo", "Yor\xF9b\xE1", {
    invalid_type: "A nireti {{expected}}, a gba {{received}}",
    invalid_enum_value: "Iye enum ti ko t\u1ECD. A nireti {{options}}, a gba '{{received}}'",
    too_small: "Gb\u1ECDd\u1ECD j\u1EB9 o kere ju {{minimum}} l\u1ECD",
    too_big: "Gb\u1ECDd\u1ECD j\u1EB9 ko ju {{maximum}} l\u1ECD"
  }, "Se o tum\u1ECD si '{{suggestion}}'?"),
  createLocaleBundle("ig", "Igbo", {
    invalid_type: "A t\u1EE5r\u1EE5 anya {{expected}}, enwetara {{received}}",
    invalid_enum_value: "Ur\xFA enum na-ad\u1ECBgh\u1ECB mma. A t\u1EE5r\u1EE5 anya {{options}}, enwetara '{{received}}'",
    too_small: "Ga-ab\u1EE5r\u1ECBr\u1ECB na opekata mgbe {{minimum}}",
    too_big: "Ga-ab\u1EE5r\u1ECBr\u1ECB na \u1ECD d\u1ECBgh\u1ECB kar\u1ECBa {{maximum}}"
  }, "\u1ECA p\u1EE5tara '{{suggestion}}'?"),
  createLocaleBundle("ha", "Hausa", {
    invalid_type: "Ana sa ran {{expected}}, an kar\u0253i {{received}}",
    invalid_enum_value: "Darajar enum mara inganci. Ana sa ran {{options}}, an kar\u0253i '{{received}}'",
    too_small: "Dole ya kasance a\u0199alla {{minimum}}",
    too_big: "Dole ya kasance mafi yawa {{maximum}}"
  }, "Kuna nufin '{{suggestion}}'?"),
  createLocaleBundle("eu", "Euskara", {
    invalid_type: "{{expected}} espero zen, {{received}} jaso da",
    invalid_enum_value: "Enum balio baliogabea. {{options}} espero zen, '{{received}}' jaso da",
    too_small: "Gutxienez {{minimum}} izan behar da",
    too_big: "Gehienez {{maximum}} izan behar da"
  }, "'{{suggestion}}' esan nahi zenuen?"),
  createLocaleBundle("gl", "Galego", {
    invalid_type: "Agard\xE1base {{expected}}, recibiuse {{received}}",
    invalid_enum_value: "Valor de enum non v\xE1lido. Agard\xE1base {{options}}, recibiuse '{{received}}'",
    too_small: "Debe ser maior ou igual a {{minimum}}",
    too_big: "Debe ser menor ou igual a {{maximum}}"
  }, "Quixo dicir '{{suggestion}}'?")
];
var registry = new Map(
  LOCALE_DATA.map((bundle) => [bundle.code, bundle])
);
function getLocaleBundle(code) {
  return registry.get(code) ?? EN_BUNDLE;
}

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
  const config3 = getGlobalConfig();
  if (config3.suggestions === false) return void 0;
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
  const config3 = getGlobalConfig();
  const fromParams = applyErrorMap(issue, ctx.common.contextualErrorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromParams) return fromParams;
  const fromGlobal = applyErrorMap(issue, config3.errorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromGlobal) return fromGlobal;
  const fromLocale = localeMessage(issue, suggestion);
  if (fromLocale) return fromLocale;
  if (suggestion) {
    const bundle = getLocaleBundle(config3.locale ?? "en");
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

// src/integrations/electron/index.ts
function validateIpcHandler(channel, schema, handler, options = {}) {
  const sanitize = options.sanitize !== false;
  const replyOnError = options.replyOnError !== false;
  const errorChannel = options.errorChannel ?? `${channel}:error`;
  return async (event, rawData) => {
    let payload = rawData;
    if (sanitize) payload = sanitizeInput(payload);
    const result = schema.safeParse(payload);
    if (!result.success) {
      if (replyOnError) {
        const failure = formatValidationFailure(result.error);
        event.reply(errorChannel, failure.body);
      }
      return;
    }
    await handler(event, result.data);
  };
}
function registerSecureIpcHandler(ipcMain, channel, schema, handler, options) {
  const wrapped = validateIpcHandler(channel, schema, handler, options);
  const mode = options?.mode ?? "handle";
  if (mode === "handle") {
    ipcMain.handle(channel, (event, ...args) => wrapped(event, args[0]));
  } else {
    ipcMain.on(channel, (event, ...args) => {
      void wrapped(event, args[0]);
    });
  }
}
function parseIpcMessage(schema, rawData, options = {}) {
  let payload = rawData;
  if (options.sanitize !== false) payload = sanitizeInput(payload);
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: formatValidationFailure(result.error) };
}

// src/security/config.ts
var currentSecurityConfig = {
  paranoid: false,
  blockUnsafeRegex: true,
  sandboxRefinements: false,
  refinementTimeoutMs: 100
};
function getSecurityConfig() {
  return currentSecurityConfig;
}
function configureSecurity(options) {
  currentSecurityConfig = {
    ...currentSecurityConfig,
    ...options,
    ...options.paranoidOptions !== void 0 ? { paranoidOptions: options.paranoidOptions } : {}
  };
}
var securityConfig = configureSecurity;
function resetSecurityConfig() {
  currentSecurityConfig = {
    paranoid: false,
    blockUnsafeRegex: true,
    sandboxRefinements: false,
    refinementTimeoutMs: 100
  };
}

// src/security/sandbox.ts
var RefinementSandboxError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RefinementSandboxError";
  }
};
async function sandboxedRefinement(value, check, timeoutMs = 100) {
  let timer;
  try {
    const result = await Promise.race([
      Promise.resolve(check(value)),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new RefinementSandboxError(`Refinement timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      })
    ]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
function sandboxedRefinementSync(value, check, timeoutMs = 100) {
  const start = Date.now();
  const result = check(value);
  if (Date.now() - start > timeoutMs) {
    throw new RefinementSandboxError(`Refinement exceeded ${timeoutMs}ms`);
  }
  return result;
}
var RefinementSandbox = class {
  constructor(timeoutMs = 100) {
    this.timeoutMs = timeoutMs;
  }
  timeoutMs;
  run(check, value) {
    return sandboxedRefinementSync(value, check, this.timeoutMs);
  }
  async runAsync(check, value) {
    return sandboxedRefinement(value, check, this.timeoutMs);
  }
};
function createRefinementSandbox(timeoutMs = 100) {
  return new RefinementSandbox(timeoutMs);
}

// src/core.ts
var InputFyType = class {
  _input;
  _output;
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = createParseContext(data, params);
    try {
      const result = this._parseSync(ctx);
      if (ctx.common.issues.length > 0) {
        return { success: false, error: new InputFyError(ctx.common.issues) };
      }
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof InputFyError) return { success: false, error: err };
      throw err;
    }
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = createParseContext(data, { ...params, async: true });
    try {
      const result = await this._parseAsync(ctx);
      if (ctx.common.issues.length > 0) {
        return { success: false, error: new InputFyError(ctx.common.issues) };
      }
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof InputFyError) return { success: false, error: err };
      throw err;
    }
  }
  describe(description) {
    const cloned = this._clone();
    cloned._def = {
      ...cloned._def,
      description,
      metadata: { ...cloned._def.metadata ?? {}, description }
    };
    return cloned;
  }
  brand() {
    return this;
  }
  refine(check, message) {
    const msg = typeof message === "string" ? message : message?.message;
    const fatal = typeof message === "object" ? message.fatal : void 0;
    return this._addRefine(check, msg, fatal);
  }
  superRefine(check) {
    return this._addSuperRefine(check);
  }
  transform(transform) {
    return this._addTransform(transform);
  }
  _addRefine(check, message, fatal) {
    return this._withEffect({
      type: "refinement",
      refinement: check,
      message,
      fatal
    });
  }
  _addSuperRefine(check) {
    const refinement = async (val, ctx) => {
      await check(val, ctx);
      return true;
    };
    return this._withEffect({ type: "refinement", refinement, fatal: true });
  }
  _addTransform(transform) {
    return this._withEffect({
      type: "transform",
      transform
    });
  }
  _withEffect(effect) {
    const cloned = this._clone();
    cloned._def = {
      ...cloned._def,
      effects: [...cloned._def.effects ?? [], effect]
    };
    return cloned;
  }
  _parseSync(ctx) {
    const result = this._parseWithEffects(ctx);
    if (isPromise(result)) {
      throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
    }
    return result;
  }
  async _parseAsync(ctx) {
    return await Promise.resolve(this._parseWithEffects(ctx));
  }
  _parseWithEffects(ctx) {
    const baseResult = this._parse(ctx);
    const effects = this._def.effects;
    if (!effects || effects.length === 0) return baseResult;
    const runRefinement = (effect, current) => {
      const sec = getSecurityConfig();
      const fn = effect.refinement;
      if (sec.sandboxRefinements) {
        try {
          return sandboxedRefinementSync(
            current,
            (v2) => {
              const r2 = fn(v2, makeRefinementCtx(ctx));
              if (r2 instanceof Promise) {
                throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
              }
              return r2 !== false;
            },
            sec.refinementTimeoutMs ?? 100
          );
        } catch (err) {
          if (err instanceof RefinementSandboxError) {
            sec.auditLog?.log({
              type: "sandbox_timeout",
              message: err.message
            });
            addIssue(ctx, { code: "custom", message: err.message });
            return false;
          }
          throw err;
        }
      }
      const r = fn(current, makeRefinementCtx(ctx));
      if (r instanceof Promise) return r.then((ok) => ok !== false);
      return r !== false;
    };
    const runEffects = (value) => {
      let current = value;
      for (const effect of effects) {
        if (effect.type === "preprocess") {
          const next = effect.transform(current, makeRefinementCtx(ctx));
          if (next instanceof Promise) {
            return next.then((resolved) => runEffectsSync(resolved, effects.indexOf(effect) + 1));
          }
          current = next;
          continue;
        }
        if (effect.type === "transform") {
          const next = effect.transform(current, makeRefinementCtx(ctx));
          if (next instanceof Promise) {
            return next.then((resolved) => runEffectsSync(resolved, effects.indexOf(effect) + 1));
          }
          current = next;
          continue;
        }
        if (effect.type === "refinement") {
          const result = runRefinement(effect, current);
          if (result instanceof Promise) {
            return result.then((ok) => {
              if (ok === false) {
                addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
                if (effect.fatal) return current;
              }
              return runEffectsSync(current, effects.indexOf(effect) + 1);
            });
          }
          if (result === false) {
            addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
            if (effect.fatal) break;
          }
        }
      }
      return current;
    };
    const runEffectsSync = (value, startIndex) => {
      let current = value;
      for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        if (effect.type === "preprocess" || effect.type === "transform") {
          throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
        }
        if (effect.type === "refinement") {
          const result = runRefinement(effect, current);
          if (result instanceof Promise) {
            throw new Error("Synchronous parse encountered promise. Use parseAsync instead.");
          }
          if (result === false) {
            addIssue(ctx, { code: "custom", message: effect.message ?? "Invalid input" });
            if (effect.fatal) break;
          }
        }
      }
      return current;
    };
    if (isPromise(baseResult)) {
      return baseResult.then(runEffects);
    }
    return runEffects(baseResult);
  }
};

// src/utils.ts
function deepClone(value) {
  return cloneValue(value, /* @__PURE__ */ new WeakMap(), 0);
}
function cloneValue(value, seen, depth) {
  if (depth > 128) {
    throw new Error("Maximum clone depth exceeded");
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      throw new Error(`Array length exceeds maximum of ${MAX_ARRAY_LENGTH}`);
    }
    return value.map((item) => cloneValue(item, seen, depth + 1));
  }
  if (value instanceof Map) {
    const map2 = /* @__PURE__ */ new Map();
    seen.set(value, map2);
    for (const [k, v2] of value) {
      map2.set(cloneValue(k, seen, depth + 1), cloneValue(v2, seen, depth + 1));
    }
    return map2;
  }
  if (value instanceof Set) {
    const set2 = /* @__PURE__ */ new Set();
    seen.set(value, set2);
    for (const v2 of value) {
      set2.add(cloneValue(v2, seen, depth + 1));
    }
    return set2;
  }
  if (seen.has(value)) {
    return seen.get(value);
  }
  const result = /* @__PURE__ */ Object.create(null);
  seen.set(value, result);
  const keys = Object.keys(value);
  if (keys.length > MAX_OBJECT_KEYS) {
    throw new Error(`Object key count exceeds maximum of ${MAX_OBJECT_KEYS}`);
  }
  for (const key of keys) {
    if (DANGEROUS_KEYS.has(key)) continue;
    result[key] = cloneValue(value[key], seen, depth + 1);
  }
  return result;
}
function isSafeKey(key) {
  return !DANGEROUS_KEYS.has(key) && key.length <= 256;
}
function assertSafeString(value, context) {
  if (value.length > MAX_STRING_LENGTH) {
    throw new Error(`${context}: string length exceeds maximum of ${MAX_STRING_LENGTH}`);
  }
}
function getOwnKeys(obj) {
  return Object.keys(obj).filter(isSafeKey);
}
function parseNumberInput(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string" && val.trim() !== "") {
    const num2 = Number(val);
    return Number.isNaN(num2) ? null : num2;
  }
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "bigint") return Number(val);
  return null;
}
function parseBooleanInput(val) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0" || lower === "") return false;
  }
  if (typeof val === "number") return val !== 0;
  return null;
}
function parseBigIntInput(val) {
  if (typeof val === "bigint") return val;
  if (typeof val === "number" && Number.isInteger(val)) return BigInt(val);
  if (typeof val === "string" && val.trim() !== "") {
    try {
      return BigInt(val);
    } catch {
      return null;
    }
  }
  return null;
}
function parseDateInput(val) {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const date = new Date(val);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}
function getEnumValues(enumObj) {
  const values = Object.values(enumObj);
  const isNumericEnum = values.some((v2) => typeof v2 === "number");
  if (isNumericEnum) {
    return values.filter((v2) => typeof v2 === "number");
  }
  return values.filter((v2) => typeof v2 === "string");
}
function readonly(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return Object.freeze(value.map(readonly));
  }
  const result = /* @__PURE__ */ Object.create(null);
  for (const [k, v2] of Object.entries(value)) {
    result[k] = readonly(v2);
  }
  return Object.freeze(result);
}

// src/schemas/parse-inner.ts
function parseInner(schema, ctx, data, pathSegment) {
  const input = arguments.length >= 3 ? data : ctx.data;
  const depth = ctx.depth + 1;
  if (depth > MAX_PARSE_DEPTH) {
    throw new Error(`Maximum parse depth of ${MAX_PARSE_DEPTH} exceeded`);
  }
  const innerCtx = {
    common: ctx.common,
    path: pathSegment !== void 0 ? [...ctx.path, pathSegment] : ctx.path,
    parent: ctx,
    data: input,
    parsedType: getParsedType(input),
    depth
  };
  return schema._parse(innerCtx);
}

// src/schemas/modifiers.ts
var InputFyOptional = class _InputFyOptional extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    if (ctx.data === void 0) return void 0;
    return parseInner(this._def.innerType, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyOptional({ ...this._def });
  }
  unwrap() {
    return this._def.innerType;
  }
};
var InputFyNullable = class _InputFyNullable extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    if (ctx.data === null) return null;
    return parseInner(this._def.innerType, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyNullable({ ...this._def });
  }
  unwrap() {
    return this._def.innerType;
  }
};
var InputFyDefault = class _InputFyDefault extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    if (ctx.data === void 0) {
      return this._def.defaultValue();
    }
    return parseInner(this._def.innerType, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyDefault({ ...this._def });
  }
  unwrap() {
    return this._def.innerType;
  }
  removeDefault() {
    return this._def.innerType;
  }
};
var InputFyCatch = class _InputFyCatch extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    const innerCtx = childContext(ctx, ctx.data);
    innerCtx.common = { ...ctx.common, issues: [] };
    this._def.innerType._parse(innerCtx);
    if (innerCtx.common.issues.length > 0) {
      return this._def.catchValue({
        error: new InputFyError([...innerCtx.common.issues]),
        input: ctx.data
      });
    }
    return parseInner(this._def.innerType, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyCatch({ ...this._def });
  }
  unwrap() {
    return this._def.innerType;
  }
};
var InputFyReadonly = class _InputFyReadonly extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    const result = parseInner(this._def.innerType, ctx);
    return readonly(result);
  }
  _clone() {
    return new _InputFyReadonly({ ...this._def });
  }
  unwrap() {
    return this._def.innerType;
  }
};

// src/patterns.ts
var EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/;
var UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
var CUID_REGEX = /^c[a-z0-9]{24}$/;
var CUID2_REGEX = /^[a-z0-9]{2,128}$/;
var ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;
var NANOID_REGEX = /^[A-Za-z0-9_-]{21}$/;
var IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
var BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
var ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
var ISO_TIME_REGEX = /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;
var ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ftp:";
  } catch {
    return false;
  }
}
function isValidJwt(value) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  return parts.every((part) => BASE64_REGEX.test(part.replace(/-/g, "+").replace(/_/g, "/")));
}
function testRegexSafe(regex, value, maxLength = 1e4) {
  if (value.length > maxLength) return false;
  return regex.test(value);
}

// src/security/redos.ts
var NESTED_QUANTIFIER = /(\([^)]*[+*][^)]*\)[+*])|(\([^)]*[+*][^)]*\)\{)/;
var OVERLAPPING_ALTERNATION = /\([^)]*\|[^)]*\)[+*]/;
var LONG_QUANTIFIER = /\{\d{4,},?\d*\}/;
var BACKTRACK_HEAVY = /(\.\*){2,}|(\.\+){2,}|(\.?\\s\*){2,}/;
var UnsafeRegexError = class extends Error {
  analysis;
  constructor(analysis) {
    super(`Unsafe regex detected (${analysis.risk}): ${analysis.reasons.join("; ")}`);
    this.name = "UnsafeRegexError";
    this.analysis = analysis;
  }
};
function analyzeRegex(regex) {
  const source = regex.source;
  const reasons = [];
  let risk = "low";
  if (NESTED_QUANTIFIER.test(source)) {
    reasons.push("Nested quantifiers detected");
    risk = "high";
  }
  if (OVERLAPPING_ALTERNATION.test(source)) {
    reasons.push("Quantified alternation may cause backtracking");
    risk = elevate(risk, "high");
  }
  if (LONG_QUANTIFIER.test(source)) {
    reasons.push("Very large repetition bounds");
    risk = elevate(risk, "medium");
  }
  if (BACKTRACK_HEAVY.test(source)) {
    reasons.push("Multiple greedy wildcards");
    risk = elevate(risk, "medium");
  }
  if (source.length > 500) {
    reasons.push("Regex source exceeds 500 characters");
    risk = elevate(risk, "medium");
  }
  return {
    risk,
    safe: risk !== "high",
    reasons,
    source
  };
}
function elevate(current, next) {
  const order = ["low", "medium", "high"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}
function assertSafeRegex(regex) {
  const analysis = analyzeRegex(regex);
  if (!analysis.safe) {
    throw new UnsafeRegexError(analysis);
  }
}
function isRegexSafe(regex) {
  return analyzeRegex(regex).safe;
}

// src/schemas/primitives.ts
var InputFyString = class _InputFyString extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce && typeof data !== "string") {
      if (data == null) {
        addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
        return "";
      }
      data = String(data);
    }
    if (typeof data !== "string") {
      addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
      return "";
    }
    assertSafeString(data, "string validation");
    let result = data;
    for (const check of this._def.checks) {
      if (check.kind === "trim") {
        result = result.trim();
        continue;
      }
      if (check.kind === "toLowerCase") {
        result = result.toLowerCase();
        continue;
      }
      if (check.kind === "toUpperCase") {
        result = result.toUpperCase();
        continue;
      }
      const valid = runStringCheck(result, check);
      if (!valid) {
        if (check.kind === "min" || check.kind === "max" || check.kind === "length") {
          addIssue(ctx, {
            code: check.kind === "min" ? "too_small" : "too_big",
            minimum: check.kind === "min" || check.kind === "length" ? check.value : 0,
            maximum: check.kind === "max" || check.kind === "length" ? check.value : 0,
            inclusive: true,
            exact: check.kind === "length",
            type: "string",
            message: check.message ?? defaultStringMessage(check)
          });
        } else {
          addIssue(ctx, {
            code: "invalid_string",
            validation: checkToValidation(check),
            message: check.message ?? `Invalid string validation: ${check.kind}`
          });
        }
      }
    }
    return result;
  }
  _clone() {
    return new _InputFyString({ ...this._def, checks: [...this._def.checks] });
  }
  min(len, message) {
    return this._addCheck({ kind: "min", value: len, message });
  }
  max(len, message) {
    return this._addCheck({ kind: "max", value: len, message });
  }
  length(len, message) {
    return this._addCheck({ kind: "length", value: len, message });
  }
  email(message) {
    return this._addCheck({ kind: "email", message });
  }
  url(message) {
    return this._addCheck({ kind: "url", message });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", message });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", message });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", message });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", message });
  }
  regex(regex, message) {
    const sec = getSecurityConfig();
    if (sec.blockUnsafeRegex !== false) {
      const analysis = analyzeRegex(regex);
      if (!analysis.safe) {
        sec.auditLog?.log({
          type: "redos_blocked",
          message: `Unsafe regex blocked: ${analysis.reasons.join(", ")}`,
          pattern: regex.source
        });
        throw new UnsafeRegexError(analysis);
      }
    }
    return this._addCheck({ kind: "regex", regex, message });
  }
  includes(value, message) {
    return this._addCheck({ kind: "includes", value, message });
  }
  startsWith(value, message) {
    return this._addCheck({ kind: "startsWith", value, message });
  }
  endsWith(value, message) {
    return this._addCheck({ kind: "endsWith", value, message });
  }
  datetime(message) {
    return this._addCheck({ kind: "datetime", message });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", version: options?.version, message: options?.message });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", message });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", message });
  }
  jwt(message) {
    return this._addCheck({ kind: "jwt", message });
  }
  trim() {
    return this._addCheck({ kind: "trim" });
  }
  toLowerCase() {
    return this._addCheck({ kind: "toLowerCase" });
  }
  toUpperCase() {
    return this._addCheck({ kind: "toUpperCase" });
  }
  _addCheck(check) {
    const cloned = this._clone();
    cloned._def.checks.push(check);
    return cloned;
  }
};
function runStringCheck(value, check) {
  switch (check.kind) {
    case "min":
      return value.length >= check.value;
    case "max":
      return value.length <= check.value;
    case "length":
      return value.length === check.value;
    case "email":
      return testRegexSafe(EMAIL_REGEX, value);
    case "url":
      return isValidUrl(value);
    case "uuid":
      return testRegexSafe(UUID_REGEX, value);
    case "cuid":
      return testRegexSafe(CUID_REGEX, value);
    case "cuid2":
      return testRegexSafe(CUID2_REGEX, value);
    case "ulid":
      return testRegexSafe(ULID_REGEX, value);
    case "regex":
      return testRegexSafe(check.regex, value);
    case "includes":
      return value.includes(check.value);
    case "startsWith":
      return value.startsWith(check.value);
    case "endsWith":
      return value.endsWith(check.value);
    case "datetime":
      return !Number.isNaN(Date.parse(value));
    case "ip":
      return true;
    // simplified — full IP validation in patterns
    case "base64":
      return testRegexSafe(BASE64_REGEX, value);
    case "nanoid":
      return testRegexSafe(NANOID_REGEX, value);
    case "jwt":
      return isValidJwt(value);
    default:
      return true;
  }
}
function checkToValidation(check) {
  if (check.kind === "regex") return "regex";
  if (check.kind === "jwt") return "regex";
  if (check.kind === "ip") return "ip";
  return check.kind;
}
function defaultStringMessage(check) {
  if (check.kind === "min") return `String must contain at least ${check.value} character(s)`;
  if (check.kind === "max") return `String must contain at most ${check.value} character(s)`;
  if (check.kind === "length") return `String must contain exactly ${check.value} character(s)`;
  return "Invalid string";
}
var InputFyNumber = class _InputFyNumber extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseNumberInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "number", received: ctx.parsedType });
        return 0;
      }
      data = coerced;
    }
    if (typeof data !== "number" || Number.isNaN(data)) {
      addIssue(ctx, { code: "invalid_type", expected: "number", received: ctx.parsedType });
      return 0;
    }
    let value = data;
    for (const check of this._def.checks) {
      if (!runNumberCheck(value, check)) {
        if (check.kind === "finite") {
          addIssue(ctx, { code: "not_finite", ...check.message ? { message: check.message } : {} });
        } else if (check.kind === "multipleOf") {
          addIssue(ctx, {
            code: "not_multiple_of",
            multipleOf: check.value,
            ...check.message ? { message: check.message } : {}
          });
        } else if (check.kind === "int") {
          addIssue(ctx, { code: "invalid_type", expected: "integer", received: "number" });
        } else {
          addIssue(ctx, {
            code: check.kind === "min" ? "too_small" : "too_big",
            minimum: "value" in check ? check.value : 0,
            maximum: "value" in check ? check.value : 0,
            inclusive: "inclusive" in check ? check.inclusive : true,
            type: "number",
            message: check.message
          });
        }
      }
    }
    return value;
  }
  _clone() {
    return new _InputFyNumber({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    return this._addCheck({ kind: "min", value, inclusive: true, message });
  }
  max(value, message) {
    return this._addCheck({ kind: "max", value, inclusive: true, message });
  }
  gt(value, message) {
    return this._addCheck({ kind: "min", value, inclusive: false, message });
  }
  gte(value, message) {
    return this.min(value, message);
  }
  lt(value, message) {
    return this._addCheck({ kind: "max", value, inclusive: false, message });
  }
  lte(value, message) {
    return this.max(value, message);
  }
  int(message) {
    return this._addCheck({ kind: "int", message });
  }
  positive(message) {
    return this._addCheck({ kind: "positive", message });
  }
  negative(message) {
    return this._addCheck({ kind: "negative", message });
  }
  nonnegative(message) {
    return this._addCheck({ kind: "nonnegative", message });
  }
  nonpositive(message) {
    return this._addCheck({ kind: "nonpositive", message });
  }
  multipleOf(value, message) {
    return this._addCheck({ kind: "multipleOf", value, message });
  }
  finite(message) {
    return this._addCheck({ kind: "finite", message });
  }
  step(value, message) {
    return this.multipleOf(value, message);
  }
  _addCheck(check) {
    const cloned = this._clone();
    cloned._def.checks.push(check);
    return cloned;
  }
};
function runNumberCheck(value, check) {
  switch (check.kind) {
    case "min":
      return check.inclusive ? value >= check.value : value > check.value;
    case "max":
      return check.inclusive ? value <= check.value : value < check.value;
    case "int":
      return Number.isInteger(value);
    case "multipleOf":
      return value % check.value === 0;
    case "finite":
      return Number.isFinite(value);
    case "positive":
      return value > 0;
    case "negative":
      return value < 0;
    case "nonnegative":
      return value >= 0;
    case "nonpositive":
      return value <= 0;
    default:
      return true;
  }
}
var InputFyBoolean = class _InputFyBoolean extends InputFyType {
  _def;
  constructor(def = { typeName: "InputFyBoolean" }) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseBooleanInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "boolean", received: ctx.parsedType });
        return false;
      }
      data = coerced;
    }
    if (typeof data !== "boolean") {
      addIssue(ctx, { code: "invalid_type", expected: "boolean", received: ctx.parsedType });
      return false;
    }
    return data;
  }
  _clone() {
    return new _InputFyBoolean({ ...this._def });
  }
};
var InputFyBigInt = class _InputFyBigInt extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyBigInt",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseBigIntInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
        return 0n;
      }
      data = coerced;
    }
    if (typeof data !== "bigint") {
      addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
      return 0n;
    }
    for (const check of this._def.checks) {
      if (!runBigIntCheck(data, check)) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value,
          maximum: check.value,
          inclusive: check.inclusive,
          type: "bigint",
          message: check.message
        });
      }
    }
    return data;
  }
  _clone() {
    return new _InputFyBigInt({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, inclusive: true, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, inclusive: true, message });
    return c;
  }
};
function runBigIntCheck(value, check) {
  if (check.kind === "min") return check.inclusive ? value >= check.value : value > check.value;
  return check.inclusive ? value <= check.value : value < check.value;
}
var InputFyDate = class _InputFyDate extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyDate",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseDateInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_date" });
        return /* @__PURE__ */ new Date(NaN);
      }
      data = coerced;
    }
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      addIssue(ctx, { code: "invalid_date" });
      return /* @__PURE__ */ new Date(NaN);
    }
    for (const check of this._def.checks) {
      const cmp = check.kind === "min" ? data >= check.value : data <= check.value;
      if (!cmp) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value.getTime(),
          maximum: check.value.getTime(),
          inclusive: true,
          type: "date",
          message: check.message
        });
      }
    }
    return new Date(data.getTime());
  }
  _clone() {
    return new _InputFyDate({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, message });
    return c;
  }
};
function createSimpleType(typeName, expected, predicate, fallback) {
  return new class extends InputFyType {
    _def = { typeName };
    _parse(ctx) {
      if (!predicate(ctx.data, ctx)) {
        addIssue(ctx, { code: "invalid_type", expected, received: ctx.parsedType });
        return fallback;
      }
      return ctx.data;
    }
    _clone() {
      return new this.constructor();
    }
  }();
}
var InputFySymbol = createSimpleType(
  "InputFySymbol",
  "symbol",
  (d) => typeof d === "symbol",
  /* @__PURE__ */ Symbol()
);
var InputFyUndefined = createSimpleType(
  "InputFyUndefined",
  "undefined",
  (d) => d === void 0,
  void 0
);
var InputFyNull = createSimpleType(
  "InputFyNull",
  "null",
  (d) => d === null,
  null
);
var InputFyAny = class _InputFyAny extends InputFyType {
  _def = { typeName: "InputFyAny" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyAny();
  }
};
var InputFyUnknown = class _InputFyUnknown extends InputFyType {
  _def = { typeName: "InputFyUnknown" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyUnknown();
  }
};
var InputFyNever = class _InputFyNever extends InputFyType {
  _def = { typeName: "InputFyNever" };
  _parse(ctx) {
    addIssue(ctx, { code: "invalid_type", expected: "never", received: ctx.parsedType });
    return void 0;
  }
  _clone() {
    return new _InputFyNever();
  }
};
var InputFyVoid = class _InputFyVoid extends InputFyType {
  _def = { typeName: "InputFyVoid" };
  _parse(ctx) {
    if (ctx.data !== void 0) {
      addIssue(ctx, { code: "invalid_type", expected: "void", received: ctx.parsedType });
    }
  }
  _clone() {
    return new _InputFyVoid();
  }
};
var InputFyNaN = class _InputFyNaN extends InputFyType {
  _def = { typeName: "InputFyNaN" };
  _parse(ctx) {
    if (typeof ctx.data !== "number" || !Number.isNaN(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "nan", received: ctx.parsedType });
      return NaN;
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNaN();
  }
};
var InputFyLiteral = class _InputFyLiteral extends InputFyType {
  _def;
  constructor(value) {
    super();
    this._def = { typeName: "InputFyLiteral", value };
  }
  _parse(ctx) {
    if (ctx.data !== this._def.value) {
      addIssue(ctx, {
        code: "invalid_literal",
        expected: this._def.value,
        received: ctx.data
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyLiteral(this._def.value);
  }
};
var InputFyEnum = class _InputFyEnum extends InputFyType {
  _def;
  constructor(values) {
    super();
    this._def = { typeName: "InputFyEnum", values };
  }
  get enum() {
    const result = /* @__PURE__ */ Object.create(null);
    for (const v2 of this._def.values) result[v2] = v2;
    return result;
  }
  get options() {
    return this._def.values;
  }
  _parse(ctx) {
    if (typeof ctx.data !== "string" || !this._def.values.includes(ctx.data)) {
      addIssue(ctx, {
        code: "invalid_enum_value",
        options: this._def.values,
        received: ctx.data
      });
      return this._def.values[0];
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyEnum(this._def.values);
  }
  extract(values) {
    const filtered = this._def.values.filter((v2) => values.includes(v2));
    return new _InputFyEnum(filtered);
  }
  exclude(values) {
    const filtered = this._def.values.filter((v2) => !values.includes(v2));
    return new _InputFyEnum(filtered);
  }
};
var InputFyNativeEnum = class _InputFyNativeEnum extends InputFyType {
  _def;
  constructor(enumObj) {
    super();
    this._def = { typeName: "InputFyNativeEnum", enum: enumObj };
  }
  _parse(ctx) {
    const values = getEnumValues(this._def.enum);
    if (typeof ctx.data !== "string" && typeof ctx.data !== "number" || !values.includes(ctx.data)) {
      addIssue(ctx, {
        code: "invalid_enum_value",
        options: values,
        received: ctx.data
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNativeEnum(this._def.enum);
  }
};
var InputFyInstanceof = class _InputFyInstanceof extends InputFyType {
  _def;
  constructor(cls) {
    super();
    this._def = { typeName: "InputFyInstanceof", cls };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof this._def.cls)) {
      addIssue(ctx, {
        code: "invalid_type",
        expected: this._def.cls.name,
        received: ctx.parsedType
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyInstanceof(this._def.cls);
  }
};
var InputFyCustom = class _InputFyCustom extends InputFyType {
  _def;
  constructor(fn, message) {
    super();
    this._def = { typeName: "InputFyCustom", fn, message };
  }
  _parse(ctx) {
    if (!this._def.fn(ctx.data)) {
      addIssue(ctx, { code: "custom", message: this._def.message ?? "Invalid input" });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyCustom(this._def.fn, this._def.message);
  }
};

// src/schemas/complex.ts
var InputFyArray = class _InputFyArray extends InputFyType {
  _def;
  constructor(type, constraints = {}) {
    super();
    this._def = {
      typeName: "InputFyArray",
      type,
      minLength: constraints.minLength ?? null,
      maxLength: constraints.maxLength ?? null,
      exactLength: constraints.exactLength ?? null
    };
  }
  get element() {
    return this._def.type;
  }
  _parse(ctx) {
    if (!Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "array", received: ctx.parsedType });
      return [];
    }
    if (ctx.data.length > MAX_ARRAY_LENGTH) {
      addIssue(ctx, {
        code: "too_big",
        maximum: MAX_ARRAY_LENGTH,
        inclusive: true,
        type: "array",
        message: `Array size exceeds maximum of ${MAX_ARRAY_LENGTH}`
      });
      return [];
    }
    const len = ctx.data.length;
    if (this._def.exactLength !== null && len !== this._def.exactLength) {
      addIssue(ctx, {
        code: "too_small",
        minimum: this._def.exactLength,
        inclusive: true,
        exact: true,
        type: "array"
      });
    }
    if (this._def.minLength !== null && len < this._def.minLength) {
      addIssue(ctx, {
        code: "too_small",
        minimum: this._def.minLength,
        inclusive: true,
        type: "array"
      });
    }
    if (this._def.maxLength !== null && len > this._def.maxLength) {
      addIssue(ctx, {
        code: "too_big",
        maximum: this._def.maxLength,
        inclusive: true,
        type: "array"
      });
    }
    const result = [];
    for (let i = 0; i < ctx.data.length; i++) {
      result.push(parseInner(this._def.type, ctx, ctx.data[i], i));
    }
    return result;
  }
  _clone() {
    return new _InputFyArray(this._def.type, {
      minLength: this._def.minLength,
      maxLength: this._def.maxLength,
      exactLength: this._def.exactLength
    });
  }
  min(length) {
    const c = this._clone();
    c._def.minLength = length;
    return c;
  }
  max(length) {
    const c = this._clone();
    c._def.maxLength = length;
    return c;
  }
  length(length) {
    const c = this._clone();
    c._def.exactLength = length;
    return c;
  }
  nonempty() {
    return this.min(1);
  }
};
var NeverCatchall = class extends InputFyType {
  _def = { typeName: "NeverCatchall" };
  _parse(ctx) {
    addIssue(ctx, { code: "invalid_type", expected: "never", received: ctx.parsedType });
    return void 0;
  }
  _clone() {
    return this;
  }
};
var NEVER_CATCHALL = new NeverCatchall();
function createNeverCatchall() {
  return NEVER_CATCHALL;
}
var InputFyObject = class _InputFyObject extends InputFyType {
  _def;
  constructor(shape, params = {}) {
    super();
    this._def = {
      typeName: "InputFyObject",
      shape: () => shape,
      unknownKeys: params.unknownKeys ?? "strip",
      catchall: params.catchall ?? createNeverCatchall()
    };
  }
  get shape() {
    return this._def.shape();
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null || Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return {};
    }
    const input = ctx.data;
    const keys = getOwnKeys(input);
    if (keys.length > MAX_OBJECT_KEYS) {
      addIssue(ctx, {
        code: "custom",
        message: `Object key count exceeds maximum of ${MAX_OBJECT_KEYS}`
      });
      return {};
    }
    const shape = this._def.shape();
    const shapeKeys = new Set(Object.keys(shape));
    const result = /* @__PURE__ */ Object.create(null);
    for (const key of Object.keys(shape)) {
      const value = Object.prototype.hasOwnProperty.call(input, key) ? input[key] : void 0;
      result[key] = parseInner(shape[key], ctx, value, key);
    }
    const unrecognized = [];
    for (const key of keys) {
      if (!shapeKeys.has(key)) {
        if (this._def.unknownKeys === "strict") {
          unrecognized.push(key);
        } else if (this._def.unknownKeys === "passthrough") {
          result[key] = input[key];
        }
      }
    }
    if (unrecognized.length > 0) {
      addIssue(ctx, { code: "unrecognized_keys", keys: unrecognized });
    }
    return result;
  }
  _clone() {
    return new _InputFyObject(this._def.shape(), {
      unknownKeys: this._def.unknownKeys,
      catchall: this._def.catchall
    });
  }
  extend(shape) {
    return new _InputFyObject({ ...this._def.shape(), ...shape }, {
      unknownKeys: this._def.unknownKeys,
      catchall: this._def.catchall
    });
  }
  merge(other) {
    return this.extend(other._def.shape());
  }
  pick(mask) {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const key of Object.keys(mask)) {
      if (mask[key]) newShape[key] = this._def.shape()[key];
    }
    return new _InputFyObject(newShape);
  }
  omit(mask) {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const [key, schema] of Object.entries(this._def.shape())) {
      if (!mask[key]) newShape[key] = schema;
    }
    return new _InputFyObject(newShape);
  }
  partial() {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const [key, schema] of Object.entries(this._def.shape())) {
      newShape[key] = schema.optional();
    }
    return new _InputFyObject(newShape);
  }
  required() {
    return this;
  }
  strict() {
    const c = this._clone();
    c._def.unknownKeys = "strict";
    return c;
  }
  strip() {
    const c = this._clone();
    c._def.unknownKeys = "strip";
    return c;
  }
  passthrough() {
    const c = this._clone();
    c._def.unknownKeys = "passthrough";
    return c;
  }
  catchall(schema) {
    const c = this._clone();
    c._def.catchall = schema;
    return c;
  }
  keyof() {
    const keys = Object.keys(this._def.shape());
    return new InputFyEnum(keys);
  }
};
var InputFyTuple = class _InputFyTuple extends InputFyType {
  _def;
  constructor(items, rest = null) {
    super();
    this._def = { typeName: "InputFyTuple", items, rest };
  }
  _parse(ctx) {
    if (!Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "array", received: ctx.parsedType });
      return [];
    }
    const items = this._def.items;
    const data = ctx.data;
    if (data.length < items.length) {
      addIssue(ctx, {
        code: "too_small",
        minimum: items.length,
        inclusive: true,
        type: "array"
      });
    }
    const result = [];
    for (let i = 0; i < items.length; i++) {
      result.push(parseInner(items[i], childContext(ctx, data[i], i)));
    }
    if (this._def.rest) {
      for (let i = items.length; i < data.length; i++) {
        result.push(parseInner(this._def.rest, childContext(ctx, data[i], i)));
      }
    } else if (data.length > items.length) {
      addIssue(ctx, {
        code: "too_big",
        maximum: items.length,
        inclusive: true,
        type: "array"
      });
    }
    return result;
  }
  _clone() {
    return new _InputFyTuple(this._def.items, this._def.rest);
  }
  rest(rest) {
    return new _InputFyTuple(this._def.items, rest);
  }
};
var InputFyUnion = class _InputFyUnion extends InputFyType {
  _def;
  constructor(options) {
    super();
    this._def = { typeName: "InputFyUnion", options };
  }
  get options() {
    return this._def.options;
  }
  _parse(ctx) {
    const errors = [];
    const startIssueCount = ctx.common.issues.length;
    for (const option of this._def.options) {
      const optionCtx = childContext(ctx, ctx.data);
      optionCtx.common = { ...ctx.common, issues: [] };
      const result = option._parse(optionCtx);
      if (optionCtx.common.issues.length === 0) {
        ctx.common.issues.length = startIssueCount;
        return result;
      }
      errors.push(new InputFyError(optionCtx.common.issues));
    }
    ctx.common.issues.length = startIssueCount;
    addIssue(ctx, { code: "invalid_union", unionErrors: errors, message: "Invalid input" });
    return ctx.data;
  }
  _clone() {
    const cloned = new _InputFyUnion(this._def.options);
    cloned._def = { ...this._def, options: this._def.options };
    return cloned;
  }
};
var InputFyDiscriminatedUnion = class _InputFyDiscriminatedUnion extends InputFyType {
  _def;
  constructor(discriminator, options) {
    super();
    this._def = { typeName: "InputFyDiscriminatedUnion", discriminator, options };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return ctx.data;
    }
    const discriminatorValue = ctx.data[this._def.discriminator];
    const option = this._def.options.find((opt) => {
      const field = opt.shape[this._def.discriminator];
      if (!field || field._def.typeName !== "InputFyLiteral") return false;
      return field._def.value === discriminatorValue;
    });
    if (!option) {
      const values = this._def.options.map((opt) => {
        const field = opt.shape[this._def.discriminator];
        return field ? field._def.value : "";
      });
      addIssue(ctx, {
        code: "invalid_union_discriminator",
        options: values,
        message: `Invalid discriminator value. Expected ${values.map(String).join(" | ")}`
      });
      return ctx.data;
    }
    return parseInner(option, ctx);
  }
  _clone() {
    return new _InputFyDiscriminatedUnion(this._def.discriminator, this._def.options);
  }
};
var InputFyIntersection = class _InputFyIntersection extends InputFyType {
  _def;
  constructor(left, right) {
    super();
    this._def = { typeName: "InputFyIntersection", left, right };
  }
  _parse(ctx) {
    const leftCtx = childContext(ctx, ctx.data);
    leftCtx.common.issues = [...ctx.common.issues];
    const left = this._def.left._parse(leftCtx);
    const rightCtx = childContext(ctx, ctx.data);
    rightCtx.common.issues = [...ctx.common.issues];
    const right = this._def.right._parse(rightCtx);
    ctx.common.issues = [...leftCtx.common.issues, ...rightCtx.common.issues.filter(
      (i) => !leftCtx.common.issues.includes(i)
    )];
    if (ctx.common.issues.length > 0) {
      addIssue(ctx, { code: "invalid_intersection_types", message: "Invalid intersection" });
    }
    if (typeof left === "object" && left !== null && typeof right === "object" && right !== null && !Array.isArray(left) && !Array.isArray(right)) {
      return { ...left, ...right };
    }
    return left;
  }
  _clone() {
    return new _InputFyIntersection(this._def.left, this._def.right);
  }
};
var InputFyRecord = class _InputFyRecord extends InputFyType {
  _def;
  constructor(keyType, valueType) {
    super();
    this._def = { typeName: "InputFyRecord", keyType, valueType };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null || Array.isArray(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return {};
    }
    const result = /* @__PURE__ */ Object.create(null);
    for (const [key, value] of Object.entries(ctx.data)) {
      parseInner(this._def.keyType, childContext(ctx, key, key));
      result[key] = parseInner(this._def.valueType, childContext(ctx, value, key));
    }
    return result;
  }
  _clone() {
    return new _InputFyRecord(this._def.keyType, this._def.valueType);
  }
};
var InputFyMap = class _InputFyMap extends InputFyType {
  _def;
  constructor(keyType, valueType) {
    super();
    this._def = { typeName: "InputFyMap", keyType, valueType };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Map)) {
      addIssue(ctx, { code: "invalid_type", expected: "map", received: ctx.parsedType });
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    let index = 0;
    for (const [key, value] of ctx.data.entries()) {
      const parsedKey = parseInner(this._def.keyType, childContext(ctx, key, index));
      const parsedValue = parseInner(this._def.valueType, childContext(ctx, value, index));
      result.set(parsedKey, parsedValue);
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFyMap(this._def.keyType, this._def.valueType);
  }
};
var InputFySet = class _InputFySet extends InputFyType {
  _def;
  constructor(valueType, constraints = {}) {
    super();
    this._def = {
      typeName: "InputFySet",
      valueType,
      minSize: constraints.minSize ?? null,
      maxSize: constraints.maxSize ?? null
    };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Set)) {
      addIssue(ctx, { code: "invalid_type", expected: "set", received: ctx.parsedType });
      return /* @__PURE__ */ new Set();
    }
    const size = ctx.data.size;
    if (this._def.minSize !== null && size < this._def.minSize) {
      addIssue(ctx, { code: "too_small", minimum: this._def.minSize, inclusive: true, type: "set" });
    }
    if (this._def.maxSize !== null && size > this._def.maxSize) {
      addIssue(ctx, { code: "too_big", maximum: this._def.maxSize, inclusive: true, type: "set" });
    }
    const result = /* @__PURE__ */ new Set();
    let index = 0;
    for (const value of ctx.data.values()) {
      result.add(parseInner(this._def.valueType, childContext(ctx, value, index)));
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFySet(this._def.valueType, {
      minSize: this._def.minSize,
      maxSize: this._def.maxSize
    });
  }
  min(size) {
    const c = this._clone();
    c._def.minSize = size;
    return c;
  }
  max(size) {
    const c = this._clone();
    c._def.maxSize = size;
    return c;
  }
  size(size) {
    return this.min(size).max(size);
  }
  nonempty() {
    return this.min(1);
  }
};
var InputFyLazy = class _InputFyLazy extends InputFyType {
  _def;
  constructor(getter) {
    super();
    this._def = { typeName: "InputFyLazy", getter };
  }
  get schema() {
    return this._def.getter();
  }
  _parse(ctx) {
    return parseInner(this._def.getter(), ctx);
  }
  _clone() {
    return new _InputFyLazy(this._def.getter);
  }
};
var InputFyPromise = class _InputFyPromise extends InputFyType {
  _def;
  constructor(type) {
    super();
    this._def = { typeName: "InputFyPromise", type };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Promise)) {
      addIssue(ctx, { code: "invalid_type", expected: "promise", received: ctx.parsedType });
      return Promise.resolve(void 0);
    }
    return ctx.data.then((value) => {
      const innerCtx = childContext(ctx, value);
      return parseInner(this._def.type, innerCtx);
    });
  }
  _clone() {
    return new _InputFyPromise(this._def.type);
  }
};
var InputFyFunction = class _InputFyFunction extends InputFyType {
  _def;
  constructor(args, returns) {
    super();
    this._def = {
      typeName: "InputFyFunction",
      args: args ?? new InputFyTuple([]),
      returns: returns ?? void 0
    };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "function") {
      addIssue(ctx, { code: "invalid_type", expected: "function", received: ctx.parsedType });
      return (() => void 0);
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyFunction(this._def.args, this._def.returns);
  }
  args(args) {
    return new _InputFyFunction(args, this._def.returns);
  }
  returns(returns) {
    return new _InputFyFunction(this._def.args, returns);
  }
  implement(fn) {
    return ((...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = fn(...argsResult.data);
      const returnResult = this._def.returns.safeParse(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
  }
  implementAsync(fn) {
    return (async (...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = await fn(...argsResult.data);
      const returnResult = await this._def.returns.safeParseAsync(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
  }
};
var InputFyPipeline = class _InputFyPipeline extends InputFyType {
  _def;
  constructor(def) {
    super();
    this._def = def;
  }
  _parse(ctx) {
    const intermediate = parseInner(this._def.in, ctx);
    if (ctx.common.issues.length > 0) return intermediate;
    return parseInner(this._def.out, childContext(ctx, intermediate));
  }
  _clone() {
    return new _InputFyPipeline({ ...this._def });
  }
};
var InputFyPreprocess = class _InputFyPreprocess extends InputFyType {
  _def;
  constructor(preprocess2, schema) {
    super();
    this._def = { typeName: "InputFyPreprocess", preprocess: preprocess2, schema };
  }
  _parse(ctx) {
    const preprocessed = this._def.preprocess(ctx.data);
    return parseInner(this._def.schema, childContext(ctx, preprocessed));
  }
  _clone() {
    return new _InputFyPreprocess(this._def.preprocess, this._def.schema);
  }
};
function array(schema) {
  return new InputFyArray(schema);
}
function object(shape) {
  return new InputFyObject(shape);
}
function strictObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "strict" });
}
function looseObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "passthrough" });
}
function tuple(items) {
  return new InputFyTuple(items);
}
function union(options) {
  return new InputFyUnion(options);
}
function discriminatedUnion(discriminator, options) {
  return new InputFyDiscriminatedUnion(discriminator, options);
}
function intersection(left, right) {
  return new InputFyIntersection(left, right);
}
function record(keyOrValue, maybeValue) {
  if (maybeValue !== void 0) {
    return new InputFyRecord(keyOrValue, maybeValue);
  }
  return new InputFyRecord(new InputFyString({ typeName: "InputFyString", checks: [] }), keyOrValue);
}
function map(keyType, valueType) {
  return new InputFyMap(keyType, valueType);
}
function set(valueType) {
  return new InputFySet(valueType);
}
function lazy(getter) {
  return new InputFyLazy(getter);
}
function promise(schema) {
  return new InputFyPromise(schema);
}
function preprocess(preprocess2, schema) {
  return new InputFyPreprocess(preprocess2, schema);
}
function _function() {
  return new InputFyFunction();
}
function pipeline(inSchema, outSchema) {
  return new InputFyPipeline({ in: inSchema, out: outSchema, typeName: "InputFyPipeline" });
}

// src/methods.ts
var proto = InputFyType.prototype;
proto.optional = function() {
  return new InputFyOptional({ innerType: this, typeName: "InputFyOptional" });
};
proto.nullable = function() {
  return new InputFyNullable({ innerType: this, typeName: "InputFyNullable" });
};
proto.nullish = function() {
  return proto.nullable.call(this).optional();
};
proto.default = function(defaultValue) {
  const factory = typeof defaultValue === "function" ? defaultValue : () => defaultValue;
  return new InputFyDefault({
    innerType: this,
    defaultValue: factory,
    typeName: "InputFyDefault"
  });
};
proto.catch = function(defaultValue) {
  return new InputFyCatch({
    innerType: this,
    catchValue: typeof defaultValue === "function" ? defaultValue : () => defaultValue,
    typeName: "InputFyCatch"
  });
};
proto.readonly = function() {
  return new InputFyReadonly({ innerType: this, typeName: "InputFyReadonly" });
};
proto.or = function(option) {
  return union([this, option]);
};
proto.and = function(incoming) {
  return intersection(this, incoming);
};
proto.array = function() {
  return array(this);
};
proto.promise = function() {
  return promise(this);
};
proto.pipe = function(target) {
  return new InputFyPipeline({ in: this, out: target, typeName: "InputFyPipeline" });
};

// src/advanced/cross-field.ts
var InputFyCrossField = class _InputFyCrossField extends InputFyType {
  _def;
  constructor(innerType, rules) {
    super();
    this._def = { typeName: "InputFyCrossField", innerType, rules };
  }
  _parse(ctx) {
    const result = parseInner(this._def.innerType, ctx);
    if (ctx.common.issues.length > 0) return result;
    const data = typeof result === "object" && result !== null ? result : ctx.data;
    for (const rule of this._def.rules) {
      if (!rule.check(data)) {
        addIssue(ctx, {
          code: "custom",
          message: rule.message,
          path: rule.fields.length === 1 ? [...ctx.path, rule.fields[0]] : ctx.path
        });
      }
    }
    return result;
  }
  _clone() {
    return new _InputFyCrossField(this._def.innerType, [...this._def.rules]);
  }
  addRule(rule) {
    const c = this._clone();
    c._def.rules.push(rule);
    return c;
  }
};
function crossField(schema, rules) {
  return new InputFyCrossField(schema, rules);
}
var crossFieldRules = {
  equals(fieldA, fieldB, message) {
    return {
      fields: [fieldA, fieldB],
      check: (data) => data[fieldA] === data[fieldB],
      message: message ?? `${fieldA} must match ${fieldB}`
    };
  },
  requiredTogether(fields, message) {
    return {
      fields,
      check: (data) => {
        const present = fields.filter((f) => data[f] !== void 0 && data[f] !== null);
        return present.length === 0 || present.length === fields.length;
      },
      message: message ?? `Fields ${fields.join(", ")} must all be present or all absent`
    };
  },
  atLeastOne(fields, message) {
    return {
      fields,
      check: (data) => fields.some((f) => data[f] !== void 0 && data[f] !== null && data[f] !== ""),
      message: message ?? `At least one of ${fields.join(", ")} is required`
    };
  },
  custom(fields, check, message) {
    return { fields, check, message };
  }
};

// src/advanced/extend-object.ts
InputFyObject.prototype.crossField = function(rules) {
  return crossField(this, rules);
};

// src/dx/meta.ts
var MetadataRegistry = class {
  entries = /* @__PURE__ */ new Map();
  register(id, schema, metadata = {}) {
    const merged = {
      ...getSchemaMetadata(schema),
      ...metadata,
      id
    };
    this.entries.set(id, { schema, metadata: merged });
  }
  get(id) {
    return this.entries.get(id)?.metadata;
  }
  getSchema(id) {
    return this.entries.get(id)?.schema;
  }
  list() {
    return [...this.entries.entries()].map(([id, e]) => ({ id, metadata: e.metadata }));
  }
  clear(id) {
    if (id) this.entries.delete(id);
    else this.entries.clear();
  }
};
var defaultMetadataRegistry = new MetadataRegistry();
function getSchemaMetadata(schema) {
  const def = schema._def;
  const meta = { ...def.metadata ?? {} };
  if (def.description) meta["description"] = def.description;
  return meta;
}
var proto2 = InputFyType.prototype;
proto2.meta = function(metadata) {
  const cloned = this._clone();
  cloned._def = {
    ...cloned._def,
    metadata: { ...cloned._def.metadata ?? {}, ...metadata }
  };
  return cloned;
};
proto2.getMeta = function() {
  return getSchemaMetadata(this);
};

// src/typescript/deep.ts
function unwrapOptional(schema) {
  const typeName = schema._def.typeName;
  if (typeName === "InputFyOptional") {
    return { inner: schema._def.innerType, wasOptional: true };
  }
  if (typeName === "InputFyDefault") {
    return { inner: schema._def.innerType, wasOptional: true };
  }
  return { inner: schema, wasOptional: false };
}
function cloneObjectShape(obj, shape) {
  return new InputFyObject(shape, {
    unknownKeys: obj._def.unknownKeys,
    catchall: obj._def.catchall
  });
}
function deepPartialSchema(schema) {
  const typeName = schema._def.typeName;
  switch (typeName) {
    case "InputFyOptional":
    case "InputFyDefault":
      return deepPartialSchema(schema._def.innerType).optional();
    case "InputFyNullable":
      return deepPartialSchema(schema._def.innerType).nullable().optional();
    case "InputFyReadonly":
      return deepPartialSchema(schema._def.innerType).readonly().optional();
    case "InputFyCatch":
      return deepPartialSchema(schema._def.innerType).optional();
    case "InputFyObject": {
      const obj = schema;
      const shape = obj._def.shape();
      const newShape = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        newShape[key] = deepPartialSchema(field).optional();
      }
      return cloneObjectShape(obj, newShape);
    }
    case "InputFyArray": {
      const arr = schema;
      return new InputFyArray(deepPartialSchema(arr._def.type)).optional();
    }
    default:
      return schema.optional();
  }
}
function deepRequiredSchema(schema) {
  const { inner, wasOptional } = unwrapOptional(schema);
  const typeName = inner._def.typeName;
  switch (typeName) {
    case "InputFyNullable": {
      const nullable = inner;
      return deepRequiredSchema(nullable._def.innerType).nullable();
    }
    case "InputFyReadonly":
      return deepRequiredSchema(inner._def.innerType).readonly();
    case "InputFyObject": {
      const obj = inner;
      const shape = obj._def.shape();
      const newShape = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        newShape[key] = deepRequiredSchema(field);
      }
      return cloneObjectShape(obj, newShape);
    }
    case "InputFyArray": {
      const arr = inner;
      return new InputFyArray(deepRequiredSchema(arr._def.type));
    }
    default:
      return wasOptional ? inner : schema;
  }
}
function deepPartial(schema) {
  return deepPartialSchema(schema);
}
function deepRequired(schema) {
  return deepRequiredSchema(schema);
}

// src/typescript/pipeline-types.ts
function schemaInput(schema) {
  return void 0;
}
function schemaOutput(schema) {
  return void 0;
}
function strictSplit(schema) {
  return {
    input: void 0,
    output: void 0
  };
}
function parsePipelineInput(pipeline2, data) {
  const inSchema = pipeline2._def.in;
  return inSchema.parse(data);
}
function parsePipelineIntermediate(pipeline2, data) {
  const ctx = createParseContext(data);
  const result = parseInner(pipeline2._def.in, ctx);
  if (ctx.common.issues.length > 0) {
    throw pipeline2._def.in.parse(data);
  }
  return result;
}
function parsePipelineOutput(pipeline2, data) {
  return pipeline2.parse(data);
}
function getPipelineSchemas(pipeline2) {
  return { input: pipeline2._def.in, output: pipeline2._def.out };
}

// src/typescript/extend.ts
var objectProto = InputFyObject.prototype;
var arrayProto = InputFyArray.prototype;
var pipelineProto = InputFyPipeline.prototype;
if (!objectProto.deepPartial) {
  objectProto.deepPartial = function() {
    return deepPartial(this);
  };
}
if (!objectProto.deepRequired) {
  objectProto.deepRequired = function() {
    return deepRequired(this);
  };
}
if (!arrayProto.deepPartial) {
  arrayProto.deepPartial = function() {
    return deepPartial(this);
  };
}
if (!arrayProto.deepRequired) {
  arrayProto.deepRequired = function() {
    return deepRequired(this);
  };
}
if (!pipelineProto.parseInput) {
  pipelineProto.parseInput = function(data) {
    return parsePipelineInput(this, data);
  };
}
if (!pipelineProto.parseIntermediate) {
  pipelineProto.parseIntermediate = function(data) {
    return parsePipelineIntermediate(this, data);
  };
}
if (!pipelineProto.parseOutput) {
  pipelineProto.parseOutput = function(data) {
    return parsePipelineOutput(this, data);
  };
}
if (!pipelineProto.getPipelineSchemas) {
  pipelineProto.getPipelineSchemas = function() {
    return getPipelineSchemas(this);
  };
}

// src/interop/schema-walker.ts
var MAX_WALK_DEPTH = 64;
function unwrapSchema(schema) {
  let current = schema;
  let optional = false;
  let nullable = false;
  let defaultValue;
  let isReadonly = false;
  for (let i = 0; i < 32; i++) {
    const typeName = current._def.typeName;
    if (typeName === "InputFyOptional") {
      optional = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyNullable") {
      nullable = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyDefault") {
      optional = true;
      const def = current._def;
      defaultValue = def.defaultValue();
      current = def.innerType;
      continue;
    }
    if (typeName === "InputFyReadonly") {
      isReadonly = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyCatch") {
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyEffects") {
      current = current._def.schema;
      continue;
    }
    if (typeName === "InputFyPreprocess") {
      current = current._def.schema;
      continue;
    }
    if (typeName === "InputFyPipeline") {
      current = current._def.out;
      continue;
    }
    if (typeName === "InputFyLazy") {
      current = current._def.getter();
      continue;
    }
    if (typeName === "InputFyPromise") {
      current = current._def.type;
      continue;
    }
    if (typeName === "InputFyCodec") {
      current = current._def.decodedSchema;
      continue;
    }
    if (typeName === "InputFyCrossField") {
      current = current._def.innerType;
      continue;
    }
    if (typeName === "InputFyContextual") {
      break;
    }
    if (typeName === "InputFyWhen" || typeName === "InputFyFile") {
      break;
    }
    break;
  }
  return { schema: current, optional, nullable, defaultValue, readonly: isReadonly };
}
function assertWalkDepth(depth) {
  if (depth > MAX_WALK_DEPTH) {
    throw new Error(`Schema conversion depth exceeded maximum of ${MAX_WALK_DEPTH}`);
  }
}

// src/interop/to-json-schema.ts
function applyNullable(schema, nullable, target) {
  if (!nullable) return schema;
  if (target === "openapi-3.0") {
    return { ...schema, nullable: true };
  }
  const baseType = schema.type;
  if (typeof baseType === "string") {
    return { ...schema, type: [baseType, "null"] };
  }
  if (Array.isArray(baseType) && !baseType.includes("null")) {
    return { ...schema, type: [...baseType, "null"] };
  }
  if (!baseType) {
    return { ...schema, type: ["null"] };
  }
  return schema;
}
function applyMetadata(schema, def, metadata) {
  if (!metadata) return schema;
  const result = { ...schema };
  if (def.description) result.description = def.description;
  return result;
}
function convertStringChecks(checks) {
  const result = { type: "string" };
  for (const check of checks) {
    switch (check.kind) {
      case "min":
        result.minLength = check.value;
        break;
      case "max":
        result.maxLength = check.value;
        break;
      case "length":
        result.minLength = check.value;
        result.maxLength = check.value;
        break;
      case "email":
        result.format = "email";
        break;
      case "url":
        result.format = "uri";
        break;
      case "uuid":
        result.format = "uuid";
        break;
      case "datetime":
        result.format = "date-time";
        break;
      case "regex":
        result.pattern = check.regex.source;
        break;
      default:
        break;
    }
  }
  return result;
}
function convertNumberChecks(checks) {
  const result = { type: "number" };
  let isInt = false;
  for (const check of checks) {
    switch (check.kind) {
      case "int":
        isInt = true;
        break;
      case "min":
        if (check.value !== void 0) {
          if (check.inclusive) result.minimum = check.value;
          else result.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.value !== void 0) {
          if (check.inclusive) result.maximum = check.value;
          else result.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        if (check.value !== void 0) result.multipleOf = check.value;
        break;
      case "positive":
        result.exclusiveMinimum = 0;
        break;
      case "negative":
        result.exclusiveMaximum = 0;
        break;
      case "nonnegative":
        result.minimum = 0;
        break;
      case "nonpositive":
        result.maximum = 0;
        break;
      default:
        break;
    }
  }
  if (isInt) result.type = "integer";
  return result;
}
function convertCore(schema, options) {
  const depth = (options._depth ?? 0) + 1;
  assertWalkDepth(depth);
  const { schema: inner, nullable, defaultValue, readonly: readonly2 } = unwrapSchema(schema);
  const target = options.target ?? "draft-7";
  const typeName = inner._def.typeName;
  let result;
  const childOpts = { ...options, _depth: depth };
  switch (typeName) {
    case "InputFyString": {
      const def = inner._def;
      result = convertStringChecks(def.checks);
      break;
    }
    case "InputFyNumber":
    case "InputFyNaN": {
      const def = inner._def;
      result = convertNumberChecks(def.checks ?? []);
      break;
    }
    case "InputFyBoolean":
      result = { type: "boolean" };
      break;
    case "InputFyBigInt":
      result = { type: "integer", format: "int64" };
      break;
    case "InputFyDate":
      result = { type: "string", format: "date-time" };
      break;
    case "InputFyNull":
      result = { type: "null" };
      break;
    case "InputFyLiteral": {
      const value = inner._def.value;
      result = { const: value };
      break;
    }
    case "InputFyEnum": {
      const values = inner._def.values;
      result = { type: "string", enum: [...values] };
      break;
    }
    case "InputFyNativeEnum": {
      const enumObj = inner._def.enum;
      result = {
        enum: Object.values(enumObj).filter(
          (v2) => typeof v2 === "string" || typeof v2 === "number"
        )
      };
      break;
    }
    case "InputFyArray": {
      const def = inner._def;
      result = { type: "array", items: toJSONSchema(def.type, childOpts) };
      if (def.minLength !== null) result.minItems = def.minLength;
      if (def.maxLength !== null) result.maxItems = def.maxLength;
      if (def.exactLength !== null) {
        result.minItems = def.exactLength;
        result.maxItems = def.exactLength;
      }
      break;
    }
    case "InputFyObject": {
      const def = inner._def;
      const shape = def.shape();
      const properties = {};
      const required = [];
      for (const [key, fieldSchema] of Object.entries(shape)) {
        properties[key] = toJSONSchema(fieldSchema, childOpts);
        if (!unwrapSchema(fieldSchema).optional) required.push(key);
      }
      result = {
        type: "object",
        properties,
        ...required.length > 0 ? { required } : {},
        additionalProperties: def.unknownKeys === "strict" ? false : def.unknownKeys === "passthrough"
      };
      break;
    }
    case "InputFyTuple": {
      const def = inner._def;
      result = {
        type: "array",
        items: def.items.map((item) => toJSONSchema(item, childOpts)),
        ...def.rest ? { additionalItems: toJSONSchema(def.rest, childOpts) } : {}
      };
      if (!def.rest) result.minItems = def.items.length;
      break;
    }
    case "InputFyUnion": {
      const optionsList = inner._def.options;
      result = { anyOf: optionsList.map((opt) => toJSONSchema(opt, childOpts)) };
      break;
    }
    case "InputFyDiscriminatedUnion": {
      const def = inner._def;
      result = {
        oneOf: def.options.map((opt) => toJSONSchema(opt, childOpts)),
        discriminator: { propertyName: def.discriminator }
      };
      break;
    }
    case "InputFyIntersection": {
      const def = inner._def;
      result = { allOf: [toJSONSchema(def.left, childOpts), toJSONSchema(def.right, childOpts)] };
      break;
    }
    case "InputFyRecord": {
      const def = inner._def;
      result = {
        type: "object",
        additionalProperties: toJSONSchema(def.valueType, childOpts)
      };
      break;
    }
    case "InputFyMap":
    case "InputFySet":
      result = { type: "object", additionalProperties: true };
      break;
    case "InputFyAny":
    case "InputFyUnknown":
      result = {};
      break;
    case "InputFyNever":
      result = { not: {} };
      break;
    case "InputFyCodec": {
      const def = inner._def;
      result = toJSONSchema(def.encodedSchema, childOpts);
      break;
    }
    default:
      result = {};
  }
  result = applyMetadata(result, inner._def, options.metadata ?? true);
  if (defaultValue !== void 0) result.default = defaultValue;
  if (readonly2) result.readOnly = true;
  result = applyNullable(result, nullable, target);
  return result;
}
function toJSONSchema(schema, options = {}) {
  const target = options.target ?? "draft-7";
  const result = convertCore(schema, options);
  if (options.definitions && Object.keys(options.definitions).length > 0) {
    if (target === "draft-2020-12" || target === "openapi-3.1") {
      result.$defs = options.definitions;
    } else {
      result.definitions = options.definitions;
    }
  }
  if (target === "draft-7") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  }
  return result;
}
function toOpenAPISchema(schema, options = {}) {
  const target = options.target ?? "openapi-3.1";
  return toJSONSchema(schema, { ...options, target });
}

// src/interop/from-json-schema.ts
function mergeDefs(options) {
  return { ...options.definitions ?? {}, ...options.defs ?? {} };
}
function resolveRef(ref, options) {
  const defs = mergeDefs(options);
  const name = ref.replace(/^#\/(\$defs|definitions)\//, "");
  const resolved = defs[name];
  if (!resolved) throw new Error(`Unable to resolve $ref: ${ref}`);
  const resolving = options._resolving ?? /* @__PURE__ */ new Set();
  if (resolving.has(ref)) throw new Error(`Circular $ref detected: ${ref}`);
  resolving.add(ref);
  return resolved;
}
function str() {
  return new InputFyString({ typeName: "InputFyString", checks: [] });
}
function num() {
  return new InputFyNumber({ typeName: "InputFyNumber", checks: [] });
}
function bool() {
  return new InputFyBoolean({ typeName: "InputFyBoolean" });
}
function unknown() {
  return new InputFyUnknown();
}
function fromJSONSchemaCore(schema, options = {}) {
  const depth = (options._depth ?? 0) + 1;
  assertWalkDepth(depth);
  if (schema.$ref) {
    const localDefs = {
      ...mergeDefs(options),
      ...schema.definitions ?? {},
      ...schema.$defs ?? {}
    };
    const resolved = resolveRef(schema.$ref, { ...options, definitions: localDefs });
    return fromJSONSchema(resolved, {
      ...options,
      definitions: localDefs,
      _depth: depth,
      _resolving: /* @__PURE__ */ new Set([...options._resolving ?? [], schema.$ref])
    });
  }
  const childOpts = { ...options, _depth: depth };
  if (schema.const !== void 0) {
    return new InputFyLiteral(schema.const);
  }
  if (schema.enum && schema.enum.length > 0) {
    const values = schema.enum.filter((e) => typeof e === "string");
    if (values.length > 0) {
      return new InputFyEnum(values);
    }
    const first = schema.enum[0];
    if (typeof first === "number") {
      return union(schema.enum.map((n) => new InputFyLiteral(n)));
    }
    if (typeof first === "boolean") {
      return union(schema.enum.map((b) => new InputFyLiteral(b)));
    }
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return union(schema.anyOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return union(schema.oneOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema.allOf && schema.allOf.length > 0) {
    let result2 = fromJSONSchema(schema.allOf[0], childOpts);
    for (let i = 1; i < schema.allOf.length; i++) {
      result2 = result2.and(fromJSONSchema(schema.allOf[i], childOpts));
    }
    return result2;
  }
  const types = Array.isArray(schema.type) ? schema.type.filter((t) => t !== "null") : schema.type ? [schema.type] : [];
  const isNullable = schema.nullable === true || Array.isArray(schema.type) && schema.type.includes("null");
  let result;
  const primaryType = types[0];
  switch (primaryType) {
    case "string": {
      let s = str();
      if (schema.minLength !== void 0) s = s.min(schema.minLength);
      if (schema.maxLength !== void 0) s = s.max(schema.maxLength);
      if (schema.pattern) s = s.regex(new RegExp(schema.pattern));
      switch (schema.format) {
        case "email":
          s = s.email();
          break;
        case "uri":
        case "url":
          s = s.url();
          break;
        case "uuid":
          s = s.uuid();
          break;
        case "date-time":
          s = s.datetime();
          break;
        case "date":
          s = s.regex(/^\d{4}-\d{2}-\d{2}$/);
          break;
        default:
          break;
      }
      result = s;
      break;
    }
    case "integer":
    case "number": {
      let n = num();
      if (primaryType === "integer") n = n.int();
      if (schema.minimum !== void 0) n = n.min(schema.minimum);
      if (schema.maximum !== void 0) n = n.max(schema.maximum);
      if (schema.exclusiveMinimum !== void 0) n = n.gt(schema.exclusiveMinimum);
      if (schema.exclusiveMaximum !== void 0) n = n.lt(schema.exclusiveMaximum);
      if (schema.multipleOf !== void 0) n = n.multipleOf(schema.multipleOf);
      result = n;
      break;
    }
    case "boolean":
      result = bool();
      break;
    case "null":
      result = InputFyNull;
      break;
    case "array": {
      const items = schema.items;
      if (Array.isArray(items)) {
        const tupleItems = items.map((item) => fromJSONSchema(item, childOpts));
        result = tuple(tupleItems);
        if (schema.additionalItems && typeof schema.additionalItems === "object") {
          result = result.rest(
            fromJSONSchema(schema.additionalItems, childOpts)
          );
        }
      } else {
        let arr = array(fromJSONSchema(items ?? {}, childOpts));
        if (schema.minItems !== void 0) arr = arr.min(schema.minItems);
        if (schema.maxItems !== void 0) arr = arr.max(schema.maxItems);
        result = arr;
      }
      break;
    }
    case "object": {
      if (schema.properties) {
        const shape = {};
        const required = new Set(schema.required ?? []);
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          let field = fromJSONSchema(propSchema, childOpts);
          if (!required.has(key)) {
            field = new InputFyOptional({ innerType: field, typeName: "InputFyOptional" });
          }
          shape[key] = field;
        }
        let obj = object(shape);
        if (schema.additionalProperties === false) obj = obj.strict();
        else if (schema.additionalProperties === true) obj = obj.passthrough();
        else if (typeof schema.additionalProperties === "object") {
          obj = obj.catchall(fromJSONSchema(schema.additionalProperties, childOpts));
        }
        result = obj;
      } else if (typeof schema.additionalProperties === "object") {
        result = record(fromJSONSchema(schema.additionalProperties, childOpts));
      } else {
        result = record(unknown());
      }
      break;
    }
    default:
      if (schema.properties) {
        return fromJSONSchema({ ...schema, type: "object" }, childOpts);
      }
      result = unknown();
  }
  if (schema.default !== void 0) {
    result = new InputFyDefault({
      innerType: result,
      defaultValue: () => schema.default,
      typeName: "InputFyDefault"
    });
  }
  if (isNullable && primaryType !== "null") {
    result = new InputFyNullable({ innerType: result, typeName: "InputFyNullable" });
  }
  if (schema.description) {
    result = result.describe(schema.description);
  }
  return result;
}
function fromJSONSchema(schema, options = {}) {
  return fromJSONSchemaCore(schema, options);
}

// src/interop/codec.ts
var InputFyCodec = class _InputFyCodec extends InputFyType {
  _def;
  constructor(encodedSchema, decodedSchema, handlers) {
    super();
    this._def = {
      typeName: "InputFyCodec",
      encodedSchema,
      decodedSchema,
      handlers
    };
  }
  _parse(ctx) {
    const encoded = parseInner(this._def.encodedSchema, ctx, ctx.data);
    if (ctx.common.issues.length > 0) {
      return encoded;
    }
    try {
      return this._def.handlers.decode(encoded);
    } catch (err) {
      ctx.common.issues.push({
        code: "custom",
        path: ctx.path,
        message: err instanceof Error ? err.message : "Codec decode failed"
      });
      return encoded;
    }
  }
  encode(value) {
    const domainResult = this._def.decodedSchema.safeParse(value);
    if (!domainResult.success) throw domainResult.error;
    const encoded = this._def.handlers.encode(domainResult.data);
    const wireResult = this._def.encodedSchema.safeParse(encoded);
    if (!wireResult.success) throw wireResult.error;
    return wireResult.data;
  }
  decode(value) {
    return this.parse(value);
  }
  get encodedSchema() {
    return this._def.encodedSchema;
  }
  get decodedSchema() {
    return this._def.decodedSchema;
  }
  _clone() {
    return new _InputFyCodec(
      this._def.encodedSchema,
      this._def.decodedSchema,
      this._def.handlers
    );
  }
};
function codec(encodedSchema, decodedSchema, handlers) {
  return new InputFyCodec(encodedSchema, decodedSchema, handlers);
}

// src/interop/to-openapi.ts
function isInputFySchema(value) {
  return typeof value === "object" && value !== null && "_def" in value && typeof value._def === "object";
}
function resolveSchemaInOperation(schema, target) {
  if (!schema) return void 0;
  if (isInputFySchema(schema)) return toOpenAPISchema(schema, { target });
  return schema;
}
function transformMediaContent(content, target) {
  if (!content) return content;
  const result = {};
  for (const [mime, media] of Object.entries(content)) {
    const resolved = resolveSchemaInOperation(media.schema, target);
    const entry = { ...media };
    if (resolved !== void 0) entry.schema = resolved;
    else delete entry.schema;
    result[mime] = entry;
  }
  return result;
}
function transformOperation(operation, target) {
  const transformed = {
    ...operation,
    responses: {}
  };
  if (operation.parameters) {
    transformed.parameters = operation.parameters.map((param) => {
      const resolved = resolveSchemaInOperation(param.schema, target);
      const entry = { ...param };
      if (resolved !== void 0) entry.schema = resolved;
      else delete entry.schema;
      return entry;
    });
  }
  if (operation.requestBody) {
    transformed.requestBody = {
      ...operation.requestBody,
      content: transformMediaContent(operation.requestBody.content, target)
    };
  }
  for (const [code, response] of Object.entries(operation.responses)) {
    const content = transformMediaContent(response.content, target);
    const entry = { ...response };
    if (content !== void 0) entry.content = content;
    else delete entry.content;
    transformed.responses[code] = entry;
  }
  return transformed;
}
function toOpenAPI(config3) {
  const version = config3.version ?? "3.1.0";
  const target = version === "3.0.3" ? "openapi-3.0" : "openapi-3.1";
  const componentSchemas = {};
  if (config3.schemas) {
    for (const [name, schema] of Object.entries(config3.schemas)) {
      componentSchemas[name] = toOpenAPISchema(schema, { target });
    }
  }
  const paths = {};
  for (const [path, item] of Object.entries(config3.paths)) {
    paths[path] = {};
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const operation = item[method];
      if (operation) paths[path][method] = transformOperation(operation, target);
    }
  }
  const doc = {
    openapi: version,
    info: config3.info,
    paths
  };
  if (Object.keys(componentSchemas).length > 0) {
    doc.components = { schemas: componentSchemas };
  }
  if (config3.tags) doc.tags = config3.tags;
  return doc;
}
function openAPIToJSON(doc, pretty = true) {
  return JSON.stringify(doc, null, pretty ? 2 : void 0);
}
function openAPIToYAML(doc) {
  return jsonToYaml(doc);
}
function jsonToYaml(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null || value === void 0) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/[:#\n\r\t]|^[\s-]/.test(value)) return JSON.stringify(value);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((item) => {
      const rendered = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return `${pad}-
${rendered.split("\n").map((l) => `  ${l}`).join("\n")}`;
      }
      return `${pad}- ${rendered}`;
    }).join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return `${pad}${safeKey}:
${jsonToYaml(val, indent + 1)}`;
      }
      return `${pad}${safeKey}: ${jsonToYaml(val, 0)}`;
    }).join("\n");
  }
  return String(value);
}

// src/interop/to-graphql.ts
function schemaToGraphQLType(schema) {
  const { schema: inner, nullable } = unwrapSchema(schema);
  const typeNameInner = inner._def.typeName;
  let gqlType;
  switch (typeNameInner) {
    case "InputFyString":
      gqlType = "String";
      break;
    case "InputFyNumber":
    case "InputFyNaN": {
      const checks = inner._def.checks ?? [];
      gqlType = checks.some((c) => c.kind === "int") ? "Int" : "Float";
      break;
    }
    case "InputFyBoolean":
      gqlType = "Boolean";
      break;
    case "InputFyBigInt":
    case "InputFyDate":
      gqlType = "String";
      break;
    case "InputFyLiteral": {
      const value = inner._def.value;
      gqlType = typeof value === "string" ? "String" : typeof value === "number" ? "Int" : "Boolean";
      break;
    }
    case "InputFyEnum":
      gqlType = "String";
      break;
    case "InputFyArray": {
      const element = inner._def.type;
      gqlType = `[${schemaToGraphQLType(element)}]`;
      break;
    }
    case "InputFyObject":
      gqlType = "JSON";
      break;
    default:
      gqlType = "String";
  }
  if (!nullable) return `${gqlType}!`;
  return gqlType;
}
function generateEnumDefinition(name, schema) {
  const { schema: inner } = unwrapSchema(schema);
  const values = inner._def.values;
  const lines = values.map((v2) => `  ${v2.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`);
  return `enum ${name} {
${lines.join("\n")}
}`;
}
function generateObjectDefinition(name, schema, isInput) {
  const { schema: inner } = unwrapSchema(schema);
  const def = inner._def;
  const shape = def.shape();
  const keyword = isInput ? "input" : "type";
  const fields = Object.entries(shape).map(([fieldName, fieldSchema]) => {
    return `  ${fieldName}: ${schemaToGraphQLType(fieldSchema)}`;
  });
  return `${keyword} ${name} {
${fields.join("\n")}
}`;
}
function isOperationDef(value) {
  return typeof value === "object" && value !== null && "returns" in value;
}
function toGraphQLSDL(config3) {
  const parts = [];
  if (config3.description) {
    parts.push(`"""${config3.description}"""`);
  }
  if (config3.enums) {
    for (const [name, schema] of Object.entries(config3.enums)) {
      parts.push(generateEnumDefinition(name, schema));
    }
  }
  if (config3.types) {
    for (const [name, schema] of Object.entries(config3.types)) {
      const { schema: inner } = unwrapSchema(schema);
      if (inner._def.typeName === "InputFyEnum") {
        parts.push(generateEnumDefinition(name, schema));
      } else {
        parts.push(generateObjectDefinition(name, schema, false));
      }
    }
  }
  if (config3.inputs) {
    for (const [name, schema] of Object.entries(config3.inputs)) {
      parts.push(generateObjectDefinition(name, schema, true));
    }
  }
  const queryFields = [];
  if (config3.queries) {
    for (const [name, def] of Object.entries(config3.queries)) {
      if (isOperationDef(def)) {
        const args = def.args ? `(${Object.entries(def.args).map(([argName, argSchema]) => `${argName}: ${schemaToGraphQLType(argSchema)}`).join(", ")})` : "";
        queryFields.push(`  ${name}${args}: ${schemaToGraphQLType(def.returns)}`);
      } else {
        queryFields.push(`  ${name}: ${schemaToGraphQLType(def)}`);
      }
    }
  }
  const mutationFields = [];
  if (config3.mutations) {
    for (const [name, def] of Object.entries(config3.mutations)) {
      if (isOperationDef(def)) {
        const args = def.args ? `(${Object.entries(def.args).map(([argName, argSchema]) => `${argName}: ${schemaToGraphQLType(argSchema)}`).join(", ")})` : "";
        mutationFields.push(`  ${name}${args}: ${schemaToGraphQLType(def.returns)}`);
      } else {
        mutationFields.push(`  ${name}: ${schemaToGraphQLType(def)}`);
      }
    }
  }
  if (queryFields.length > 0) {
    parts.push(`type Query {
${queryFields.join("\n")}
}`);
  }
  if (mutationFields.length > 0) {
    parts.push(`type Mutation {
${mutationFields.join("\n")}
}`);
  }
  if (!config3.queries && !config3.mutations && queryFields.length === 0) {
    parts.push("type Query {\n  _empty: String\n}");
  }
  return parts.join("\n\n") + "\n";
}
function schemaToGraphQLTypeDef(name, schema, isInput = false) {
  const { schema: inner } = unwrapSchema(schema);
  if (inner._def.typeName === "InputFyEnum") {
    return generateEnumDefinition(name, schema);
  }
  return generateObjectDefinition(name, schema, isInput);
}

// src/advanced/validators.ts
var ISO_DURATION_REGEX = /^P(?!$)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(?:\.\d+)?S)?)?$/;
var HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
var RGB_REGEX = /^rgb\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/;
var RGBA_REGEX = /^rgba\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(0|1|0?\.\d+)\s*\)$/;
var HSL_REGEX = /^hsl\(\s*(360|3[0-5]\d|[12]?\d?\d)\s*,\s*(100|\d{1,2})%\s*,\s*(100|\d{1,2})%\s*\)$/;
var HSLA_REGEX = /^hsla\(\s*(360|3[0-5]\d|[12]?\d?\d)\s*,\s*(100|\d{1,2})%\s*,\s*(100|\d{1,2})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;
var CIDR_V4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\/(3[0-2]|[12]?\d)$/;
var CIDR_V6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)\/(12[0-8]|1[01]\d|\d{1,2})$/;
var ISO4217_CODES = /* @__PURE__ */ new Set([
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "GBP",
  "GEL",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "IQD",
  "IRR",
  "ISK",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KMF",
  "KPW",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "QAR",
  "RON",
  "RSD",
  "RUB",
  "RWF",
  "SAR",
  "SBD",
  "SCR",
  "SDG",
  "SEK",
  "SGD",
  "SHP",
  "SLE",
  "SOS",
  "SRD",
  "SSP",
  "STN",
  "SYP",
  "SZL",
  "THB",
  "TJS",
  "TMT",
  "TND",
  "TOP",
  "TRY",
  "TTD",
  "TWD",
  "TZS",
  "UAH",
  "UGX",
  "USD",
  "UYU",
  "UZS",
  "VES",
  "VND",
  "VUV",
  "WST",
  "XAF",
  "XCD",
  "XOF",
  "XPF",
  "YER",
  "ZAR",
  "ZMW",
  "ZWL"
]);
function isValidIsoDate(value) {
  if (!testRegexSafe(ISO_DATE_REGEX, value)) return false;
  const parts = value.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function isValidIsoTime(value) {
  if (!testRegexSafe(ISO_TIME_REGEX, value)) return false;
  const parts = value.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = parts[2] !== void 0 ? Number(parts[2].split(".")[0]) : 0;
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
}
function isValidIsoDatetime(value) {
  if (!testRegexSafe(ISO_DATETIME_REGEX, value)) return false;
  const datePart = value.split("T")[0];
  return isValidIsoDate(datePart);
}
function isValidIsoDuration(value) {
  return testRegexSafe(ISO_DURATION_REGEX, value);
}
function isValidIpv4(value) {
  if (!testRegexSafe(IPV4_REGEX, value)) return false;
  const parts = value.split(".").map(Number);
  return parts.every((p) => p >= 0 && p <= 255);
}
function isValidIpv6(value) {
  if (value === "::" || value === "::1") return true;
  if (!/^[0-9a-fA-F:]+$/.test(value) || value.length > 45) return false;
  const sides = value.split("::");
  if (sides.length > 2) return false;
  const countGroups = (part) => {
    if (!part) return 0;
    const groups = part.split(":");
    return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g)) ? groups.length : -1;
  };
  if (sides.length === 1) {
    const count = countGroups(sides[0]);
    return count === 8;
  }
  const left = countGroups(sides[0]);
  const right = countGroups(sides[1]);
  if (left < 0 || right < 0) return false;
  return left + right <= 7;
}
function isValidCidrV4(value) {
  if (!testRegexSafe(CIDR_V4_REGEX, value)) return false;
  const [ip, prefix] = value.split("/");
  return isValidIpv4(ip) && Number(prefix) >= 0 && Number(prefix) <= 32;
}
function isValidCidrV6(value) {
  if (!testRegexSafe(CIDR_V6_REGEX, value)) return false;
  const [ip, prefix] = value.split("/");
  return isValidIpv6(ip) && Number(prefix) >= 0 && Number(prefix) <= 128;
}
function isValidHexColor(value) {
  return testRegexSafe(HEX_COLOR_REGEX, value);
}
function isValidRgb(value) {
  return testRegexSafe(RGB_REGEX, value) || testRegexSafe(RGBA_REGEX, value);
}
function isValidHsl(value) {
  return testRegexSafe(HSL_REGEX, value) || testRegexSafe(HSLA_REGEX, value);
}
function hasValidDecimalPlaces(value, decimals) {
  if (!Number.isFinite(value)) return false;
  const str2 = String(value);
  const dotIndex = str2.indexOf(".");
  if (dotIndex === -1) return true;
  const fractional = str2.slice(dotIndex + 1);
  if (fractional.length > decimals) return false;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor === value;
}
function hasValidDecimalPlacesFromString(amountStr, decimals) {
  const dotIndex = amountStr.indexOf(".");
  if (dotIndex === -1) return true;
  return amountStr.slice(dotIndex + 1).length <= decimals;
}
function isValidCurrencyAmount(value, options = {}) {
  const decimals = options.decimals ?? 2;
  if (typeof value === "number") {
    return hasValidDecimalPlaces(value, decimals);
  }
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const currencyPattern = options.code ? new RegExp(`^${options.code}\\s+(-?\\d+(?:\\.\\d+)?)$`) : new RegExp(`^([A-Z]{3})\\s+(-?\\d+(?:\\.\\d+)?)$`);
  const match = trimmed.match(currencyPattern);
  if (!match) {
    const numOnly = /^-?\d+(\.\d+)?$/.test(trimmed);
    if (!numOnly) return false;
    const num2 = Number(trimmed);
    return hasValidDecimalPlaces(num2, decimals);
  }
  const code = options.code ?? match[1];
  const amountStr = options.code ? match[1] : match[2];
  if (!ISO4217_CODES.has(code)) return false;
  return hasValidDecimalPlacesFromString(amountStr, decimals);
}
function isFileLike(value) {
  if (typeof value !== "object" || value === null) return false;
  const obj = value;
  return typeof obj["name"] === "string" && typeof obj["size"] === "number" && typeof obj["type"] === "string";
}
function isValidFile(value, options = {}) {
  if (!isFileLike(value)) return false;
  if (options.maxSize !== void 0 && value.size > options.maxSize) return false;
  if (options.mimeTypes && options.mimeTypes.length > 0) {
    const ok = options.mimeTypes.some(
      (mime) => value.type === mime || mime.endsWith("/*") && value.type.startsWith(mime.slice(0, -1))
    );
    if (!ok) return false;
  }
  if (options.extensions && options.extensions.length > 0) {
    const ext = value.name.includes(".") ? `.${value.name.split(".").pop().toLowerCase()}` : "";
    const normalized = options.extensions.map((e) => e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`);
    if (!normalized.includes(ext)) return false;
  }
  return true;
}

// src/advanced/formats.ts
function isoString(validator, message, description) {
  return new InputFyString({ typeName: "InputFyString", checks: [] }).refine((val) => validator(val), message).describe(description);
}
var iso = {
  date: (message) => isoString(isValidIsoDate, message ?? "Invalid ISO 8601 date (YYYY-MM-DD)", "ISO 8601 date"),
  time: (message) => isoString(isValidIsoTime, message ?? "Invalid ISO 8601 time (HH:MM:SS)", "ISO 8601 time"),
  datetime: (message) => isoString(
    isValidIsoDatetime,
    message ?? "Invalid ISO 8601 datetime",
    "ISO 8601 datetime"
  ),
  duration: (message) => isoString(
    isValidIsoDuration,
    message ?? "Invalid ISO 8601 duration (PnYnMnDTnHnMnS)",
    "ISO 8601 duration"
  )
};
function ipv4(message) {
  return isoString(isValidIpv4, message ?? "Invalid IPv4 address", "IPv4");
}
function ipv6(message) {
  return isoString(isValidIpv6, message ?? "Invalid IPv6 address", "IPv6");
}
function cidrv4(message) {
  return isoString(isValidCidrV4, message ?? "Invalid IPv4 CIDR notation", "CIDRv4");
}
function cidrv6(message) {
  return isoString(isValidCidrV6, message ?? "Invalid IPv6 CIDR notation", "CIDRv6");
}
function hexColor(message) {
  return isoString(isValidHexColor, message ?? "Invalid hex color (#RGB, #RRGGBB, #RRGGBBAA)", "hex color");
}
function rgb(message) {
  return isoString(isValidRgb, message ?? "Invalid RGB/RGBA color", "RGB color");
}
function hsl(message) {
  return isoString(isValidHsl, message ?? "Invalid HSL/HSLA color", "HSL color");
}
function currency(options = {}) {
  const { code, decimals = 2, message } = options;
  const msg = message ?? (code ? `Invalid ${code} currency amount (${decimals} decimal places)` : `Invalid currency amount (ISO 4217, ${decimals} decimal places)`);
  const validateOptions = {
    ...code !== void 0 ? { code } : {},
    decimals
  };
  const validate2 = (val) => isValidCurrencyAmount(val, validateOptions);
  return union([
    new InputFyNumber({ typeName: "InputFyNumber", checks: [] }),
    new InputFyString({ typeName: "InputFyString", checks: [] })
  ]).refine(validate2, msg).describe(`currency${code ? `:${code}` : ""}`);
}

// src/advanced/file.ts
var InputFyFile = class _InputFyFile extends InputFyType {
  _def;
  constructor(options = {}) {
    super();
    this._def = { typeName: "InputFyFile", options };
  }
  _parse(ctx) {
    if (!isValidFile(ctx.data, this._def.options)) {
      addIssue(ctx, {
        code: "custom",
        message: this._def.options.message ?? buildFileErrorMessage(this._def.options)
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyFile({ ...this._def.options });
  }
  maxSize(bytes) {
    const c = this._clone();
    c._def.options.maxSize = bytes;
    return c;
  }
  mimeTypes(types) {
    const c = this._clone();
    c._def.options.mimeTypes = types;
    return c;
  }
  extensions(exts) {
    const c = this._clone();
    c._def.options.extensions = exts;
    return c;
  }
};
function buildFileErrorMessage(options) {
  const parts = ["Invalid file"];
  if (options.maxSize) parts.push(`max ${options.maxSize} bytes`);
  if (options.mimeTypes?.length) parts.push(`MIME: ${options.mimeTypes.join(", ")}`);
  if (options.extensions?.length) parts.push(`ext: ${options.extensions.join(", ")}`);
  return parts.join(" \u2014 ");
}
function file(options) {
  return new InputFyFile(options);
}

// src/advanced/when.ts
function matchesCondition(value, condition) {
  if (condition !== null && typeof condition === "object" && "_def" in condition) {
    return condition.safeParse(value).success;
  }
  if (Array.isArray(condition)) {
    return condition.includes(value);
  }
  return value === condition;
}
var InputFyWhen = class _InputFyWhen extends InputFyType {
  _def;
  constructor(refField, options) {
    super();
    this._def = {
      typeName: "InputFyWhen",
      refField,
      is: options.is,
      then: options.then,
      otherwise: options.otherwise
    };
  }
  _parse(ctx) {
    const parent = ctx.parent;
    if (!parent || typeof parent.data !== "object" || parent.data === null) {
      addIssue(ctx, {
        code: "custom",
        message: `when('${this._def.refField}') requires a parent object context`
      });
      return ctx.data;
    }
    const parentObj = parent.data;
    const refValue = parentObj[this._def.refField];
    const activeSchema = matchesCondition(refValue, this._def.is) ? this._def.then : this._def.otherwise ?? this._def.then;
    return parseInner(activeSchema, ctx, ctx.data);
  }
  _clone() {
    return new _InputFyWhen(this._def.refField, {
      is: this._def.is,
      then: this._def.then,
      otherwise: this._def.otherwise
    });
  }
};
function when(refField, options) {
  return new InputFyWhen(refField, options);
}

// src/advanced/context.ts
var InputFyContextual = class _InputFyContextual extends InputFyType {
  _def;
  constructor(factory) {
    super();
    this._def = { typeName: "InputFyContextual", factory };
  }
  _parse(ctx) {
    const innerSchema = this._def.factory(ctx.common.context);
    return parseInner(innerSchema, ctx);
  }
  _clone() {
    return new _InputFyContextual(this._def.factory);
  }
};
function contextual(factory) {
  return new InputFyContextual(factory);
}
function envKey(key, schema) {
  return contextual((ctx) => {
    if (ctx[key] === void 0) {
      return schema.optional();
    }
    return schema;
  });
}

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
function issueCodeErrorMap(map2) {
  return map2;
}

// src/performance/lru-cache.ts
var LRUCache = class {
  maxSize;
  map = /* @__PURE__ */ new Map();
  hits = 0;
  misses = 0;
  constructor(options) {
    this.maxSize = Math.max(1, options.maxSize);
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      this.misses++;
      return void 0;
    }
    this.hits++;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
  has(key) {
    return this.map.has(key);
  }
  delete(key) {
    return this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  stats() {
    return {
      size: this.map.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses
    };
  }
};

// src/performance/compile.ts
function runStringCheckFast(value, check) {
  switch (check.kind) {
    case "min":
      return value.length >= check.value;
    case "max":
      return value.length <= check.value;
    case "length":
      return value.length === check.value;
    case "email":
      return testRegexSafe(EMAIL_REGEX, value);
    case "uuid":
      return testRegexSafe(UUID_REGEX, value);
    case "includes":
      return value.includes(check.value);
    case "startsWith":
      return value.startsWith(check.value);
    case "endsWith":
      return value.endsWith(check.value);
    case "regex":
      return testRegexSafe(check.regex, value);
    case "trim":
    case "toLowerCase":
    case "toUpperCase":
      return true;
    default:
      return true;
  }
}
function applyStringTransforms(value, checks) {
  let result = value;
  for (const check of checks) {
    if (check.kind === "trim") result = result.trim();
    if (check.kind === "toLowerCase") result = result.toLowerCase();
    if (check.kind === "toUpperCase") result = result.toUpperCase();
  }
  return result;
}
function hasEffects(schema) {
  return (schema._def.effects?.length ?? 0) > 0;
}
function compileStringFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyString") return null;
  const def = inner._def;
  const checks = def.checks;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "string") return null;
    for (const check of checks) {
      if (["trim", "toLowerCase", "toUpperCase"].includes(check.kind)) continue;
      if (!runStringCheckFast(data, check)) return null;
    }
    return applyStringTransforms(data, checks);
  };
}
function compileNumberFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyNumber") return null;
  const def = inner._def;
  const checks = def.checks;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "number" || Number.isNaN(data)) return null;
    for (const check of checks) {
      if (check.kind === "int" && !Number.isInteger(data)) return null;
      if (check.kind === "min" && check.value !== void 0 && data < check.value) return null;
      if (check.kind === "max" && check.value !== void 0 && data > check.value) return null;
      if (check.kind === "positive" && data <= 0) return null;
      if (check.kind === "negative" && data >= 0) return null;
      if (check.kind === "finite" && !Number.isFinite(data)) return null;
    }
    return data;
  };
}
function compileObjectFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyObject") return null;
  const def = inner._def;
  const shape = def.shape();
  const fieldRunners = Object.entries(shape).map(([key, fieldSchema]) => ({
    key,
    run: compileFastRunner(fieldSchema),
    schema: fieldSchema
  }));
  if (fieldRunners.some((f) => !f.run)) return null;
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
    const input = data;
    const result = /* @__PURE__ */ Object.create(null);
    for (const field of fieldRunners) {
      const value = Object.prototype.hasOwnProperty.call(input, field.key) ? input[field.key] : void 0;
      const parsed = field.run(value);
      if (parsed === null) return null;
      result[field.key] = parsed;
    }
    if (def.unknownKeys === "strict") {
      for (const key of Object.keys(input)) {
        if (!(key in shape)) return null;
      }
    } else if (def.unknownKeys === "passthrough") {
      for (const key of Object.keys(input)) {
        if (!(key in shape)) result[key] = input[key];
      }
    }
    return result;
  };
}
function compileEnumFast(schema) {
  if (hasEffects(schema)) return null;
  const { schema: inner, optional, nullable } = unwrapSchema(schema);
  if (inner._def.typeName !== "InputFyEnum") return null;
  const def = inner._def;
  const set2 = new Set(def.values);
  return (data) => {
    if (data === void 0 && optional) return void 0;
    if (data === null && nullable) return null;
    if (typeof data !== "string" || !set2.has(data)) return null;
    return data;
  };
}
function compileFastRunner(schema) {
  return compileStringFast(schema) ?? compileNumberFast(schema) ?? compileEnumFast(schema) ?? compileObjectFast(schema);
}
function compile(schema, _options = {}) {
  const fastRun = compileFastRunner(schema);
  const validate2 = (data) => {
    if (fastRun) {
      const result = fastRun(data);
      if (result !== null) {
        return { success: true, data: result };
      }
    }
    return schema.safeParse(data);
  };
  return {
    schema,
    fastPath: fastRun !== null,
    validate: validate2,
    validateAsync: (data) => schema.safeParseAsync(data)
  };
}
function isCompilable(schema) {
  return compileFastRunner(schema) !== null;
}

// src/performance/schema-cache.ts
var schemaIdCounter = 0;
var schemaIds = /* @__PURE__ */ new WeakMap();
function getSchemaId(schema) {
  let id = schemaIds.get(schema);
  if (!id) {
    id = `schema_${++schemaIdCounter}`;
    schemaIds.set(schema, id);
  }
  return id;
}
function hashData(data) {
  if (data === null || data === void 0) return String(data);
  if (typeof data === "object") {
    try {
      return JSON.stringify(data);
    } catch {
      return `obj_${Object.prototype.toString.call(data)}`;
    }
  }
  return `${typeof data}:${String(data)}`;
}
var SchemaCache = class {
  compiledCache;
  parseCache;
  cacheParseResults;
  constructor(options = {}) {
    this.compiledCache = new LRUCache({ maxSize: options.maxCompiled ?? 128 });
    this.parseCache = new LRUCache({ maxSize: options.maxParseResults ?? 512 });
    this.cacheParseResults = options.cacheParseResults ?? false;
  }
  compile(schema) {
    const key = getSchemaId(schema);
    const cached = this.compiledCache.get(key);
    if (cached) return cached;
    const compiled = compile(schema);
    this.compiledCache.set(key, compiled);
    return compiled;
  }
  parse(schema, data) {
    if (this.cacheParseResults) {
      const key = `${getSchemaId(schema)}:${hashData(data)}`;
      const cached = this.parseCache.get(key);
      if (cached) return cached;
      const result = this.compile(schema).validate(data);
      this.parseCache.set(key, result);
      return result;
    }
    return this.compile(schema).validate(data);
  }
  clear() {
    this.compiledCache.clear();
    this.parseCache.clear();
  }
  stats() {
    return {
      compiled: this.compiledCache.stats(),
      parseResults: this.parseCache.stats()
    };
  }
};
var defaultSchemaCache = new SchemaCache();
function cachedCompile(schema) {
  return defaultSchemaCache.compile(schema);
}
function cachedParse(schema, data) {
  return defaultSchemaCache.parse(schema, data);
}
function createSchemaCache(options) {
  return new SchemaCache(options);
}

// src/performance/stream.ts
function shouldSkipLine(line, skipEmpty) {
  return skipEmpty && line.trim().length === 0;
}
function parseNDJSONLine(schema, line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      success: false,
      error: InputFyError.create([{ code: "custom", path: [], message: "Empty line" }])
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      success: false,
      error: InputFyError.create([{ code: "custom", path: [], message: "Invalid JSON line" }])
    };
  }
  return schema.safeParse(parsed);
}
function validateNDJSON(schema, input, options = {}) {
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  const lines = input.split("\n");
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (shouldSkipLine(raw, skipEmpty)) continue;
    const result = parseNDJSONLine(schema, raw);
    results.push({ line: i + 1, raw, result });
    if (!result.success && onError === "fail") break;
  }
  return results;
}
async function* validateNDJSONStream(schema, source, options = {}) {
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  let buffer = "";
  let lineNumber = 0;
  for await (const chunk of source) {
    buffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      lineNumber++;
      if (shouldSkipLine(part, skipEmpty)) continue;
      const result = parseNDJSONLine(schema, part);
      yield { line: lineNumber, raw: part, result };
      if (!result.success && onError === "fail") return;
    }
  }
  if (buffer.trim()) {
    lineNumber++;
    const result = parseNDJSONLine(schema, buffer);
    yield { line: lineNumber, raw: buffer, result };
  }
}
function createNDJSONValidator(schema, options = {}) {
  const { Transform } = require("stream");
  const onError = options.onError ?? "collect";
  const skipEmpty = options.skipEmpty ?? true;
  let buffer = "";
  let lineNumber = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, _enc, callback) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        lineNumber++;
        if (shouldSkipLine(line, skipEmpty)) continue;
        const result = parseNDJSONLine(schema, line);
        this.push({ line: lineNumber, raw: line, result });
        if (!result.success && onError === "fail") {
          callback(new Error(`Validation failed at line ${lineNumber}`));
          return;
        }
      }
      callback();
    },
    flush(callback) {
      if (buffer.trim()) {
        lineNumber++;
        const result = parseNDJSONLine(schema, buffer);
        this.push({ line: lineNumber, raw: buffer, result });
        if (!result.success && onError === "fail") {
          callback(new Error(`Validation failed at line ${lineNumber}`));
          return;
        }
      }
      callback();
    }
  });
}

// src/performance/lazy-registry.ts
var InputFyDeferred = class _InputFyDeferred extends InputFyType {
  _def;
  resolved;
  constructor(loader) {
    super();
    this._def = { typeName: "InputFyDeferred", loader };
  }
  async resolve() {
    if (this.resolved) return this.resolved;
    const result = this._def.loader();
    this.resolved = await Promise.resolve(result);
    return this.resolved;
  }
  _parse(ctx) {
    if (this.resolved) {
      return parseInner(this.resolved, ctx);
    }
    if (ctx.common.async) {
      return this.resolve().then((schema) => parseInner(schema, ctx));
    }
    throw new Error(
      "Deferred schema not loaded. Call resolve() first or use safeParseAsync."
    );
  }
  _clone() {
    const cloned = new _InputFyDeferred(this._def.loader);
    if (this.resolved) cloned.resolved = this.resolved;
    return cloned;
  }
};
function deferred(loader) {
  return new InputFyDeferred(loader);
}
var LazySchemaRegistry = class {
  constructor(options = {}) {
    this.options = options;
  }
  options;
  loaders = /* @__PURE__ */ new Map();
  loaded = /* @__PURE__ */ new Map();
  loading = /* @__PURE__ */ new Map();
  register(name, loader) {
    this.loaders.set(name, loader);
    this.loaded.delete(name);
    this.loading.delete(name);
    if (this.options.preload) {
      void this.resolve(name).catch(() => void 0);
    }
  }
  has(name) {
    return this.loaders.has(name);
  }
  async resolve(name) {
    if (this.loaded.has(name)) return this.loaded.get(name);
    if (this.loading.has(name)) return this.loading.get(name);
    const loader = this.loaders.get(name);
    if (!loader) {
      throw new LazyLoadErrorClass(`Schema not registered: ${name}`);
    }
    const promise2 = Promise.resolve(loader()).then((schema) => {
      this.loaded.set(name, schema);
      this.loading.delete(name);
      return schema;
    });
    this.loading.set(name, promise2);
    return promise2;
  }
  resolveSync(name) {
    if (this.loaded.has(name)) return this.loaded.get(name);
    const loader = this.loaders.get(name);
    if (!loader) {
      throw new LazyLoadErrorClass(`Schema not registered: ${name}`);
    }
    const schema = loader();
    if (isPromise(schema)) {
      throw new LazyLoadErrorClass(`Schema '${name}' requires async resolve()`);
    }
    this.loaded.set(name, schema);
    return schema;
  }
  /** Retorna InputFyLazy que carrega do registro na primeira validação */
  lazy(name) {
    return lazy(() => this.resolveSync(name));
  }
  /** Retorna InputFyDeferred com carregamento assíncrono */
  deferred(name) {
    return new InputFyDeferred(() => this.resolve(name));
  }
  clear(name) {
    if (name) {
      this.loaders.delete(name);
      this.loaded.delete(name);
      this.loading.delete(name);
      return;
    }
    this.loaders.clear();
    this.loaded.clear();
    this.loading.clear();
  }
  list() {
    return [...this.loaders.keys()];
  }
};
var LazyLoadErrorClass = class extends Error {
  constructor(message) {
    super(message);
    this.name = "LazyLoadError";
  }
};
var defaultLazyRegistry = new LazySchemaRegistry();
function createLazyRegistry(options) {
  return new LazySchemaRegistry(options);
}

// src/performance/worker.ts
var import_node_url = require("url");
var import_node_path = require("path");
var import_meta = {};
function getWorkerScriptPath() {
  try {
    const { createRequire } = require("module");
    const req = createRequire(import_meta.url);
    return req.resolve("inputfy/worker-runner");
  } catch {
    const { createRequire } = require("module");
    const req = createRequire(typeof __filename !== "undefined" ? __filename : (0, import_node_url.fileURLToPath)(import_meta.url));
    try {
      return req.resolve("inputfy/worker-runner");
    } catch {
      return (0, import_node_path.join)((0, import_node_path.dirname)((0, import_node_url.fileURLToPath)(import_meta.url)), "worker-runner.js");
    }
  }
}
var ValidationWorkerPool = class {
  constructor(jsonSchema, options = {}) {
    this.jsonSchema = jsonSchema;
    const { Worker } = require("worker_threads");
    const poolSize = options.poolSize ?? 2;
    const workerPath = getWorkerScriptPath();
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerPath, {
        workerData: { jsonSchema: this.jsonSchema }
      });
      worker.on("message", (msg) => {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        if (pending.timer) clearTimeout(pending.timer);
        this.pending.delete(msg.id);
        pending.resolve(msg.result);
        this.processQueue();
      });
      worker.on("error", (err) => {
        for (const [, p] of this.pending) p.reject(err);
        this.pending.clear();
      });
      this.workers.push(worker);
    }
    this.defaultTimeout = options.timeout ?? 3e4;
  }
  jsonSchema;
  workers = [];
  queue = [];
  pending = /* @__PURE__ */ new Map();
  nextId = 0;
  roundRobin = 0;
  terminated = false;
  defaultTimeout;
  validate(data) {
    if (this.terminated) {
      return Promise.reject(new Error("Worker pool terminated"));
    }
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.queue.push({
        id,
        data,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  processQueue() {
    if (this.queue.length === 0 || this.workers.length === 0) return;
    const worker = this.workers[this.roundRobin % this.workers.length];
    this.roundRobin++;
    const job = this.queue.shift();
    if (!job) return;
    const timer = setTimeout(() => {
      this.pending.delete(job.id);
      job.reject(new Error(`Validation timeout for job ${job.id}`));
    }, this.defaultTimeout);
    this.pending.set(job.id, {
      resolve: job.resolve,
      reject: job.reject,
      timer
    });
    worker.postMessage({ id: job.id, data: job.data });
  }
  async validateBatch(items) {
    return Promise.all(items.map((item) => this.validate(item)));
  }
  terminate() {
    this.terminated = true;
    for (const worker of this.workers) {
      void worker.terminate();
    }
    this.workers.length = 0;
    this.queue.length = 0;
    for (const [, p] of this.pending) {
      if (p.timer) clearTimeout(p.timer);
      p.reject(new Error("Worker pool terminated"));
    }
    this.pending.clear();
  }
};
function createValidationWorkerPool(schema, options = {}) {
  const jsonSchema = toJSONSchema(schema, { target: "draft-7" });
  return new ValidationWorkerPool(jsonSchema, { ...options, schema });
}
function isWorkerThreadsAvailable() {
  try {
    require("worker_threads");
    return true;
  } catch {
    return false;
  }
}

// src/performance/benchmark.ts
function measure(name, library, fn, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const totalMs = performance.now() - start;
  return {
    name,
    library,
    iterations,
    totalMs,
    avgMs: totalMs / iterations,
    opsPerSec: iterations / totalMs * 1e3
  };
}
async function tryImport(moduleName) {
  try {
    return await import(moduleName);
  } catch {
    return null;
  }
}
async function runBenchmark(suites, options = {}) {
  const iterations = options.iterations ?? 1e4;
  const warmup = options.warmup ?? 1e3;
  const libraries = options.libraries ?? ["inputfy", "zod", "yup", "joi"];
  const results = [];
  const zodMod = libraries.includes("zod") ? await tryImport("zod") : null;
  const yupMod = libraries.includes("yup") ? await tryImport("yup") : null;
  const joiMod = libraries.includes("joi") ? await tryImport("joi") : null;
  for (const suite of suites) {
    const samples = suite.samples;
    const compiled = compile(suite.schema);
    for (let i = 0; i < warmup; i++) {
      compiled.validate(samples[i % samples.length]);
    }
    if (libraries.includes("inputfy")) {
      results.push(
        measure(`${suite.name} (safeParse)`, "inputfy", () => {
          suite.schema.safeParse(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
      results.push(
        measure(`${suite.name} (compiled)`, "inputfy-aot", () => {
          compiled.validate(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
    if (zodMod && suite.zodSchema && libraries.includes("zod")) {
      const z = suite.zodSchema;
      for (let i = 0; i < warmup; i++) z.safeParse(samples[i % samples.length]);
      results.push(
        measure(suite.name, "zod", () => {
          z.safeParse(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
    if (yupMod && suite.yupSchema && libraries.includes("yup")) {
      const y = suite.yupSchema;
      for (let i = 0; i < warmup; i++) {
        try {
          y.validateSync(samples[i % samples.length]);
        } catch {
        }
      }
      results.push(
        measure(suite.name, "yup", () => {
          try {
            y.validateSync(samples[Math.floor(Math.random() * samples.length)]);
          } catch {
          }
        }, iterations)
      );
    }
    if (joiMod && suite.joiSchema && libraries.includes("joi")) {
      const j = suite.joiSchema;
      for (let i = 0; i < warmup; i++) j.validate(samples[i % samples.length]);
      results.push(
        measure(suite.name, "joi", () => {
          j.validate(samples[Math.floor(Math.random() * samples.length)]);
        }, iterations)
      );
    }
  }
  return results;
}
function formatBenchmarkTable(results) {
  const header = "| Suite | Library | ops/sec | avg ms | total ms |";
  const sep = "|---|---|---:|---:|---:|";
  const rows = results.map(
    (r) => `| ${r.name} | ${r.library} | ${Math.round(r.opsPerSec).toLocaleString()} | ${r.avgMs.toFixed(4)} | ${r.totalMs.toFixed(2)} |`
  );
  return [header, sep, ...rows].join("\n");
}

// src/security/csp.ts
var CSP_FRIENDLY = true;
function assertCSPFriendly() {
  if (!CSP_FRIENDLY) {
    throw new Error("InputFy CSP compliance pledge violated");
  }
}
function auditSchemaCSP(schema) {
  const notes = ["InputFy core pipeline uses no eval/Function"];
  const effects = schema._def.effects?.length ?? 0;
  if (effects > 0) {
    notes.push(`${effects} schema effect(s) \u2014 user-defined refinements run in-process`);
  }
  return {
    compliant: true,
    usesEval: false,
    usesFunction: false,
    usesDynamicImport: false,
    notes
  };
}

// src/security/rate-limit.ts
var ValidationRateLimiter = class {
  max;
  windowMs;
  windows = /* @__PURE__ */ new Map();
  constructor(options) {
    this.max = Math.max(1, options.max);
    this.windowMs = Math.max(1, options.windowMs);
  }
  check(key) {
    this.prune();
    const now = Date.now();
    const entry = this.windows.get(key);
    if (!entry || now >= entry.resetAt) {
      return {
        allowed: true,
        remaining: this.max - 1,
        resetAt: now + this.windowMs
      };
    }
    if (entry.count >= this.max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }
    return {
      allowed: true,
      remaining: this.max - entry.count - 1,
      resetAt: entry.resetAt
    };
  }
  consume(key) {
    const result = this.check(key);
    if (!result.allowed) return result;
    const now = Date.now();
    const entry = this.windows.get(key);
    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.max - 1, resetAt };
    }
    entry.count++;
    return {
      allowed: true,
      remaining: Math.max(0, this.max - entry.count),
      resetAt: entry.resetAt
    };
  }
  reset(key) {
    if (key) this.windows.delete(key);
    else this.windows.clear();
  }
  prune() {
    const now = Date.now();
    for (const [key, entry] of this.windows) {
      if (now >= entry.resetAt) this.windows.delete(key);
    }
  }
};
function createRateLimiter(options) {
  return new ValidationRateLimiter(options);
}

// src/security/audit-log.ts
var SecurityAuditLog = class {
  entries = [];
  maxEntries;
  constructor(options = {}) {
    this.maxEntries = options.maxEntries ?? 1e3;
  }
  log(entry) {
    const full = {
      ...entry,
      timestamp: entry.timestamp ?? /* @__PURE__ */ new Date()
    };
    this.entries.push(full);
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }
    return full;
  }
  logInjection(message, pattern, path) {
    return this.log({
      type: "injection_attempt",
      message,
      ...pattern !== void 0 ? { pattern } : {},
      ...path !== void 0 ? { path } : {}
    });
  }
  getEntries(filter) {
    return this.entries.filter((e) => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.since && e.timestamp < filter.since) return false;
      return true;
    });
  }
  clear() {
    this.entries = [];
  }
  get size() {
    return this.entries.length;
  }
};
var defaultAuditLog = new SecurityAuditLog();
function createAuditLog(options) {
  return new SecurityAuditLog(options);
}

// src/security/schema-signature.ts
var import_node_crypto = require("crypto");
function serializableDef(schema, depth = 0) {
  if (depth > 32) return { typeName: "max_depth" };
  const def = schema._def;
  const base = { typeName: def.typeName };
  if (def.typeName === "InputFyString") {
    const s = def;
    base["checks"] = (s.checks ?? []).map((c) => {
      const check = c;
      if (check.kind === "regex" && check.regex) {
        return { kind: "regex", source: check.regex.source, flags: check.regex.flags };
      }
      return c;
    });
    if (s.coerce) base["coerce"] = true;
  }
  if (def.typeName === "InputFyNumber") {
    base["checks"] = def.checks ?? [];
  }
  if (def.typeName === "InputFyObject") {
    const shape = def.shape();
    base["shape"] = Object.fromEntries(
      Object.entries(shape).map(([k, v2]) => [k, serializableDef(v2, depth + 1)])
    );
    base["unknownKeys"] = def.unknownKeys;
  }
  if (def.typeName === "InputFyArray") {
    base["type"] = serializableDef(
      def.type,
      depth + 1
    );
  }
  if (def.typeName === "InputFyEnum") {
    base["values"] = def.values;
  }
  if (def.typeName === "InputFyLiteral") {
    base["value"] = def.value;
  }
  if (def.typeName === "InputFyUnion") {
    base["options"] = def.options.map(
      (o) => serializableDef(o, depth + 1)
    );
  }
  if (def.effects?.length) {
    base["effectsCount"] = def.effects.length;
  }
  return base;
}
function schemaFingerprint(schema) {
  const { schema: inner } = unwrapSchema(schema);
  return JSON.stringify(serializableDef(inner));
}
function signSchema(schema, secret) {
  const payload = schemaFingerprint(schema);
  return (0, import_node_crypto.createHmac)("sha256", secret).update(payload).digest("hex");
}
function inputfySchemaSignature(schema, secret, signature) {
  const expected = signSchema(schema, secret);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    return a.length === b.length && (0, import_node_crypto.timingSafeEqual)(a, b);
  } catch {
    return false;
  }
}
var SchemaTamperError = class extends InputFyError {
  constructor() {
    super([{ code: "custom", path: [], message: "Schema integrity check failed (tamper detected)" }]);
    this.name = "SchemaTamperError";
  }
};
function signedSchema(schema, secret, signature) {
  const sig = signature ?? signSchema(schema, secret);
  const assertIntegrity = () => {
    if (!inputfySchemaSignature(schema, secret, sig)) {
      throw new SchemaTamperError();
    }
  };
  return {
    schema,
    signature: sig,
    safeParse(data) {
      assertIntegrity();
      return schema.safeParse(data);
    },
    parse(data) {
      assertIntegrity();
      return schema.parse(data);
    }
  };
}

// src/security/parse-guard.ts
function rateLimitKey(ctx) {
  return ctx?.key;
}
function applySecurityPreParse(data, ctx) {
  const config3 = getSecurityConfig();
  if (!ctx?.skipRateLimit && config3.rateLimiter) {
    const key = rateLimitKey(ctx) ?? "default";
    const result = config3.rateLimiter.consume(key);
    if (!result.allowed) {
      config3.auditLog?.log({
        type: "rate_limit",
        message: `Rate limit exceeded for key: ${key}`,
        key
      });
      return {
        data,
        blocked: true,
        error: InputFyError.create([
          {
            code: "custom",
            path: [],
            message: `Validation rate limit exceeded. Retry after ${new Date(result.resetAt).toISOString()}`
          }
        ])
      };
    }
  }
  if (config3.paranoid && !ctx?.skipParanoid) {
    const paranoid = applyParanoidMode(data, {
      ...config3.paranoidOptions,
      action: config3.paranoidOptions?.action ?? "reject",
      html: config3.paranoidOptions?.html ?? true,
      sql: config3.paranoidOptions?.sql ?? true,
      pathTraversal: config3.paranoidOptions?.pathTraversal ?? true
    });
    if (paranoid.rejected) {
      for (const pattern of paranoid.patterns) {
        config3.auditLog?.logInjection(
          `Suspicious pattern detected: ${pattern.kind}`,
          pattern.match,
          pattern.path ? pattern.path.split(".") : []
        );
      }
      return {
        data,
        blocked: true,
        error: InputFyError.create([
          {
            code: "custom",
            path: [],
            message: `Input rejected by paranoid mode (${paranoid.patterns[0]?.kind ?? "suspicious"})`
          }
        ])
      };
    }
    return { data: paranoid.value, blocked: false };
  }
  return { data, blocked: false };
}
function auditParseFailure(data) {
  const config3 = getSecurityConfig();
  if (!config3.auditLog) return;
  const patterns = detectSuspiciousPatterns(data);
  for (const pattern of patterns) {
    config3.auditLog.logInjection(
      `Validation failed with suspicious input: ${pattern.kind}`,
      pattern.match,
      pattern.path ? pattern.path.split(".") : []
    );
  }
}
function secureParse(schema, data, params) {
  const pre = applySecurityPreParse(data, params?.security);
  if (pre.blocked && pre.error) {
    return { success: false, error: pre.error };
  }
  const result = schema.safeParse(pre.data, params);
  if (!result.success) {
    auditParseFailure(data);
  }
  return result;
}
async function secureParseAsync(schema, data, params) {
  const pre = applySecurityPreParse(data, params?.security);
  if (pre.blocked && pre.error) {
    return { success: false, error: pre.error };
  }
  const result = await schema.safeParseAsync(pre.data, params);
  if (!result.success) {
    auditParseFailure(data);
  }
  return result;
}

// src/dx/generate.ts
function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
function generateString(checks, rng) {
  let base = "lorem ipsum";
  for (const check of checks) {
    if (check.kind === "email") return `user${Math.floor(rng() * 9999)}@example.com`;
    if (check.kind === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
    if (check.kind === "url") return "https://example.com";
    if (check.kind === "min" && typeof check.value === "number") {
      base = base.padEnd(check.value, "x");
    }
    if (check.kind === "max" && typeof check.value === "number") {
      base = base.slice(0, check.value);
    }
    if (check.kind === "length" && typeof check.value === "number") {
      base = "x".repeat(check.value);
    }
  }
  return base;
}
function generateNumber(checks, rng) {
  let min = 0;
  let max = 100;
  let isInt = false;
  for (const check of checks) {
    if (check.kind === "int") isInt = true;
    if (check.kind === "min" && check.value !== void 0) min = check.value;
    if (check.kind === "max" && check.value !== void 0) max = check.value;
    if (check.kind === "positive") min = Math.max(min, 1);
  }
  const val = min + rng() * (max - min);
  return isInt ? Math.floor(val) : Math.round(val * 100) / 100;
}
function generateValue(schema, rng, opts, depth) {
  if (depth > opts.maxDepth) return null;
  const { schema: inner, optional, nullable, defaultValue } = unwrapSchema(schema);
  if (defaultValue !== void 0) return defaultValue;
  if (nullable && rng() > 0.8) return null;
  if (optional && !opts.includeOptional && rng() > 0.5) return void 0;
  const typeName = inner._def.typeName;
  switch (typeName) {
    case "InputFyString":
      return generateString(
        inner._def.checks ?? [],
        rng
      );
    case "InputFyNumber":
    case "InputFyBigInt":
      return generateNumber(
        inner._def.checks ?? [],
        rng
      );
    case "InputFyBoolean":
      return rng() > 0.5;
    case "InputFyLiteral":
      return inner._def.value;
    case "InputFyEnum": {
      const values = inner._def.values;
      return pick(rng, values);
    }
    case "InputFyObject": {
      const shape = inner._def.shape();
      const result = /* @__PURE__ */ Object.create(null);
      for (const [key, fieldSchema] of Object.entries(shape)) {
        const val = generateValue(fieldSchema, rng, opts, depth + 1);
        if (val !== void 0) result[key] = val;
      }
      return result;
    }
    case "InputFyArray": {
      const itemType = inner._def.type;
      const len = 1 + Math.floor(rng() * Math.min(3, opts.maxArrayLength));
      return Array.from({ length: len }, () => generateValue(itemType, rng, opts, depth + 1));
    }
    case "InputFyTuple": {
      const items = inner._def.items;
      return items.map((item) => generateValue(item, rng, opts, depth + 1));
    }
    case "InputFyUnion": {
      const options = inner._def.options;
      return generateValue(pick(rng, options), rng, opts, depth + 1);
    }
    case "InputFyNull":
      return null;
    case "InputFyUndefined":
      return void 0;
    case "InputFyDate":
      return new Date(Date.UTC(2024, 5, 15));
    default:
      return null;
  }
}
function generate(schema, options = {}) {
  const opts = {
    seed: options.seed ?? Date.now(),
    includeOptional: options.includeOptional ?? true,
    maxArrayLength: options.maxArrayLength ?? 3,
    maxDepth: options.maxDepth ?? 16
  };
  const rng = createRng(opts.seed);
  return generateValue(schema, rng, opts, 0);
}
function generateMany(schema, count, options = {}) {
  return Array.from(
    { length: count },
    (_, i) => generate(schema, { ...options, seed: (options.seed ?? 1) + i })
  );
}

// src/dx/schema-diff.ts
function schemaToComparable(schema) {
  return toJSONSchema(schema, { target: "draft-7", metadata: true });
}
function flattenProperties(schema, prefix = "") {
  const map2 = /* @__PURE__ */ new Map();
  if (schema.properties) {
    for (const [key, sub] of Object.entries(schema.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      map2.set(path, sub);
      if (sub.properties) {
        for (const [nested, val] of flattenProperties(sub, path)) {
          map2.set(nested, val);
        }
      }
    }
  }
  return map2;
}
function requiredSet(schema, prefix = "") {
  const set2 = /* @__PURE__ */ new Set();
  const req = schema.required ?? [];
  for (const key of req) {
    const path = prefix ? `${prefix}.${key}` : key;
    set2.add(path);
  }
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const sub = schema.properties[key];
      for (const r of requiredSet(sub, path)) set2.add(r);
    }
  }
  return set2;
}
function typeLabel(schema) {
  if (Array.isArray(schema.type)) return schema.type.join("|");
  if (schema.type) return schema.type;
  if (schema.enum) return `enum(${schema.enum.join("|")})`;
  return "unknown";
}
function pushChange(changes, change) {
  changes.push(change);
}
function diffSchema(left, right) {
  const leftJson = schemaToComparable(left);
  const rightJson = schemaToComparable(right);
  return diffJSONSchema(leftJson, rightJson);
}
function diffJSONSchema(left, right) {
  const all = [];
  const leftProps = flattenProperties(left);
  const rightProps = flattenProperties(right);
  const leftReq = requiredSet(left);
  const rightReq = requiredSet(right);
  for (const [path, lSchema] of leftProps) {
    const rSchema = rightProps.get(path);
    if (!rSchema) {
      pushChange(all, {
        kind: "field_removed",
        severity: leftReq.has(path) ? "breaking" : "warning",
        path,
        message: `Field removed: ${path}`,
        before: typeLabel(lSchema)
      });
      continue;
    }
    const lType = typeLabel(lSchema);
    const rType = typeLabel(rSchema);
    if (lType !== rType) {
      pushChange(all, {
        kind: "type_changed",
        severity: "breaking",
        path,
        message: `Type changed at ${path}: ${lType} \u2192 ${rType}`,
        before: lType,
        after: rType
      });
    }
    if (leftReq.has(path) && !rightReq.has(path)) {
      pushChange(all, {
        kind: "required_removed",
        severity: "warning",
        path,
        message: `Field no longer required: ${path}`
      });
    }
    if (!leftReq.has(path) && rightReq.has(path)) {
      pushChange(all, {
        kind: "required_added",
        severity: "breaking",
        path,
        message: `Field now required: ${path}`
      });
    }
    const lEnum = lSchema.enum ?? [];
    const rEnum = rSchema.enum ?? [];
    if (lEnum.length && rEnum.length) {
      for (const val of lEnum) {
        if (!rEnum.includes(val)) {
          pushChange(all, {
            kind: "enum_value_removed",
            severity: "breaking",
            path,
            message: `Enum value removed at ${path}: ${String(val)}`,
            before: val
          });
        }
      }
      for (const val of rEnum) {
        if (!lEnum.includes(val)) {
          pushChange(all, {
            kind: "enum_value_added",
            severity: "info",
            path,
            message: `Enum value added at ${path}: ${String(val)}`,
            after: val
          });
        }
      }
    }
    if (lSchema.minimum !== void 0 && rSchema.minimum !== void 0 && rSchema.minimum > lSchema.minimum) {
      pushChange(all, {
        kind: "constraint_tightened",
        severity: "breaking",
        path,
        message: `Minimum increased at ${path}: ${lSchema.minimum} \u2192 ${rSchema.minimum}`,
        before: lSchema.minimum,
        after: rSchema.minimum
      });
    }
    if (lSchema.description !== rSchema.description && (lSchema.description || rSchema.description)) {
      pushChange(all, {
        kind: "description_changed",
        severity: "info",
        path,
        message: `Description changed at ${path}`,
        before: lSchema.description,
        after: rSchema.description
      });
    }
  }
  for (const [path, rSchema] of rightProps) {
    if (!leftProps.has(path)) {
      pushChange(all, {
        kind: "field_added",
        severity: rightReq.has(path) ? "warning" : "info",
        path,
        message: `Field added: ${path}`,
        after: typeLabel(rSchema)
      });
    }
  }
  const breaking = all.filter((c) => c.severity === "breaking");
  const warnings = all.filter((c) => c.severity === "warning");
  const info = all.filter((c) => c.severity === "info");
  return {
    breaking,
    warnings,
    info,
    all,
    hasBreakingChanges: breaking.length > 0
  };
}
function formatSchemaDiff(result) {
  const lines = [];
  if (result.breaking.length) {
    lines.push("BREAKING:");
    for (const c of result.breaking) lines.push(`  \u2716 ${c.message}`);
  }
  if (result.warnings.length) {
    lines.push("WARNINGS:");
    for (const c of result.warnings) lines.push(`  \u26A0 ${c.message}`);
  }
  if (result.info.length) {
    lines.push("INFO:");
    for (const c of result.info) lines.push(`  \xB7 ${c.message}`);
  }
  if (lines.length === 0) return "No schema changes detected.";
  return lines.join("\n");
}

// src/dx/migrate-zod.ts
var IMPORT_REPLACEMENTS = [
  [/from\s+['"]zod['"]/g, "from 'inputfy'", "Import: zod \u2192 inputfy"],
  [/import\s+\*\s+as\s+z\s+from\s+['"]zod['"]/g, "import * as v from 'inputfy'", "Namespace import: z \u2192 v"],
  [/import\s+\{\s*z\s*\}\s*from\s+['"]zod['"]/g, "import { v } from 'inputfy'", "Named import: { z } \u2192 { v }"]
];
var API_REPLACEMENTS = [
  [/\bz\.infer</g, "infer<", "Type helper: z.infer \u2192 infer"],
  [/\bz\.input</g, "input<", "Type helper: z.input \u2192 input"],
  [/\bz\.output</g, "output<", "Type helper: z.output \u2192 output"],
  [/\bz\.string\s*\(/g, "v.string(", "API: z.string \u2192 v.string"],
  [/\bz\.number\s*\(/g, "v.number(", "API: z.number \u2192 v.number"],
  [/\bz\.boolean\s*\(/g, "v.boolean(", "API: z.boolean \u2192 v.boolean"],
  [/\bz\.object\s*\(/g, "v.object(", "API: z.object \u2192 v.object"],
  [/\bz\.array\s*\(/g, "v.array(", "API: z.array \u2192 v.array"],
  [/\bz\.enum\s*\(/g, "v.enum(", "API: z.enum \u2192 v.enum"],
  [/\bz\.union\s*\(/g, "v.union(", "API: z.union \u2192 v.union"],
  [/\bz\.literal\s*\(/g, "v.literal(", "API: z.literal \u2192 v.literal"],
  [/\bz\.optional\s*\(/g, "v.optional(", "API: z.optional \u2192 v.optional"],
  [/\bz\.nullable\s*\(/g, "v.nullable(", "API: z.nullable \u2192 v.nullable"],
  [/\bz\.coerce\./g, "v.coerce.", "API: z.coerce \u2192 v.coerce"],
  [/\bz\.preprocess\s*\(/g, "v.preprocess(", "API: z.preprocess \u2192 v.preprocess"],
  [/\bz\.discriminatedUnion\s*\(/g, "v.discriminatedUnion(", "API: discriminatedUnion"],
  [/\bz\.safeParse\s*\(/g, ".safeParse(", "Method: safeParse unchanged on schema"]
];
function migrateZodToInputFy(source) {
  let code = source;
  const changes = [];
  const warnings = [];
  for (const [pattern, replacement, description] of IMPORT_REPLACEMENTS) {
    if (pattern.test(code)) {
      changes.push({ from: pattern.source, to: replacement, description });
      code = code.replace(pattern, replacement);
    }
  }
  for (const [pattern, replacement, description] of API_REPLACEMENTS) {
    const before = code;
    code = code.replace(pattern, replacement);
    if (code !== before) {
      changes.push({ from: pattern.source, to: replacement, description });
    }
  }
  const zStandalone = /\bz\./g;
  if (zStandalone.test(code)) {
    code = code.replace(/\bz\./g, "v.");
    changes.push({ from: "z.", to: "v.", description: "Generic z. \u2192 v." });
  }
  if (/from\s+['"]zod['"]/.test(source) && !/from\s+['"]inputfy['"]/.test(code)) {
    warnings.push("Manual review: some zod imports may remain");
  }
  if (/\bzodResolver\b/.test(code)) {
    warnings.push("@hookform/resolvers/zod \u2192 consider custom inputfy resolver (future @inputfy/react-hook-form)");
  }
  if (/\b\.superRefine\s*\(/.test(code)) {
    warnings.push("superRefine is compatible \u2014 no change needed");
  }
  if (/\b\.transform\s*\(/.test(code)) {
    warnings.push("transform is compatible \u2014 no change needed");
  }
  return { code, changes, warnings };
}
function formatMigrationReport(result) {
  const lines = [`${result.changes.length} transformation(s) applied:`];
  for (const c of result.changes) {
    lines.push(`  \u2022 ${c.description}`);
  }
  if (result.warnings.length) {
    lines.push("", "Warnings:");
    for (const w of result.warnings) lines.push(`  \u26A0 ${w}`);
  }
  return lines.join("\n");
}

// src/dx/playground.ts
function createPlaygroundHTML(options = {}) {
  const title = options.title ?? "InputFy Playground";
  const initialSchema = options.initialSchema ? JSON.stringify(toJSONSchema(options.initialSchema, { target: "draft-7" }), null, 2) : JSON.stringify(
    {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        age: { type: "integer", minimum: 0 }
      },
      required: ["name", "email"]
    },
    null,
    2
  );
  const initialData = JSON.stringify(
    options.initialData ?? { name: "Ana", email: "ana@example.com", age: 30 },
    null,
    2
  );
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml2(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    header { padding: 1rem 1.5rem; background: #1e293b; border-bottom: 1px solid #334155; }
    h1 { margin: 0; font-size: 1.25rem; }
    main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; min-height: calc(100vh - 60px); }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; } }
    section { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-size: 0.875rem; color: #94a3b8; font-weight: 600; }
    textarea { flex: 1; min-height: 280px; font-family: ui-monospace, monospace; font-size: 13px;
      background: #1e293b; color: #f1f5f9; border: 1px solid #475569; border-radius: 8px; padding: 0.75rem; resize: vertical; }
    button { background: #3b82f6; color: white; border: none; padding: 0.625rem 1.25rem;
      border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; }
    button:hover { background: #2563eb; }
    #output { min-height: 120px; padding: 1rem; border-radius: 8px; font-family: ui-monospace, monospace;
      font-size: 13px; white-space: pre-wrap; background: #1e293b; border: 1px solid #475569; }
    .success { border-color: #22c55e !important; color: #86efac; }
    .error { border-color: #ef4444 !important; color: #fca5a5; }
  </style>
</head>
<body>
  <header><h1>${escapeHtml2(title)}</h1></header>
  <main>
    <section>
      <label for="schema">JSON Schema</label>
      <textarea id="schema">${escapeHtml2(initialSchema)}</textarea>
    </section>
    <section>
      <label for="data">Dados JSON</label>
      <textarea id="data">${escapeHtml2(initialData)}</textarea>
    </section>
  </main>
  <div style="padding: 0 1rem 1rem;">
    <button id="validate">Validar</button>
    <div id="output" style="margin-top: 1rem;">Clique em Validar para testar o schema contra os dados.</div>
  </div>
  <script type="module">
    import { fromJSONSchema } from '../dist/index.js';

    const schemaEl = document.getElementById('schema');
    const dataEl = document.getElementById('data');
    const outputEl = document.getElementById('output');
    document.getElementById('validate').addEventListener('click', () => {
      outputEl.className = '';
      try {
        const jsonSchema = JSON.parse(schemaEl.value);
        const data = JSON.parse(dataEl.value);
        const schema = fromJSONSchema(jsonSchema);
        const result = schema.safeParse(data);
        if (result.success) {
          outputEl.className = 'success';
          outputEl.textContent = '\u2713 V\xE1lido\\n\\n' + JSON.stringify(result.data, null, 2);
        } else {
          outputEl.className = 'error';
          outputEl.textContent = '\u2716 Inv\xE1lido\\n\\n' + result.error.issues
            .map(i => (i.path.length ? '[' + i.path.join('.') + '] ' : '') + i.message)
            .join('\\n');
        }
      } catch (e) {
        outputEl.className = 'error';
        outputEl.textContent = 'Erro: ' + (e.message || String(e));
      }
    });
  </script>
</body>
</html>`;
}
function escapeHtml2(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function writePlaygroundFile(path, options) {
  const { writeFile } = await import("fs/promises");
  await writeFile(path, createPlaygroundHTML(options), "utf-8");
}

// src/typescript/brand.ts
function branded(schema, options) {
  const opts = typeof options === "string" ? { brand: options } : options;
  let result = schema.brand();
  if (opts.description) {
    result = result.describe(opts.description);
  }
  for (const constraint of opts.constraints ?? []) {
    result = result.refine(constraint.check, constraint.message);
  }
  return result;
}
function getBrandName(schema) {
  const meta = schema.getMeta?.();
  return meta?.["brand"];
}
function withBrand(schema, brand) {
  const withMeta = schema.meta({ brand });
  return withMeta.brand();
}

// src/typescript/template-literal.ts
function normalizeParts(parts) {
  const segments = [];
  for (const part of parts) {
    if (typeof part === "string") {
      segments.push({ kind: "literal", value: part });
    } else {
      segments.push({ kind: "schema", schema: part });
    }
  }
  return segments;
}
function validateTemplateString(value, segments) {
  let pos = 0;
  for (let i = 0; i < segments.length; i++) {
    const part = segments[i];
    if (part.kind === "literal") {
      if (!value.startsWith(part.value, pos)) return false;
      pos += part.value.length;
      continue;
    }
    const nextLiteral = segments.slice(i + 1).find((s) => s.kind === "literal");
    let segment;
    if (nextLiteral) {
      const idx = value.indexOf(nextLiteral.value, pos);
      if (idx === -1) return false;
      segment = value.slice(pos, idx);
      pos = idx;
    } else {
      segment = value.slice(pos);
      pos = value.length;
    }
    if (!part.schema.safeParse(segment).success) return false;
  }
  return pos === value.length;
}
var InputFyTemplateLiteral = class _InputFyTemplateLiteral extends InputFyType {
  _def;
  constructor(segments) {
    super();
    this._def = { typeName: "InputFyTemplateLiteral", segments };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "string") {
      addIssue(ctx, { code: "invalid_type", expected: "string", received: ctx.parsedType });
      return "";
    }
    if (!validateTemplateString(ctx.data, this._def.segments)) {
      addIssue(ctx, {
        code: "invalid_string",
        validation: "regex",
        message: "String does not match template literal pattern"
      });
      return ctx.data;
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyTemplateLiteral(this._def.segments);
  }
};
function templateLiteral(...parts) {
  return new InputFyTemplateLiteral(normalizeParts(parts));
}
function templateLiteralFromParts(parts) {
  return templateLiteral(...parts);
}
function matchTemplateLiteral(value, ...parts) {
  return validateTemplateString(value, normalizeParts(parts));
}

// src/typescript/versioning.ts
var InputFyVersioned = class _InputFyVersioned extends InputFyType {
  _def;
  constructor(versions, options) {
    super();
    this._def = {
      typeName: "InputFyVersioned",
      versions,
      current: options.current,
      versionKey: options.versionKey ?? "__schemaVersion",
      migrate: options.migrate
    };
  }
  get currentVersion() {
    return this._def.current;
  }
  getSchema(version) {
    return this._def.versions[version];
  }
  _parse(ctx) {
    const versionKey = this._def.versionKey;
    let version = this._def.current;
    let payload = ctx.data;
    if (typeof ctx.data === "object" && ctx.data !== null && !Array.isArray(ctx.data)) {
      const record2 = ctx.data;
      if (record2[versionKey] !== void 0) {
        version = String(record2[versionKey]);
        const { [versionKey]: _removed, ...rest } = record2;
        payload = rest;
      }
    }
    const schema = this._def.versions[version];
    if (!schema) {
      addIssue(ctx, {
        code: "custom",
        message: `Unknown schema version: ${String(version)}`
      });
      return payload;
    }
    return parseInner(schema, childContext(ctx, payload));
  }
  _clone() {
    const opts = {
      current: this._def.current,
      versionKey: this._def.versionKey,
      ...this._def.migrate !== void 0 ? { migrate: this._def.migrate } : {}
    };
    return new _InputFyVersioned(this._def.versions, opts);
  }
  /** Parse com versão explícita */
  parseVersion(version, data) {
    const schema = this._def.versions[version];
    if (!schema) {
      throw new Error(`Unknown schema version: ${String(version)}`);
    }
    return schema.parse(data);
  }
};
function versionedSchema(versions, options) {
  if (!versions[options.current]) {
    throw new Error(`Current version "${String(options.current)}" not found in versions map`);
  }
  return new InputFyVersioned(versions, options);
}
function withSchemaVersion(schema, version) {
  return schema.meta({ schemaVersion: version });
}
function getSchemaVersion(schema) {
  const meta = schema.getMeta?.();
  return meta?.["schemaVersion"];
}

// src/observability/config.ts
var config2 = {
  enabled: false,
  serviceName: "inputfy"
};
function configureObservability(partial) {
  config2 = { ...config2, ...partial };
  return getObservabilityConfig();
}
function getObservabilityConfig() {
  return config2;
}
function resetObservabilityConfig() {
  config2 = { enabled: false, serviceName: "inputfy" };
}
function isObservabilityEnabled() {
  return config2.enabled !== false;
}

// src/observability/telemetry.ts
var InMemorySpan = class {
  constructor(name, attributes) {
    this.name = name;
    if (attributes) Object.assign(this.attributes, attributes);
  }
  name;
  attributes = /* @__PURE__ */ Object.create(null);
  status = { code: "OK" };
  ended = false;
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  setStatus(status) {
    this.status = status;
  }
  recordException(error) {
    this.attributes["exception.message"] = error.message;
  }
  end() {
    this.ended = true;
  }
};
var InMemoryTracer = class {
  spans = [];
  startSpan(name, attributes) {
    const span = new InMemorySpan(name, attributes);
    this.spans.push(span);
    return span;
  }
};
var InMemoryTracerProvider = class {
  constructor(tracer = new InMemoryTracer()) {
    this.tracer = tracer;
  }
  tracer;
  getTracer(_name) {
    return this.tracer;
  }
  get spans() {
    return this.tracer.spans;
  }
};
function withValidationSpan(tracer, schemaId, fn, extraAttributes) {
  const span = tracer.startSpan("inputfy.validate", {
    "inputfy.schema_id": schemaId,
    ...extraAttributes
  });
  const start = performance.now();
  try {
    const result = fn();
    const durationMs = performance.now() - start;
    span.setAttribute("inputfy.duration_ms", Math.round(durationMs * 100) / 100);
    if (result && typeof result === "object" && "success" in result) {
      const parsed = result;
      span.setAttribute("inputfy.success", parsed.success);
      if (!parsed.success) {
        span.setStatus({ code: "ERROR", message: "Validation failed" });
        span.setAttribute("inputfy.issue_count", parsed.error?.issues?.length ?? 0);
      } else {
        span.setStatus({ code: "OK" });
      }
    } else {
      span.setStatus({ code: "OK" });
    }
    return result;
  } catch (err) {
    span.setStatus({ code: "ERROR", message: err instanceof Error ? err.message : String(err) });
    span.recordException?.(err instanceof Error ? err : new Error(String(err)));
    throw err;
  } finally {
    span.end();
  }
}
function createInMemoryTracerProvider() {
  return new InMemoryTracerProvider();
}

// src/observability/metrics.ts
function counterKey(labels) {
  return [labels.schema, labels.field ?? "", labels.status ?? "", labels.code ?? ""].join("|");
}
function escapeLabel(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
function formatLabels(labels) {
  const parts = Object.entries(labels).map(
    ([k, v2]) => `${k}="${escapeLabel(v2)}"`
  );
  return parts.length ? `{${parts.join(",")}}` : "";
}
var ValidationMetrics = class {
  counters = /* @__PURE__ */ new Map();
  recordValidation(schema, success, issues = []) {
    this.increment({ schema, status: success ? "success" : "failure" });
    if (!success) {
      this.increment({ schema, status: "failure", code: "total" });
      for (const issue of issues) {
        const field = issue.path.length ? issue.path.join(".") : "root";
        this.increment({ schema, field, status: "failure", code: issue.code });
      }
    }
  }
  increment(labels, delta = 1) {
    const key = counterKey(labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }
  getCount(labels) {
    return this.counters.get(counterKey(labels)) ?? 0;
  }
  /** Exporta métricas no formato Prometheus text exposition */
  toPrometheus() {
    const lines = [];
    lines.push("# HELP inputfy_validation_total Total validation attempts");
    lines.push("# TYPE inputfy_validation_total counter");
    const validationTotals = /* @__PURE__ */ new Map();
    for (const [key, count] of this.counters) {
      const [schema, field, status, code] = key.split("|");
      if (field || code) continue;
      if (!validationTotals.has(schema)) {
        validationTotals.set(schema, { success: 0, failure: 0 });
      }
      const entry = validationTotals.get(schema);
      if (status === "success") entry.success += count;
      if (status === "failure") entry.failure += count;
    }
    for (const [schema, totals] of validationTotals) {
      lines.push(
        `inputfy_validation_total${formatLabels({ schema, status: "success" })} ${totals.success}`
      );
      lines.push(
        `inputfy_validation_total${formatLabels({ schema, status: "failure" })} ${totals.failure}`
      );
    }
    lines.push("# HELP inputfy_field_failures_total Validation failures by field");
    lines.push("# TYPE inputfy_field_failures_total counter");
    for (const [key, count] of this.counters) {
      const [schema, field, status, code] = key.split("|");
      if (!field || !schema || !code || status !== "failure" || code === "total") continue;
      lines.push(
        `inputfy_field_failures_total${formatLabels({ schema, field, code })} ${count}`
      );
    }
    return lines.join("\n") + "\n";
  }
  reset() {
    this.counters.clear();
  }
};
var defaultMetrics = new ValidationMetrics();
function createValidationMetrics() {
  return new ValidationMetrics();
}
var SchemaAnalytics = class {
  fieldFailures = /* @__PURE__ */ new Map();
  schemaStats = /* @__PURE__ */ new Map();
  recordParse(schema, success, issues = []) {
    const stats = this.schemaStats.get(schema) ?? { total: 0, failures: 0 };
    stats.total += 1;
    if (!success) {
      stats.failures += 1;
      for (const issue of issues) {
        const field = issue.path.length ? issue.path.join(".") : "root";
        const key = `${schema}|${field}`;
        const existing = this.fieldFailures.get(key);
        if (existing) {
          existing.count += 1;
          existing.lastSeen = /* @__PURE__ */ new Date();
        } else {
          this.fieldFailures.set(key, {
            schema,
            field,
            count: 1,
            lastSeen: /* @__PURE__ */ new Date()
          });
        }
      }
    }
    this.schemaStats.set(schema, stats);
  }
  getTopFailingFields(schema, limit = 10) {
    let entries = [...this.fieldFailures.values()];
    if (schema) entries = entries.filter((e) => e.schema === schema);
    return entries.sort((a, b) => b.count - a.count).slice(0, limit);
  }
  getFailureRate(schema) {
    const stats = this.schemaStats.get(schema);
    if (!stats || stats.total === 0) return 0;
    return stats.failures / stats.total;
  }
  getSnapshot(schema) {
    const stats = this.schemaStats.get(schema) ?? { total: 0, failures: 0 };
    return {
      schema,
      totalValidations: stats.total,
      failures: stats.failures,
      failureRate: stats.total ? stats.failures / stats.total : 0,
      topFailingFields: this.getTopFailingFields(schema)
    };
  }
  reset() {
    this.fieldFailures.clear();
    this.schemaStats.clear();
  }
};
var defaultAnalytics = new SchemaAnalytics();
function createSchemaAnalytics() {
  return new SchemaAnalytics();
}

// src/observability/health.ts
var START_TIME = Date.now();
function checkSchemaIntegrity(entry, options = {}) {
  const start = performance.now();
  const name = entry.id;
  try {
    if (!entry.schema || typeof entry.schema.safeParse !== "function") {
      return {
        name,
        status: "fail",
        message: "Invalid schema instance",
        durationMs: performance.now() - start
      };
    }
    const sample = entry.sample ?? options.samples?.[entry.id] ?? inferSample(entry.schema);
    const result = entry.schema.safeParse(sample);
    const durationMs = performance.now() - start;
    if (!result.success && sample !== void 0) {
      return {
        name,
        status: "warn",
        message: `Sample validation failed: ${result.error.issues[0]?.message ?? "unknown"}`,
        durationMs
      };
    }
    if (options.checkFingerprints) {
      try {
        schemaFingerprint(entry.schema);
      } catch {
        return {
          name,
          status: "fail",
          message: "Schema fingerprint computation failed",
          durationMs
        };
      }
    }
    return {
      name,
      status: "pass",
      ...entry.description !== void 0 ? { message: entry.description } : {},
      durationMs
    };
  } catch (err) {
    return {
      name,
      status: "fail",
      message: err instanceof Error ? err.message : String(err),
      durationMs: performance.now() - start
    };
  }
}
function inferSample(schema) {
  const typeName = schema._def.typeName;
  switch (typeName) {
    case "InputFyString": {
      const checks = schema._def.checks ?? [];
      if (checks.some((c) => c.kind === "email")) return "health@example.com";
      if (checks.some((c) => c.kind === "uuid")) return "550e8400-e29b-41d4-a716-446655440000";
      if (checks.some((c) => c.kind === "url")) return "https://example.com";
      return "health-check";
    }
    case "InputFyNumber":
    case "InputFyBigInt":
      return 0;
    case "InputFyBoolean":
      return true;
    case "InputFyObject": {
      const shapeFn = schema._def.shape;
      if (!shapeFn) return {};
      const shape = shapeFn();
      const sample = /* @__PURE__ */ Object.create(null);
      for (const [key, field] of Object.entries(shape)) {
        sample[key] = inferSample(field);
      }
      return sample;
    }
    case "InputFyArray":
      return [];
    default:
      return void 0;
  }
}
function createHealthCheck(schemas, options = {}) {
  const entries = Array.isArray(schemas) ? schemas : Object.entries(schemas).map(([id, schema]) => ({ id, schema }));
  const checks = entries.map((entry) => checkSchemaIntegrity(entry, options));
  const hasFail = checks.some((c) => c.status === "fail");
  const hasWarn = checks.some((c) => c.status === "warn");
  return {
    status: hasFail ? "error" : hasWarn ? "degraded" : "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...options.version !== void 0 ? { version: options.version } : {},
    uptimeMs: Date.now() - START_TIME,
    checks
  };
}
function createHealthCheckHandler(schemas, options = {}) {
  return (_req, res) => {
    const result = createHealthCheck(schemas, options);
    const code = result.status === "error" ? 503 : result.status === "degraded" ? 200 : 200;
    res.status(code).json(result);
  };
}
var SchemaRegistry = class {
  schemas = /* @__PURE__ */ new Map();
  register(entry) {
    this.schemas.set(entry.id, entry);
  }
  unregister(id) {
    this.schemas.delete(id);
  }
  list() {
    return [...this.schemas.values()];
  }
  healthCheck(options) {
    return createHealthCheck(this.list(), options);
  }
  handler(options) {
    return createHealthCheckHandler(
      Object.fromEntries([...this.schemas.entries()].map(([id, e]) => [id, e.schema])),
      options
    );
  }
};
var defaultSchemaRegistry = new SchemaRegistry();
function createSchemaRegistry() {
  return new SchemaRegistry();
}

// src/observability/observed-parse.ts
function resolveSchemaId(schema, schemaId) {
  if (schemaId) return schemaId;
  const meta = schema.getMeta?.();
  return meta?.["title"] ?? schema._def.typeName;
}
function recordObservability(schemaId, result) {
  const cfg = getObservabilityConfig();
  const metrics = cfg.metrics ?? defaultMetrics;
  const analytics = cfg.analytics ?? defaultAnalytics;
  const issues = result.success ? [] : result.error.issues;
  metrics.recordValidation(schemaId, result.success, issues);
  analytics.recordParse(schemaId, result.success, issues);
}
function observedSafeParse(schema, data, options = {}) {
  const cfg = getObservabilityConfig();
  const schemaId = resolveSchemaId(schema, options.schemaId ?? cfg.defaultSchemaId);
  const enabled = isObservabilityEnabled();
  const run = () => {
    const result = schema.safeParse(data);
    if (enabled) recordObservability(schemaId, result);
    return result;
  };
  if (!enabled || !cfg.tracer) {
    return run();
  }
  return withValidationSpan(
    cfg.tracer.getTracer(cfg.serviceName ?? "inputfy"),
    schemaId,
    run,
    options.attributes
  );
}
function observedParse(schema, data, options) {
  const result = observedSafeParse(schema, data, options);
  if (result.success) return result.data;
  throw result.error;
}
function createObservedSchema(schema, schemaId) {
  return new Proxy(schema, {
    get(target, prop, receiver) {
      if (prop === "safeParse") {
        return (data) => observedSafeParse(schema, data, { schemaId });
      }
      if (prop === "parse") {
        return (data) => observedParse(schema, data, { schemaId });
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

// src/inputfy.ts
function _string(params) {
  const schema = new InputFyString({ typeName: "InputFyString", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _number(params) {
  const schema = new InputFyNumber({ typeName: "InputFyNumber", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _boolean(params) {
  const schema = new InputFyBoolean({ typeName: "InputFyBoolean" });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _bigint(params) {
  const schema = new InputFyBigInt({ typeName: "InputFyBigInt", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _date(params) {
  const schema = new InputFyDate({ typeName: "InputFyDate", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
var coerce = {
  string: () => new InputFyString({ typeName: "InputFyString", checks: [], coerce: true }),
  number: () => new InputFyNumber({ typeName: "InputFyNumber", checks: [], coerce: true }),
  boolean: () => new InputFyBoolean({ typeName: "InputFyBoolean", coerce: true }),
  bigint: () => new InputFyBigInt({ typeName: "InputFyBigInt", checks: [], coerce: true }),
  date: () => new InputFyDate({ typeName: "InputFyDate", checks: [], coerce: true })
};
var v = {
  // Primitivos
  string: _string,
  number: _number,
  boolean: _boolean,
  bigint: _bigint,
  date: _date,
  symbol: () => InputFySymbol,
  undefined: () => InputFyUndefined,
  null: () => InputFyNull,
  void: () => InputFyVoid,
  any: () => new InputFyAny(),
  unknown: () => new InputFyUnknown(),
  never: () => new InputFyNever(),
  nan: () => new InputFyNaN(),
  // Atalhos numéricos
  int: () => _number().int(),
  int32: () => _number().int().min(-2147483648).max(2147483647),
  float32: () => _number(),
  float64: () => _number(),
  // Coerção
  coerce,
  // Complexos
  object,
  strictObject,
  looseObject,
  array,
  tuple,
  union,
  discriminatedUnion,
  intersection,
  record,
  map,
  set,
  lazy,
  promise,
  preprocess,
  pipeline,
  function: _function,
  // Literais e enums
  literal: (value) => new InputFyLiteral(value),
  enum: (values) => new InputFyEnum(values),
  nativeEnum: (enumObj) => new InputFyNativeEnum(enumObj),
  // Utilitários
  instanceof: (cls) => new InputFyInstanceof(cls),
  custom: (fn, message) => new InputFyCustom(fn, message),
  // Geração e interoperabilidade
  toJSONSchema,
  toOpenAPISchema,
  fromJSONSchema,
  codec,
  toOpenAPI,
  openAPIToJSON,
  openAPIToYAML,
  toGraphQLSDL,
  schemaToGraphQLTypeDef,
  // Validação avançada
  iso,
  ipv4,
  ipv6,
  cidrv4,
  cidrv6,
  hexColor,
  rgb,
  hsl,
  currency,
  file,
  when,
  crossField,
  crossFieldRules,
  contextual,
  envKey,
  // Erros e i18n
  config,
  setLocale,
  getLocale,
  formatErrorHTML,
  aggregateBySeverity,
  countBySeverity,
  issueCodeErrorMap,
  // Performance e escalabilidade
  compile,
  cachedCompile,
  cachedParse,
  createSchemaCache,
  validateNDJSON,
  validateNDJSONStream,
  parseNDJSONLine,
  createNDJSONValidator,
  createValidationWorkerPool,
  isWorkerThreadsAvailable,
  runBenchmark,
  formatBenchmarkTable,
  lazyRegistry: defaultLazyRegistry,
  createLazyRegistry,
  deferred,
  isCompilable,
  // Segurança reforçada
  securityConfig,
  configureSecurity,
  resetSecurityConfig,
  getSecurityConfig,
  sanitizeInput,
  detectSuspiciousPatterns,
  createRateLimiter,
  createAuditLog,
  defaultAuditLog,
  signSchema,
  inputfySchemaSignature,
  signedSchema,
  schemaFingerprint,
  analyzeRegex,
  assertSafeRegex,
  isRegexSafe,
  assertCSPFriendly,
  auditSchemaCSP,
  CSP_FRIENDLY,
  secureParse,
  secureParseAsync,
  createRefinementSandbox,
  // Developer Experience (DX)
  generate,
  generateMany,
  diffSchema,
  diffJSONSchema,
  formatSchemaDiff,
  migrateZodToInputFy,
  formatMigrationReport,
  metadataRegistry: defaultMetadataRegistry,
  createMetadataRegistry: () => new MetadataRegistry(),
  getSchemaMetadata,
  createPlaygroundHTML,
  writePlaygroundFile,
  // Tipos e TypeScript
  branded,
  withBrand,
  getBrandName,
  templateLiteral,
  templateLiteralFromParts,
  matchTemplateLiteral,
  deepPartial,
  deepRequired,
  versionedSchema,
  withSchemaVersion,
  getSchemaVersion,
  schemaInput,
  schemaOutput,
  strictSplit,
  parsePipelineInput,
  parsePipelineIntermediate,
  parsePipelineOutput,
  getPipelineSchemas,
  // Observabilidade
  observabilityConfig: configureObservability,
  configureObservability,
  getObservabilityConfig,
  resetObservabilityConfig,
  isObservabilityEnabled,
  withValidationSpan,
  createInMemoryTracerProvider,
  createValidationMetrics,
  createSchemaAnalytics,
  defaultMetrics,
  defaultAnalytics,
  defaultSchemaRegistry,
  createSchemaRegistry,
  createHealthCheck,
  createHealthCheckHandler,
  observedSafeParse,
  observedParse,
  createObservedSchema
};

// src/integrations/drizzle/index.ts
function inferDataType(col) {
  if (col.dataType) return col.dataType;
  const ct = (col.columnType ?? "").toLowerCase();
  if (ct.includes("int") || ct.includes("serial") || ct.includes("numeric")) return "number";
  if (ct.includes("bool")) return "boolean";
  if (ct.includes("timestamp") || ct.includes("date")) return "date";
  if (ct.includes("json")) return "json";
  if (ct.includes("bytea") || ct.includes("blob")) return "buffer";
  if (ct.includes("bigint")) return "bigint";
  return "string";
}
function columnToSchema(col, mode) {
  const dataType = inferDataType(col);
  let base;
  switch (dataType) {
    case "number":
      base = v.number();
      break;
    case "boolean":
      base = v.boolean();
      break;
    case "bigint":
      base = v.bigint();
      break;
    case "date":
      base = v.date();
      break;
    case "json":
      base = v.unknown();
      break;
    case "buffer":
      base = v.instanceof(Uint8Array);
      break;
    case "string":
    default:
      if (col.enumValues?.length) {
        base = v.enum(col.enumValues);
      } else {
        base = col.maxLength !== void 0 ? v.string().max(col.maxLength) : v.string();
      }
  }
  if (mode === "insert") {
    if (col.hasDefault || !col.notNull && !col.primary) {
      base = base.optional();
    }
  }
  if (mode === "update") {
    base = base.optional();
  }
  if (mode === "select" && !col.notNull) {
    base = base.nullable();
  }
  return base;
}
function fromDrizzleColumns(columns, options = {}) {
  const mode = options.mode ?? "select";
  const shape = /* @__PURE__ */ Object.create(null);
  for (const [key, col] of Object.entries(columns)) {
    shape[key] = columnToSchema({ ...col, name: col.name ?? key }, mode);
  }
  return v.object(shape);
}
function extractDrizzleColumns(table) {
  if (!table || typeof table !== "object") {
    throw new Error("Invalid Drizzle table");
  }
  const sym = /* @__PURE__ */ Symbol.for("drizzle:Columns");
  const internal = table;
  if (internal["_"] && typeof internal["_"] === "object") {
    const cols = internal["_"].columns;
    if (cols) return normalizeColumns(cols);
  }
  if (internal[sym]) return normalizeColumns(internal[sym]);
  const values = Object.values(internal).filter(
    (v2) => v2 && typeof v2 === "object" && "name" in v2
  );
  if (values.length > 0) {
    const map2 = /* @__PURE__ */ Object.create(null);
    for (const col of values) {
      map2[col.name] = col;
    }
    return map2;
  }
  throw new Error(
    "Could not extract Drizzle columns. Pass column map from getTableColumns(table) or install drizzle-orm."
  );
}
function normalizeColumns(raw) {
  const map2 = /* @__PURE__ */ Object.create(null);
  for (const [key, col] of Object.entries(raw)) {
    map2[key] = { ...col, name: col.name ?? key };
  }
  return map2;
}
function fromDrizzleTable(table, options = {}) {
  return fromDrizzleColumns(extractDrizzleColumns(table), options);
}
var createSelectSchema = (columns) => fromDrizzleColumns(columns, { mode: "select" });
var createInsertSchema = (columns) => fromDrizzleColumns(columns, { mode: "insert" });
var createUpdateSchema = (columns) => fromDrizzleColumns(columns, { mode: "update" });
async function fromDrizzleTableAsync(table, options = {}) {
  try {
    const drizzle = await import("drizzle-orm");
    if ("getTableColumns" in drizzle && typeof drizzle.getTableColumns === "function") {
      const columns = drizzle.getTableColumns(table);
      return fromDrizzleColumns(normalizeColumns(columns), options);
    }
  } catch {
  }
  return fromDrizzleTable(table, options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InputFyBadRequestException,
  InputFyDto,
  InputFyValidationPipe,
  TRPCInputFyError,
  createInputFyPipe,
  createInputFyValidator,
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  expressValidate,
  extractDrizzleColumns,
  fastifyValidate,
  formatValidationFailure,
  fromDrizzleColumns,
  fromDrizzleTable,
  fromDrizzleTableAsync,
  getInputFyDtoSchema,
  inputfyHookFormResolver,
  inputfyInput,
  inputfyMiddleware,
  inputfyProcedure,
  inputfyResolver,
  issuesToFieldErrors,
  koaValidate,
  parseIpcMessage,
  registerSecureIpcHandler,
  validate,
  validateDtoInstance,
  validateIpcHandler
});
