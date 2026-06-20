"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ecosystem/core/index.ts
var core_exports = {};
__export(core_exports, {
  CORE_ZERO_DEPENDENCIES: () => CORE_ZERO_DEPENDENCIES,
  DANGEROUS_KEYS: () => DANGEROUS_KEYS,
  InputFyArray: () => InputFyArray,
  InputFyBoolean: () => InputFyBoolean,
  InputFyEnum: () => InputFyEnum,
  InputFyError: () => InputFyError,
  InputFyFunction: () => InputFyFunction,
  InputFyLazy: () => InputFyLazy,
  InputFyLiteral: () => InputFyLiteral,
  InputFyNumber: () => InputFyNumber,
  InputFyObject: () => InputFyObject,
  InputFyPipeline: () => InputFyPipeline,
  InputFyString: () => InputFyString,
  InputFyTuple: () => InputFyTuple,
  InputFyType: () => InputFyType,
  InputFyUnion: () => InputFyUnion,
  MAX_ARRAY_LENGTH: () => MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS: () => MAX_OBJECT_KEYS,
  MAX_PARSE_DEPTH: () => MAX_PARSE_DEPTH,
  MAX_STRING_LENGTH: () => MAX_STRING_LENGTH,
  ZodError: () => InputFyError,
  default: () => core_default,
  flattenError: () => flattenError,
  prettifyError: () => prettifyError,
  treeifyError: () => treeifyError,
  v: () => v,
  z: () => z
});
module.exports = __toCommonJS(core_exports);

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
function flattenError(error) {
  return error.flatten();
}
function prettifyError(error) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `  \u2192 at ${issue.path.join(".")}` : "";
    return `\u2716 ${issue.message}${path ? `
