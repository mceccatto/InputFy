#!/usr/bin/env node
import "../chunk-RK4IDJKA.js";
import {
  createPlaygroundHTML,
  diffSchema,
  formatMigrationReport,
  formatSchemaDiff,
  generate,
  generateMany,
  migrateZodToInputFy
} from "../chunk-WMHXMPTY.js";
import "../chunk-LI67AHCX.js";
import {
  fromJSONSchema
} from "../chunk-ITLS53EZ.js";
import "../chunk-R3MKK6PJ.js";
import "../chunk-6BRJW3EJ.js";
import "../chunk-QF4SUL76.js";
import "../chunk-CTLNOXDZ.js";
import "../chunk-5B6MYZKF.js";
import "../chunk-PTOGCD6L.js";
import "../chunk-NGXKC4QO.js";
import "../chunk-WKU77X7G.js";
import "../chunk-E7G4F2VH.js";
import "../chunk-GMXKR4ET.js";
import "../chunk-MCKGQKYU.js";

// src/cli/index.ts
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";
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
  const abs = resolve(path);
  if (abs.endsWith(".json")) {
    const raw = JSON.parse(await readFile(abs, "utf-8"));
    return fromJSONSchema(raw);
  }
  if (abs.endsWith(".mjs") || abs.endsWith(".js") || abs.endsWith(".ts")) {
    const mod = await import(pathToFileURL(abs).href);
    const schema = mod.default ?? mod.schema ?? mod.UserSchema;
    if (!schema?.safeParse) throw new Error(`Module ${path} must export a InputFy schema`);
    return schema;
  }
  throw new Error(`Unsupported schema format: ${path}`);
}
async function loadJSON(path) {
  const raw = await readFile(resolve(path), "utf-8");
  if (path.endsWith(".yaml") || path.endsWith(".yml")) {
    const yaml = await import("../dist-SUVINOTG.js").catch(() => null);
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
  const source = await readFile(resolve(input), "utf-8");
  const result = migrateZodToInputFy(source);
  const output = String(flags["output"] ?? flags["o"] ?? "");
  if (output) {
    await writeFile(resolve(output), result.code, "utf-8");
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
  await writeFile(resolve(output), html, "utf-8");
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
