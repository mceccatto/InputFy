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

export {
  unwrapSchema,
  assertWalkDepth
};
