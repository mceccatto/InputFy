import {
  InputFyError
} from "./chunk-WKU77X7G.js";

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

export {
  TRPCInputFyError,
  inputfyInput,
  createInputFyValidator,
  inputfyMiddleware,
  inputfyProcedure
};
