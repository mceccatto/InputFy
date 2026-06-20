import {
  sanitizeInput
} from "./chunk-5B6MYZKF.js";
import {
  formatValidationFailure
} from "./chunk-237IRJ4U.js";

// src/integrations/electron/index.ts
function validateIpcHandler(channel, schema, handler, options = {}) {
  const sanitize = options.sanitize !== false;
  const replyOnError = options.replyOnError !== false;
  const errorChannel = options.errorChannel ?? `${channel}:error`;
  return async (event, rawData) => {
    let payload = rawData;
    if (sanitize) payload = sanitizeInput(payload);
    const result = schema.safeParse(payload);
    if (!result.success) {
      if (replyOnError) {
        const failure = formatValidationFailure(result.error);
        event.reply(errorChannel, failure.body);
      }
      return;
    }
    await handler(event, result.data);
  };
}
function registerSecureIpcHandler(ipcMain, channel, schema, handler, options) {
  const wrapped = validateIpcHandler(channel, schema, handler, options);
  const mode = options?.mode ?? "handle";
  if (mode === "handle") {
    ipcMain.handle(channel, (event, ...args) => wrapped(event, args[0]));
  } else {
    ipcMain.on(channel, (event, ...args) => {
      void wrapped(event, args[0]);
    });
  }
}
function parseIpcMessage(schema, rawData, options = {}) {
  let payload = rawData;
  if (options.sanitize !== false) payload = sanitizeInput(payload);
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: formatValidationFailure(result.error) };
}

export {
  validateIpcHandler,
  registerSecureIpcHandler,
  parseIpcMessage
};
