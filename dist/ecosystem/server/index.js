import {
  expressValidate,
  fastifyValidate,
  koaValidate,
  validate
} from "../../chunk-SQ3NQSL7.js";
import {
  cachedParse,
  compile,
  createHealthCheck,
  createHealthCheckHandler,
  createSchemaCache,
  observedParse,
  observedSafeParse,
  secureParse,
  secureParseAsync
} from "../../chunk-CTLNOXDZ.js";
import "../../chunk-5B6MYZKF.js";
import "../../chunk-PTOGCD6L.js";
import "../../chunk-NGXKC4QO.js";
import "../../chunk-WKU77X7G.js";
import "../../chunk-237IRJ4U.js";
import "../../chunk-E7G4F2VH.js";
import "../../chunk-GMXKR4ET.js";
import "../../chunk-MCKGQKYU.js";

// src/ecosystem/server/index.ts
function createServerValidator(schema, options = {}) {
  const schemaId = options.schemaId ?? "schema";
  const cache = options.useCache !== false ? createSchemaCache(options.cacheOptions) : null;
  let compiled;
  if (options.useCompile !== false) {
    try {
      compiled = compile(schema);
    } catch {
      compiled = void 0;
    }
  }
  const safeParse = (data) => {
    if (options.observe) {
      return observedSafeParse(schema, data, { schemaId });
    }
    if (options.secure) {
      const result = secureParse(schema, data);
      return result;
    }
    if (compiled) {
      return compiled.validate(data);
    }
    if (cache) {
      return cache.parse(schema, data);
    }
    return schema.safeParse(data);
  };
  return {
    ...compiled !== void 0 ? { compiled } : {},
    safeParse,
    parse(data) {
      const result = safeParse(data);
      if (result.success) return result.data;
      throw result.error;
    },
    async parseAsync(data) {
      if (options.secure) {
        const result = await secureParseAsync(schema, data);
        if (result.success) return result.data;
        throw result.error;
      }
      return schema.parseAsync(data);
    }
  };
}
export {
  cachedParse,
  compile,
  createHealthCheck,
  createHealthCheckHandler,
  createSchemaCache,
  createServerValidator,
  expressValidate,
  fastifyValidate,
  koaValidate,
  observedParse,
  observedSafeParse,
  secureParse,
  secureParseAsync,
  validate
};
