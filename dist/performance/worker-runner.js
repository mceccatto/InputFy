import {
  fromJSONSchema
} from "../chunk-ITLS53EZ.js";
import "../chunk-6BRJW3EJ.js";
import "../chunk-PTOGCD6L.js";
import "../chunk-NGXKC4QO.js";
import "../chunk-WKU77X7G.js";
import "../chunk-E7G4F2VH.js";
import "../chunk-GMXKR4ET.js";
import "../chunk-MCKGQKYU.js";

// src/performance/worker-runner.ts
import { parentPort, workerData } from "worker_threads";
var jsonSchema = workerData?.jsonSchema;
if (!jsonSchema || !parentPort) {
  throw new Error("worker-runner requires workerData.jsonSchema and parentPort");
}
var schema = fromJSONSchema(jsonSchema);
parentPort.on("message", (msg) => {
  const result = schema.safeParse(msg.data);
  parentPort.postMessage({ id: msg.id, result });
});
