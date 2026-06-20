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

// src/integrations/nestjs/index.ts
var nestjs_exports = {};
__export(nestjs_exports, {
  InputFyBadRequestException: () => InputFyBadRequestException,
  InputFyDto: () => InputFyDto,
  InputFyValidationPipe: () => InputFyValidationPipe,
  createInputFyPipe: () => createInputFyPipe,
  getInputFyDtoSchema: () => getInputFyDtoSchema,
  validateDtoInstance: () => validateDtoInstance
});
module.exports = __toCommonJS(nestjs_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InputFyBadRequestException,
  InputFyDto,
  InputFyValidationPipe,
  createInputFyPipe,
  getInputFyDtoSchema,
  validateDtoInstance
});
