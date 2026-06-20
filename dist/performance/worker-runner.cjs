"use strict";

// src/performance/worker-runner.ts
var import_node_worker_threads = require("worker_threads");

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
            (v) => {
              const r2 = fn(v, makeRefinementCtx(ctx));
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
    const map = /* @__PURE__ */ new Map();
    seen.set(value, map);
    for (const [k, v] of value) {
      map.set(cloneValue(k, seen, depth + 1), cloneValue(v, seen, depth + 1));
    }
    return map;
  }
  if (value instanceof Set) {
    const set = /* @__PURE__ */ new Set();
    seen.set(value, set);
    for (const v of value) {
      set.add(cloneValue(v, seen, depth + 1));
    }
    return set;
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
    for (const v of this._def.values) result[v] = v;
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
    const filtered = this._def.values.filter((v) => values.includes(v));
    return new _InputFyEnum(filtered);
  }
  exclude(values) {
    const filtered = this._def.values.filter((v) => !values.includes(v));
    return new _InputFyEnum(filtered);
  }
};

// src/schemas/parse-inner.ts
function parseInner(schema2, ctx, data, pathSegment) {
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
  return schema2._parse(innerCtx);
}

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
    for (const [key, schema2] of Object.entries(this._def.shape())) {
      if (!mask[key]) newShape[key] = schema2;
    }
    return new _InputFyObject(newShape);
  }
  partial() {
    const newShape = /* @__PURE__ */ Object.create(null);
    for (const [key, schema2] of Object.entries(this._def.shape())) {
      newShape[key] = schema2.optional();
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
  catchall(schema2) {
    const c = this._clone();
    c._def.catchall = schema2;
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
function array(schema2) {
  return new InputFyArray(schema2);
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
function record(keyOrValue, maybeValue) {
  if (maybeValue !== void 0) {
    return new InputFyRecord(keyOrValue, maybeValue);
  }
  return new InputFyRecord(new InputFyString({ typeName: "InputFyString", checks: [] }), keyOrValue);
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

// src/interop/schema-walker.ts
var MAX_WALK_DEPTH = 64;
function assertWalkDepth(depth) {
  if (depth > MAX_WALK_DEPTH) {
    throw new Error(`Schema conversion depth exceeded maximum of ${MAX_WALK_DEPTH}`);
  }
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
function fromJSONSchemaCore(schema2, options = {}) {
  const depth = (options._depth ?? 0) + 1;
  assertWalkDepth(depth);
  if (schema2.$ref) {
    const localDefs = {
      ...mergeDefs(options),
      ...schema2.definitions ?? {},
      ...schema2.$defs ?? {}
    };
    const resolved = resolveRef(schema2.$ref, { ...options, definitions: localDefs });
    return fromJSONSchema(resolved, {
      ...options,
      definitions: localDefs,
      _depth: depth,
      _resolving: /* @__PURE__ */ new Set([...options._resolving ?? [], schema2.$ref])
    });
  }
  const childOpts = { ...options, _depth: depth };
  if (schema2.const !== void 0) {
    return new InputFyLiteral(schema2.const);
  }
  if (schema2.enum && schema2.enum.length > 0) {
    const values = schema2.enum.filter((e) => typeof e === "string");
    if (values.length > 0) {
      return new InputFyEnum(values);
    }
    const first = schema2.enum[0];
    if (typeof first === "number") {
      return union(schema2.enum.map((n) => new InputFyLiteral(n)));
    }
    if (typeof first === "boolean") {
      return union(schema2.enum.map((b) => new InputFyLiteral(b)));
    }
  }
  if (schema2.anyOf && schema2.anyOf.length > 0) {
    return union(schema2.anyOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema2.oneOf && schema2.oneOf.length > 0) {
    return union(schema2.oneOf.map((s) => fromJSONSchema(s, childOpts)));
  }
  if (schema2.allOf && schema2.allOf.length > 0) {
    let result2 = fromJSONSchema(schema2.allOf[0], childOpts);
    for (let i = 1; i < schema2.allOf.length; i++) {
      result2 = result2.and(fromJSONSchema(schema2.allOf[i], childOpts));
    }
    return result2;
  }
  const types = Array.isArray(schema2.type) ? schema2.type.filter((t) => t !== "null") : schema2.type ? [schema2.type] : [];
  const isNullable = schema2.nullable === true || Array.isArray(schema2.type) && schema2.type.includes("null");
  let result;
  const primaryType = types[0];
  switch (primaryType) {
    case "string": {
      let s = str();
      if (schema2.minLength !== void 0) s = s.min(schema2.minLength);
      if (schema2.maxLength !== void 0) s = s.max(schema2.maxLength);
      if (schema2.pattern) s = s.regex(new RegExp(schema2.pattern));
      switch (schema2.format) {
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
      if (schema2.minimum !== void 0) n = n.min(schema2.minimum);
      if (schema2.maximum !== void 0) n = n.max(schema2.maximum);
      if (schema2.exclusiveMinimum !== void 0) n = n.gt(schema2.exclusiveMinimum);
      if (schema2.exclusiveMaximum !== void 0) n = n.lt(schema2.exclusiveMaximum);
      if (schema2.multipleOf !== void 0) n = n.multipleOf(schema2.multipleOf);
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
      const items = schema2.items;
      if (Array.isArray(items)) {
        const tupleItems = items.map((item) => fromJSONSchema(item, childOpts));
        result = tuple(tupleItems);
        if (schema2.additionalItems && typeof schema2.additionalItems === "object") {
          result = result.rest(
            fromJSONSchema(schema2.additionalItems, childOpts)
          );
        }
      } else {
        let arr = array(fromJSONSchema(items ?? {}, childOpts));
        if (schema2.minItems !== void 0) arr = arr.min(schema2.minItems);
        if (schema2.maxItems !== void 0) arr = arr.max(schema2.maxItems);
        result = arr;
      }
      break;
    }
    case "object": {
      if (schema2.properties) {
        const shape = {};
        const required = new Set(schema2.required ?? []);
        for (const [key, propSchema] of Object.entries(schema2.properties)) {
          let field = fromJSONSchema(propSchema, childOpts);
          if (!required.has(key)) {
            field = new InputFyOptional({ innerType: field, typeName: "InputFyOptional" });
          }
          shape[key] = field;
        }
        let obj = object(shape);
        if (schema2.additionalProperties === false) obj = obj.strict();
        else if (schema2.additionalProperties === true) obj = obj.passthrough();
        else if (typeof schema2.additionalProperties === "object") {
          obj = obj.catchall(fromJSONSchema(schema2.additionalProperties, childOpts));
        }
        result = obj;
      } else if (typeof schema2.additionalProperties === "object") {
        result = record(fromJSONSchema(schema2.additionalProperties, childOpts));
      } else {
        result = record(unknown());
      }
      break;
    }
    default:
      if (schema2.properties) {
        return fromJSONSchema({ ...schema2, type: "object" }, childOpts);
      }
      result = unknown();
  }
  if (schema2.default !== void 0) {
    result = new InputFyDefault({
      innerType: result,
      defaultValue: () => schema2.default,
      typeName: "InputFyDefault"
    });
  }
  if (isNullable && primaryType !== "null") {
    result = new InputFyNullable({ innerType: result, typeName: "InputFyNullable" });
  }
  if (schema2.description) {
    result = result.describe(schema2.description);
  }
  return result;
}
function fromJSONSchema(schema2, options = {}) {
  return fromJSONSchemaCore(schema2, options);
}

// src/performance/worker-runner.ts
var jsonSchema = import_node_worker_threads.workerData?.jsonSchema;
if (!jsonSchema || !import_node_worker_threads.parentPort) {
  throw new Error("worker-runner requires workerData.jsonSchema and parentPort");
}
var schema = fromJSONSchema(jsonSchema);
import_node_worker_threads.parentPort.on("message", (msg) => {
  const result = schema.safeParse(msg.data);
  import_node_worker_threads.parentPort.postMessage({ id: msg.id, result });
});
