import {
  v
} from "./chunk-WMHXMPTY.js";

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
    const map = /* @__PURE__ */ Object.create(null);
    for (const col of values) {
      map[col.name] = col;
    }
    return map;
  }
  throw new Error(
    "Could not extract Drizzle columns. Pass column map from getTableColumns(table) or install drizzle-orm."
  );
}
function normalizeColumns(raw) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const [key, col] of Object.entries(raw)) {
    map[key] = { ...col, name: col.name ?? key };
  }
  return map;
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

export {
  fromDrizzleColumns,
  extractDrizzleColumns,
  fromDrizzleTable,
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
  fromDrizzleTableAsync
};
