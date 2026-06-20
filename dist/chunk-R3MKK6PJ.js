import {
  InputFyCatch,
  InputFyDefault,
  InputFyNullable,
  InputFyOptional,
  InputFyReadonly
} from "./chunk-6BRJW3EJ.js";
import {
  InputFyPipeline,
  InputFyType,
  array,
  intersection,
  promise,
  union
} from "./chunk-NGXKC4QO.js";

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
