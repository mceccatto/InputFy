import {
  issuesToFieldErrors
} from "./chunk-237IRJ4U.js";

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

export {
  inputfyResolver,
  inputfyHookFormResolver
};
