#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports2) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports2.ALIAS = ALIAS;
    exports2.DOC = DOC;
    exports2.MAP = MAP;
    exports2.NODE_TYPE = NODE_TYPE;
    exports2.PAIR = PAIR;
    exports2.SCALAR = SCALAR;
    exports2.SEQ = SEQ;
    exports2.hasAnchor = hasAnchor;
    exports2.isAlias = isAlias;
    exports2.isCollection = isCollection;
    exports2.isDocument = isDocument;
    exports2.isMap = isMap;
    exports2.isNode = isNode;
    exports2.isPair = isPair;
    exports2.isScalar = isScalar;
    exports2.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports2.visit = visit;
    exports2.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports2.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports2.anchorIsValid = anchorIsValid;
    exports2.anchorNames = anchorNames;
    exports2.createNodeAnchors = createNodeAnchors;
    exports2.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports2) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports2.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v2, i) => toJS(v2, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports2.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports2) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports2.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (data?.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports2.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports2.Scalar = Scalar;
    exports2.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map2 = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map2.items.push(value);
        return map2;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports2.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v2 = value;
      for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v2;
          v2 = a;
        } else {
          v2 = /* @__PURE__ */ new Map([[k, v2]]);
        }
      }
      return createNode.createNode(v2, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports2.Collection = Collection;
    exports2.collectionFromPath = collectionFromPath;
    exports2.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports2) {
    "use strict";
    var stringifyComment = (str2) => str2.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str2, indent, comment) => str2.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str2.endsWith(" ") ? "" : " ") + comment;
    exports2.indentComment = indentComment;
    exports2.lineComment = lineComment;
    exports2.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports2) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports2.FOLD_BLOCK = FOLD_BLOCK;
    exports2.FOLD_FLOW = FOLD_FLOW;
    exports2.FOLD_QUOTED = FOLD_QUOTED;
    exports2.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str2) => /^(%|---|\.\.\.)/m.test(str2);
    function lineLengthOverLimit(str2, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str2.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str2[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str2 = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str2 += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str2 += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str2 += "\\0";
                    break;
                  case "0007":
                    str2 += "\\a";
                    break;
                  case "000b":
                    str2 += "\\v";
                    break;
                  case "001b":
                    str2 += "\\e";
                    break;
                  case "0085":
                    str2 += "\\N";
                    break;
                  case "00a0":
                    str2 += "\\_";
                    break;
                  case "2028":
                    str2 += "\\L";
                    break;
                  case "2029":
                    str2 += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str2 += "\\x" + code.substr(2);
                    else
                      str2 += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str2 += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str2 += "\n";
                  i += 2;
                }
                str2 += indent;
                if (json[i + 2] === " ")
                  str2 += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str2 = start ? str2 + json.slice(start) : json;
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str2 = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str2);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports2.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str2 = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str2;
      return identity.isScalar(node) || str2[0] === "{" || str2[0] === "[" ? `${props} ${str2}` : `${props}
${ctx.indent}${str2}`;
    }
    exports2.createStringifyContext = createStringifyContext;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str2 = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str2.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str2 === "" ? "?" : explicitKey ? `? ${str2}` : str2;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str2 = `? ${str2}`;
        if (keyComment && !keyCommentDone) {
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str2;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        str2 = `? ${str2}
${indent}:`;
      } else {
        str2 = `${str2}:`;
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str2.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str2 += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str2;
    }
    exports2.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports2) {
    "use strict";
    var node_process = require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports2.debug = debug;
    exports2.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map2, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map2, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map2, it);
      else
        mergeValue(ctx, map2, source);
    }
    function mergeValue(ctx, map2, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map2 instanceof Map) {
          if (!map2.has(key))
            map2.set(key, value2);
        } else if (map2 instanceof Set) {
          map2.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
          Object.defineProperty(map2, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map2;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports2.addMergeToJSMap = addMergeToJSMap;
    exports2.isMergeKey = isMergeKey;
    exports2.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports2) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map2, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map2, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map2, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map2 instanceof Map) {
          map2.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map2 instanceof Set) {
          map2.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map2)
            Object.defineProperty(map2, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map2[stringKey] = jsValue;
        }
      }
      return map2;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports2.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v2 = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v2);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports2.Pair = Pair;
    exports2.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str3 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str3 += stringifyComment.lineComment(str3, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str3);
      }
      let str2;
      if (lines.length === 0) {
        str2 = flowChars.start + flowChars.end;
      } else {
        str2 = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str2 += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str2 += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str2;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str2 = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str2.includes("\n"));
        if (i < items.length - 1) {
          str2 += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str2.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str2 += ",";
          }
        }
        if (comment)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment));
        lines.push(str2);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str2 = start;
          for (const line of lines)
            str2 += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str2}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports2.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports2) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map2 = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map2.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map2.items.sort(schema.sortMapEntries);
        }
        return map2;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map2 = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map2);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map2, item);
        return map2;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports2.YAMLMap = YAMLMap;
    exports2.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map2 = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map3, onError) {
        if (!identity.isMap(map3))
          onError("Expected a mapping for this tag");
        return map3;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports2.map = map2;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports2.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports2.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports2) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str2) => str2,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports2.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports2.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str2) => new Scalar.Scalar(str2[0] === "t" || str2[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports2.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports2) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num2 = typeof value === "number" ? value : Number(value);
      if (!isFinite(num2))
        return isNaN(num2) ? ".nan" : num2 < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports2.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str2) {
        const node = new Scalar.Scalar(parseFloat(str2));
        const dot = str2.indexOf(".");
        if (dot !== -1 && str2[str2.length - 1] === "0")
          node.minFractionDigits = str2.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str2, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports2) {
    "use strict";
    var map2 = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool2 = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map2.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool2.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var map2 = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str2) => str2,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str2) => str2 === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str2, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str2) => parseFloat(str2),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str2, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str2)}`);
        return str2;
      }
    };
    var schema = [map2.map, seq.seq].concat(jsonScalars, jsonError);
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports2) {
    "use strict";
    var node_buffer = require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str2 = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str2.length);
          for (let i = 0; i < str2.length; ++i)
            buffer[i] = str2.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str2;
        if (typeof node_buffer.Buffer === "function") {
          str2 = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str2 = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str2.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str2.substr(o, lineWidth);
          }
          str2 = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str2 }, ctx, onComment, onChompKeep);
      }
    };
    exports2.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports2.createPairs = createPairs;
    exports2.pairs = pairs;
    exports2.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map2 = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map2);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map2.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map2.set(key, value);
        }
        return map2;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports2.YAMLOMap = YAMLOMap;
    exports2.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports2.falseTag = falseTag;
    exports2.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2.replace(/_/g, "")),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str2) {
        const node = new Scalar.Scalar(parseFloat(str2.replace(/_/g, "")));
        const dot = str2.indexOf(".");
        if (dot !== -1) {
          const f = str2.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str2, offset, radix, { intAsBigInt }) {
      const sign = str2[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str2 = str2.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str2 = `0b${str2}`;
            break;
          case 8:
            str2 = `0o${str2}`;
            break;
          case 16:
            str2 = `0x${str2}`;
            break;
        }
        const n2 = BigInt(str2);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str2, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str2 = value.toString(radix);
        return value < 0 ? "-" + prefix + str2.substr(1) : prefix + str2;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intBin = intBin;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set3 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set3.items.push(Pair.createPair(value, null, ctx));
          }
        return set3;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set2 = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map2, onError) {
        if (identity.isMap(map2)) {
          if (map2.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map2);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map2;
      }
    };
    exports2.YAMLSet = YAMLSet;
    exports2.set = set2;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str2, asBigInt) {
      const sign = str2[0];
      const parts = sign === "-" || sign === "+" ? str2.substring(1) : str2;
      const num2 = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num2(60) + num2(p), num2(0));
      return sign === "-" ? num2(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num2 = (n) => n;
      if (typeof value === "bigint")
        num2 = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num2(-1);
      }
      const _60 = num2(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str2, _onError, { intAsBigInt }) => parseSexagesimal(str2, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str2) => parseSexagesimal(str2, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str2) {
        const match = str2.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports2.floatTime = floatTime;
    exports2.intTime = intTime;
    exports2.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports2) {
    "use strict";
    var map2 = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool2 = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set2 = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map2.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool2.trueTag,
      bool2.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set2.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports2) {
    "use strict";
    var map2 = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool2 = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set2 = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map2.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool2.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map2.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set2.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set2.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports2.coreKnownTags = coreKnownTags;
    exports2.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var map2 = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map2.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports2.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports2.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v2) => typeof v2 === "number" || v2 instanceof String || v2 instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v2 = this.createNode(value, null, options);
        return new Pair.Pair(k, v2);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports2.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports2) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError2 = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports2.YAMLError = YAMLError;
    exports2.YAMLParseError = YAMLParseError;
    exports2.YAMLWarning = YAMLWarning;
    exports2.prettifyError = prettifyError2;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports2) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports2.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports2) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports2.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports2) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports2.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports2.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports2) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map2 = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map2.comment)
                map2.comment += "\n" + keyProps.comment;
              else
                map2.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map2.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map2.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map2.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map2.range = [bm.offset, offset, commentEnd ?? offset];
      return map2;
    }
    exports2.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports2) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports2.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports2) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports2.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map2 = coll;
            if (utilMapIncludes.mapIncludes(ctx, map2.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map2.items.push(pair);
          } else {
            const map2 = new YAMLMap.YAMLMap(ctx.schema);
            map2.flow = true;
            map2.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map2.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map2);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports2.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports2.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports2.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports2.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports2.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports2) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports2.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports2.composeEmptyNode = composeEmptyNode;
    exports2.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports2) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports2.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports2.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports2) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports2.createScalarToken = createScalarToken;
    exports2.resolveAsScalar = resolveAsScalar;
    exports2.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports2) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports2) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports2.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports2) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports2.createScalarToken = cstScalar.createScalarToken;
    exports2.resolveAsScalar = cstScalar.resolveAsScalar;
    exports2.setScalarValue = cstScalar.setScalarValue;
    exports2.stringify = cstStringify.stringify;
    exports2.visit = cstVisit.visit;
    exports2.BOM = BOM;
    exports2.DOCUMENT = DOCUMENT;
    exports2.FLOW_END = FLOW_END;
    exports2.SCALAR = SCALAR;
    exports2.isCollection = isCollection;
    exports2.isScalar = isScalar;
    exports2.prettyToken = prettyToken;
    exports2.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports2) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports2.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports2) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports2.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map2 = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map2;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map2) {
        const it = map2.items[map2.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map2.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map2.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map2.indent)) {
                const prev = map2.items[map2.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map2.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map2.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map2.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map2.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map2.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map2.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map2.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map2);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map2.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map2 = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map2;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports2.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports2.parse = parse;
    exports2.parseAllDocuments = parseAllDocuments;
    exports2.parseDocument = parseDocument;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports2.Composer = composer.Composer;
    exports2.Document = Document.Document;
    exports2.Schema = Schema.Schema;
    exports2.YAMLError = errors.YAMLError;
    exports2.YAMLParseError = errors.YAMLParseError;
    exports2.YAMLWarning = errors.YAMLWarning;
    exports2.Alias = Alias.Alias;
    exports2.isAlias = identity.isAlias;
    exports2.isCollection = identity.isCollection;
    exports2.isDocument = identity.isDocument;
    exports2.isMap = identity.isMap;
    exports2.isNode = identity.isNode;
    exports2.isPair = identity.isPair;
    exports2.isScalar = identity.isScalar;
    exports2.isSeq = identity.isSeq;
    exports2.Pair = Pair.Pair;
    exports2.Scalar = Scalar.Scalar;
    exports2.YAMLMap = YAMLMap.YAMLMap;
    exports2.YAMLSeq = YAMLSeq.YAMLSeq;
    exports2.CST = cst;
    exports2.Lexer = lexer.Lexer;
    exports2.LineCounter = lineCounter.LineCounter;
    exports2.Parser = parser.Parser;
    exports2.parse = publicApi.parse;
    exports2.parseAllDocuments = publicApi.parseAllDocuments;
    exports2.parseDocument = publicApi.parseDocument;
    exports2.stringify = publicApi.stringify;
    exports2.visit = visit.visit;
    exports2.visitAsync = visit.visitAsync;
  }
});

// src/cli/index.ts
var import_promises = require("fs/promises");
var import_node_path2 = require("path");
var import_node_url2 = require("url");

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

// src/security/sandbox.ts
var RefinementSandboxError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RefinementSandboxError";
  }
};
function sandboxedRefinementSync(value, check, timeoutMs = 100) {
  const start = Date.now();
  const result = check(value);
  if (Date.now() - start > timeoutMs) {
    throw new RefinementSandboxError(`Refinement exceeded ${timeoutMs}ms`);
  }
  return result;
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
  const config2 = getGlobalConfig();
  if (config2.suggestions === false) return void 0;
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
  const config2 = getGlobalConfig();
  const fromParams = applyErrorMap(issue, ctx.common.contextualErrorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromParams) return fromParams;
  const fromGlobal = applyErrorMap(issue, config2.errorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromGlobal) return fromGlobal;
  const fromLocale = localeMessage(issue, suggestion);
  if (fromLocale) return fromLocale;
  if (suggestion) {
    const bundle = getLocaleBundle(config2.locale ?? "en");
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
var BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
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
var InputFyUnknown = class _InputFyUnknown extends InputFyType {
  _def = { typeName: "InputFyUnknown" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyUnknown();
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
function array(schema) {
  return new InputFyArray(schema);
}
function object(shape) {
  return new InputFyObject(shape);
}
function tuple(items) {
  return new InputFyTuple(items);
}
function union(options) {
  return new InputFyUnion(options);
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
function lazy(getter) {
  return new InputFyLazy(getter);
}
function promise(schema) {
  return new InputFyPromise(schema);
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
  const validate = (data) => {
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
    validate,
    validateAsync: (data) => schema.safeParseAsync(data)
  };
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

// src/performance/worker.ts
var import_node_url = require("url");
var import_node_path = require("path");

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
  <title>${escapeHtml(title)}</title>
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
  <header><h1>${escapeHtml(title)}</h1></header>
  <main>
    <section>
      <label for="schema">JSON Schema</label>
      <textarea id="schema">${escapeHtml(initialSchema)}</textarea>
    </section>
    <section>
      <label for="data">Dados JSON</label>
      <textarea id="data">${escapeHtml(initialData)}</textarea>
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
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

// src/cli/index.ts
var HELP = `
InputFy CLI \u2014 valida\xE7\xE3o de schemas

