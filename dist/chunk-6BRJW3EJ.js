import {
  InputFyType,
  parseInner,
  readonly
} from "./chunk-NGXKC4QO.js";
import {
  InputFyError
} from "./chunk-WKU77X7G.js";
import {
  childContext
} from "./chunk-E7G4F2VH.js";

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

export {
  InputFyOptional,
  InputFyNullable,
  InputFyDefault,
  InputFyCatch,
  InputFyReadonly
};
