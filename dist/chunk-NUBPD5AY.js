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

export {
  InputFyBadRequestException,
  InputFyValidationPipe,
  createInputFyPipe,
  InputFyDto,
  getInputFyDtoSchema,
  validateDtoInstance
};