Usage:
  inputfy validate --schema <file> --data <file> [--format json|yaml]
  inputfy diff --left <file> --right <file>
  inputfy generate --schema <file> [--count N] [--seed N]
  inputfy migrate --input <file.ts> [--output <file.ts>]
  inputfy playground [--output playground.html]

Options:
  --schema, -s     JSON Schema file or .mjs module exporting schema
  --data, -d       JSON or YAML data file
  --left           Left schema (JSON Schema or module)
  --right          Right schema (JSON Schema or module)
  --input, -i      Source file for migrate
  --output, -o     Output file
  --count, -n      Number of samples (generate)
  --seed           RNG seed (generate)
  --format, -f     json | yaml (default: json)
  --help, -h       Show help
`;
function parseArgs(argv) {
  const flags = {};
  let cmd = "";
  const rest = argv.slice(2);
  if (rest[0] && !rest[0].startsWith("-")) {
    cmd = rest[0];
    rest.shift();
  }
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--help" || arg === "-h") {
      flags["help"] = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      const next = rest[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return { cmd, flags };
}
async function loadSchema(path) {
  const abs = (0, import_node_path2.resolve)(path);
  if (abs.endsWith(".json")) {
    const raw = JSON.parse(await (0, import_promises.readFile)(abs, "utf-8"));
    return fromJSONSchema(raw);
  }
  if (abs.endsWith(".mjs") || abs.endsWith(".js") || abs.endsWith(".ts")) {
    const mod = await import((0, import_node_url2.pathToFileURL)(abs).href);
    const schema = mod.default ?? mod.schema ?? mod.UserSchema;
    if (!schema?.safeParse) throw new Error(`Module ${path} must export a InputFy schema`);
    return schema;
  }
  throw new Error(`Unsupported schema format: ${path}`);
}
async function loadJSON(path) {
  const raw = await (0, import_promises.readFile)((0, import_node_path2.resolve)(path), "utf-8");
  if (path.endsWith(".yaml") || path.endsWith(".yml")) {
    const yaml = await Promise.resolve().then(() => __toESM(require_dist(), 1)).catch(() => null);
    if (!yaml) throw new Error("Install 'yaml' package for YAML support: npm install yaml");
    return yaml.parse(raw);
  }
  return JSON.parse(raw);
}
async function cmdValidate(flags) {
  const schemaPath = String(flags["schema"] ?? flags["s"] ?? "");
  const dataPath = String(flags["data"] ?? flags["d"] ?? "");
  if (!schemaPath || !dataPath) {
    console.error("Error: --schema and --data are required");
    return 1;
  }
  const schema = await loadSchema(schemaPath);
  const data = await loadJSON(dataPath);
  const result = schema.safeParse(data);
  if (result.success) {
    console.log("\u2713 Valid");
    console.log(JSON.stringify(result.data, null, 2));
    return 0;
  }
  console.error("\u2716 Invalid");
  for (const issue of result.error.issues) {
    const path = issue.path.length ? `[${issue.path.join(".")}] ` : "";
    console.error(`  ${path}${issue.message}`);
  }
  return 1;
}
async function cmdDiff(flags) {
  const leftPath = String(flags["left"] ?? "");
  const rightPath = String(flags["right"] ?? "");
  if (!leftPath || !rightPath) {
    console.error("Error: --left and --right are required");
    return 1;
  }
  const left = await loadSchema(leftPath);
  const right = await loadSchema(rightPath);
  const diff = diffSchema(left, right);
  console.log(formatSchemaDiff(diff));
  return diff.hasBreakingChanges ? 1 : 0;
}
async function cmdGenerate(flags) {
  const schemaPath = String(flags["schema"] ?? flags["s"] ?? "");
  if (!schemaPath) {
    console.error("Error: --schema is required");
    return 1;
  }
  const count = Number(flags["count"] ?? flags["n"] ?? 1);
  const seed = flags["seed"] ? Number(flags["seed"]) : void 0;
  const schema = await loadSchema(schemaPath);
  const samples = count > 1 ? generateMany(schema, count, { ...seed !== void 0 ? { seed } : {} }) : [generate(schema, { ...seed !== void 0 ? { seed } : {} })];
  console.log(JSON.stringify(count > 1 ? samples : samples[0], null, 2));
  return 0;
}
async function cmdMigrate(flags) {
  const input = String(flags["input"] ?? flags["i"] ?? "");
  if (!input) {
    console.error("Error: --input is required");
    return 1;
  }
  const source = await (0, import_promises.readFile)((0, import_node_path2.resolve)(input), "utf-8");
  const result = migrateZodToInputFy(source);
  const output = String(flags["output"] ?? flags["o"] ?? "");
  if (output) {
    await (0, import_promises.writeFile)((0, import_node_path2.resolve)(output), result.code, "utf-8");
    console.log(`Written: ${output}`);
  } else {
    console.log(result.code);
  }
  console.error(formatMigrationReport(result));
  return 0;
}
async function cmdPlayground(flags) {
  const output = String(flags["output"] ?? flags["o"] ?? "playground.html");
  const html = createPlaygroundHTML();
  await (0, import_promises.writeFile)((0, import_node_path2.resolve)(output), html, "utf-8");
  console.log(`Playground written to ${output}`);
  return 0;
}
async function main() {
  const { cmd, flags } = parseArgs(process.argv);
  if (flags["help"] || !cmd) {
    console.log(HELP);
    return 0;
  }
  switch (cmd) {
    case "validate":
      return cmdValidate(flags);
    case "diff":
      return cmdDiff(flags);
    case "generate":
      return cmdGenerate(flags);
    case "migrate":
      return cmdMigrate(flags);
    case "playground":
      return cmdPlayground(flags);
    default:
      console.error(`Unknown command: ${cmd}`);
      console.log(HELP);
      return 1;
  }
}
main().then((code) => process.exit(code)).catch((err) => {
  console.error(err);
  process.exit(1);
});