${path}` : ""}`;
  }).join("\n");
}
function treeifyError(error) {
  const root = { errors: [] };
  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      root["errors"].push(issue.message);
      continue;
    }
    let current = root;
    for (let i = 0; i < issue.path.length; i++) {
      const segment = issue.path[i];
      const isLast = i === issue.path.length - 1;
      if (isLast) {
        const key = String(segment);
        if (typeof segment === "number") {
          if (!current["items"]) current["items"] = [];
          const items = current["items"];
          if (!items[segment]) items[segment] = { errors: [] };
          items[segment]["errors"].push(issue.message);
        } else {
          if (!current["properties"]) current["properties"] = {};
          const props = current["properties"];
          if (!props[key]) props[key] = { errors: [] };
          props[key]["errors"].push(issue.message);
        }
      } else {
        if (typeof segment === "number") {
          if (!current["items"]) current["items"] = [];
          const items = current["items"];
          if (!items[segment]) items[segment] = {};
          current = items[segment];
        } else {
          if (!current["properties"]) current["properties"] = {};
          const props = current["properties"];
          if (!props[segment]) props[segment] = {};
          current = props[segment];
        }
      }
    }
  }
  return root;
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
  const config = getGlobalConfig();
  if (config.suggestions === false) return void 0;
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
  const config = getGlobalConfig();
  const fromParams = applyErrorMap(issue, ctx.common.contextualErrorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromParams) return fromParams;
  const fromGlobal = applyErrorMap(issue, config.errorMap, {
    defaultError: fallback,
    data: ctx.data,
    suggestion
  });
  if (fromGlobal) return fromGlobal;
  const fromLocale = localeMessage(issue, suggestion);
  if (fromLocale) return fromLocale;
  if (suggestion) {
    const bundle = getLocaleBundle(config.locale ?? "en");
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
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
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
function parseBigIntInput(val) {
  if (typeof val === "bigint") return val;
  if (typeof val === "number" && Number.isInteger(val)) return BigInt(val);
  if (typeof val === "string" && val.trim() !== "") {
    try {
      return BigInt(val);
    } catch {
      return null;
    }
  }
  return null;
}
function parseDateInput(val) {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const date = new Date(val);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}
function getEnumValues(enumObj) {
  const values = Object.values(enumObj);
  const isNumericEnum = values.some((v2) => typeof v2 === "number");
  if (isNumericEnum) {
    return values.filter((v2) => typeof v2 === "number");
  }
  return values.filter((v2) => typeof v2 === "string");
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
var InputFyBigInt = class _InputFyBigInt extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyBigInt",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseBigIntInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
        return 0n;
      }
      data = coerced;
    }
    if (typeof data !== "bigint") {
      addIssue(ctx, { code: "invalid_type", expected: "bigint", received: ctx.parsedType });
      return 0n;
    }
    for (const check of this._def.checks) {
      if (!runBigIntCheck(data, check)) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value,
          maximum: check.value,
          inclusive: check.inclusive,
          type: "bigint",
          message: check.message
        });
      }
    }
    return data;
  }
  _clone() {
    return new _InputFyBigInt({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, inclusive: true, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, inclusive: true, message });
    return c;
  }
};
function runBigIntCheck(value, check) {
  if (check.kind === "min") return check.inclusive ? value >= check.value : value > check.value;
  return check.inclusive ? value <= check.value : value < check.value;
}
var InputFyDate = class _InputFyDate extends InputFyType {
  _def;
  constructor(def = {
    typeName: "InputFyDate",
    checks: []
  }) {
    super();
    this._def = { ...def, checks: def.checks ?? [] };
  }
  _parse(ctx) {
    let data = ctx.data;
    if (this._def.coerce) {
      const coerced = parseDateInput(data);
      if (coerced === null) {
        addIssue(ctx, { code: "invalid_date" });
        return /* @__PURE__ */ new Date(NaN);
      }
      data = coerced;
    }
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      addIssue(ctx, { code: "invalid_date" });
      return /* @__PURE__ */ new Date(NaN);
    }
    for (const check of this._def.checks) {
      const cmp = check.kind === "min" ? data >= check.value : data <= check.value;
      if (!cmp) {
        addIssue(ctx, {
          code: check.kind === "min" ? "too_small" : "too_big",
          minimum: check.value.getTime(),
          maximum: check.value.getTime(),
          inclusive: true,
          type: "date",
          message: check.message
        });
      }
    }
    return new Date(data.getTime());
  }
  _clone() {
    return new _InputFyDate({ ...this._def, checks: [...this._def.checks] });
  }
  min(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "min", value, message });
    return c;
  }
  max(value, message) {
    const c = this._clone();
    c._def.checks.push({ kind: "max", value, message });
    return c;
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
var InputFyAny = class _InputFyAny extends InputFyType {
  _def = { typeName: "InputFyAny" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyAny();
  }
};
var InputFyUnknown = class _InputFyUnknown extends InputFyType {
  _def = { typeName: "InputFyUnknown" };
  _parse(ctx) {
    return deepClone(ctx.data);
  }
  _clone() {
    return new _InputFyUnknown();
  }
};
var InputFyNever = class _InputFyNever extends InputFyType {
  _def = { typeName: "InputFyNever" };
  _parse(ctx) {
    addIssue(ctx, { code: "invalid_type", expected: "never", received: ctx.parsedType });
    return void 0;
  }
  _clone() {
    return new _InputFyNever();
  }
};
var InputFyVoid = class _InputFyVoid extends InputFyType {
  _def = { typeName: "InputFyVoid" };
  _parse(ctx) {
    if (ctx.data !== void 0) {
      addIssue(ctx, { code: "invalid_type", expected: "void", received: ctx.parsedType });
    }
  }
  _clone() {
    return new _InputFyVoid();
  }
};
var InputFyNaN = class _InputFyNaN extends InputFyType {
  _def = { typeName: "InputFyNaN" };
  _parse(ctx) {
    if (typeof ctx.data !== "number" || !Number.isNaN(ctx.data)) {
      addIssue(ctx, { code: "invalid_type", expected: "nan", received: ctx.parsedType });
      return NaN;
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNaN();
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
var InputFyNativeEnum = class _InputFyNativeEnum extends InputFyType {
  _def;
  constructor(enumObj) {
    super();
    this._def = { typeName: "InputFyNativeEnum", enum: enumObj };
  }
  _parse(ctx) {
    const values = getEnumValues(this._def.enum);
    if (typeof ctx.data !== "string" && typeof ctx.data !== "number" || !values.includes(ctx.data)) {
      addIssue(ctx, {
        code: "invalid_enum_value",
        options: values,
        received: ctx.data
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyNativeEnum(this._def.enum);
  }
};
var InputFyInstanceof = class _InputFyInstanceof extends InputFyType {
  _def;
  constructor(cls) {
    super();
    this._def = { typeName: "InputFyInstanceof", cls };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof this._def.cls)) {
      addIssue(ctx, {
        code: "invalid_type",
        expected: this._def.cls.name,
        received: ctx.parsedType
      });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyInstanceof(this._def.cls);
  }
};
var InputFyCustom = class _InputFyCustom extends InputFyType {
  _def;
  constructor(fn, message) {
    super();
    this._def = { typeName: "InputFyCustom", fn, message };
  }
  _parse(ctx) {
    if (!this._def.fn(ctx.data)) {
      addIssue(ctx, { code: "custom", message: this._def.message ?? "Invalid input" });
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyCustom(this._def.fn, this._def.message);
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
var InputFyDiscriminatedUnion = class _InputFyDiscriminatedUnion extends InputFyType {
  _def;
  constructor(discriminator, options) {
    super();
    this._def = { typeName: "InputFyDiscriminatedUnion", discriminator, options };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "object" || ctx.data === null) {
      addIssue(ctx, { code: "invalid_type", expected: "object", received: ctx.parsedType });
      return ctx.data;
    }
    const discriminatorValue = ctx.data[this._def.discriminator];
    const option = this._def.options.find((opt) => {
      const field = opt.shape[this._def.discriminator];
      if (!field || field._def.typeName !== "InputFyLiteral") return false;
      return field._def.value === discriminatorValue;
    });
    if (!option) {
      const values = this._def.options.map((opt) => {
        const field = opt.shape[this._def.discriminator];
        return field ? field._def.value : "";
      });
      addIssue(ctx, {
        code: "invalid_union_discriminator",
        options: values,
        message: `Invalid discriminator value. Expected ${values.map(String).join(" | ")}`
      });
      return ctx.data;
    }
    return parseInner(option, ctx);
  }
  _clone() {
    return new _InputFyDiscriminatedUnion(this._def.discriminator, this._def.options);
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
var InputFyMap = class _InputFyMap extends InputFyType {
  _def;
  constructor(keyType, valueType) {
    super();
    this._def = { typeName: "InputFyMap", keyType, valueType };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Map)) {
      addIssue(ctx, { code: "invalid_type", expected: "map", received: ctx.parsedType });
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    let index = 0;
    for (const [key, value] of ctx.data.entries()) {
      const parsedKey = parseInner(this._def.keyType, childContext(ctx, key, index));
      const parsedValue = parseInner(this._def.valueType, childContext(ctx, value, index));
      result.set(parsedKey, parsedValue);
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFyMap(this._def.keyType, this._def.valueType);
  }
};
var InputFySet = class _InputFySet extends InputFyType {
  _def;
  constructor(valueType, constraints = {}) {
    super();
    this._def = {
      typeName: "InputFySet",
      valueType,
      minSize: constraints.minSize ?? null,
      maxSize: constraints.maxSize ?? null
    };
  }
  _parse(ctx) {
    if (!(ctx.data instanceof Set)) {
      addIssue(ctx, { code: "invalid_type", expected: "set", received: ctx.parsedType });
      return /* @__PURE__ */ new Set();
    }
    const size = ctx.data.size;
    if (this._def.minSize !== null && size < this._def.minSize) {
      addIssue(ctx, { code: "too_small", minimum: this._def.minSize, inclusive: true, type: "set" });
    }
    if (this._def.maxSize !== null && size > this._def.maxSize) {
      addIssue(ctx, { code: "too_big", maximum: this._def.maxSize, inclusive: true, type: "set" });
    }
    const result = /* @__PURE__ */ new Set();
    let index = 0;
    for (const value of ctx.data.values()) {
      result.add(parseInner(this._def.valueType, childContext(ctx, value, index)));
      index++;
    }
    return result;
  }
  _clone() {
    return new _InputFySet(this._def.valueType, {
      minSize: this._def.minSize,
      maxSize: this._def.maxSize
    });
  }
  min(size) {
    const c = this._clone();
    c._def.minSize = size;
    return c;
  }
  max(size) {
    const c = this._clone();
    c._def.maxSize = size;
    return c;
  }
  size(size) {
    return this.min(size).max(size);
  }
  nonempty() {
    return this.min(1);
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
var InputFyFunction = class _InputFyFunction extends InputFyType {
  _def;
  constructor(args, returns) {
    super();
    this._def = {
      typeName: "InputFyFunction",
      args: args ?? new InputFyTuple([]),
      returns: returns ?? void 0
    };
  }
  _parse(ctx) {
    if (typeof ctx.data !== "function") {
      addIssue(ctx, { code: "invalid_type", expected: "function", received: ctx.parsedType });
      return (() => void 0);
    }
    return ctx.data;
  }
  _clone() {
    return new _InputFyFunction(this._def.args, this._def.returns);
  }
  args(args) {
    return new _InputFyFunction(args, this._def.returns);
  }
  returns(returns) {
    return new _InputFyFunction(this._def.args, returns);
  }
  implement(fn) {
    return ((...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = fn(...argsResult.data);
      const returnResult = this._def.returns.safeParse(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
  }
  implementAsync(fn) {
    return (async (...args) => {
      const argsResult = this._def.args.safeParse(args);
      if (!argsResult.success) {
        throw argsResult.error;
      }
      const result = await fn(...argsResult.data);
      const returnResult = await this._def.returns.safeParseAsync(result);
      if (!returnResult.success) {
        throw returnResult.error;
      }
      return returnResult.data;
    });
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
var InputFyPreprocess = class _InputFyPreprocess extends InputFyType {
  _def;
  constructor(preprocess2, schema) {
    super();
    this._def = { typeName: "InputFyPreprocess", preprocess: preprocess2, schema };
  }
  _parse(ctx) {
    const preprocessed = this._def.preprocess(ctx.data);
    return parseInner(this._def.schema, childContext(ctx, preprocessed));
  }
  _clone() {
    return new _InputFyPreprocess(this._def.preprocess, this._def.schema);
  }
};
function array(schema) {
  return new InputFyArray(schema);
}
function object(shape) {
  return new InputFyObject(shape);
}
function strictObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "strict" });
}
function looseObject(shape) {
  return new InputFyObject(shape, { unknownKeys: "passthrough" });
}
function tuple(items) {
  return new InputFyTuple(items);
}
function union(options) {
  return new InputFyUnion(options);
}
function discriminatedUnion(discriminator, options) {
  return new InputFyDiscriminatedUnion(discriminator, options);
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
function map(keyType, valueType) {
  return new InputFyMap(keyType, valueType);
}
function set(valueType) {
  return new InputFySet(valueType);
}
function lazy(getter) {
  return new InputFyLazy(getter);
}
function promise(schema) {
  return new InputFyPromise(schema);
}
function preprocess(preprocess2, schema) {
  return new InputFyPreprocess(preprocess2, schema);
}
function _function() {
  return new InputFyFunction();
}
function pipeline(inSchema, outSchema) {
  return new InputFyPipeline({ in: inSchema, out: outSchema, typeName: "InputFyPipeline" });
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

// src/ecosystem/core/index.ts
function _string(params) {
  const schema = new InputFyString({ typeName: "InputFyString", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _number(params) {
  const schema = new InputFyNumber({ typeName: "InputFyNumber", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _boolean(params) {
  const schema = new InputFyBoolean({ typeName: "InputFyBoolean" });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _bigint(params) {
  const schema = new InputFyBigInt({ typeName: "InputFyBigInt", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
function _date(params) {
  const schema = new InputFyDate({ typeName: "InputFyDate", checks: [] });
  if (params?.description) schema.describe(params.description);
  return schema;
}
var coerce = {
  string: () => new InputFyString({ typeName: "InputFyString", checks: [], coerce: true }),
  number: () => new InputFyNumber({ typeName: "InputFyNumber", checks: [], coerce: true }),
  boolean: () => new InputFyBoolean({ typeName: "InputFyBoolean", coerce: true }),
  bigint: () => new InputFyBigInt({ typeName: "InputFyBigInt", checks: [], coerce: true }),
  date: () => new InputFyDate({ typeName: "InputFyDate", checks: [], coerce: true })
};
var v = {
  string: _string,
  number: _number,
  boolean: _boolean,
  bigint: _bigint,
  date: _date,
  symbol: () => InputFySymbol,
  undefined: () => InputFyUndefined,
  null: () => InputFyNull,
  void: () => InputFyVoid,
  any: () => new InputFyAny(),
  unknown: () => new InputFyUnknown(),
  never: () => new InputFyNever(),
  nan: () => new InputFyNaN(),
  int: () => _number().int(),
  coerce,
  object,
  strictObject,
  looseObject,
  array,
  tuple,
  union,
  discriminatedUnion,
  intersection,
  record,
  map,
  set,
  lazy,
  promise,
  preprocess,
  pipeline,
  function: _function,
  literal: (value) => new InputFyLiteral(value),
  enum: (values) => new InputFyEnum(values),
  nativeEnum: (enumObj) => new InputFyNativeEnum(enumObj),
  instanceof: (cls) => new InputFyInstanceof(cls),
  custom: (fn, message) => new InputFyCustom(fn, message)
};
var z = v;
var core_default = v;
var CORE_ZERO_DEPENDENCIES = true;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CORE_ZERO_DEPENDENCIES,
  DANGEROUS_KEYS,
  InputFyArray,
  InputFyBoolean,
  InputFyEnum,
  InputFyError,
  InputFyFunction,
  InputFyLazy,
  InputFyLiteral,
  InputFyNumber,
  InputFyObject,
  InputFyPipeline,
  InputFyString,
  InputFyTuple,
  InputFyType,
  InputFyUnion,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_KEYS,
  MAX_PARSE_DEPTH,
  MAX_STRING_LENGTH,
  ZodError,
  flattenError,
  prettifyError,
  treeifyError,
  v,
  z
});
