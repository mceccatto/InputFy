import { b as LocaleCode, L as LocaleBundle } from './types-Ds4_A0AI.js';

declare function getLocaleBundle(code: LocaleCode): LocaleBundle;
declare function listLocales(): LocaleBundle[];
declare function registerLocale(bundle: LocaleBundle): void;
declare function getLocaleCodes(): LocaleCode[];

export { getLocaleCodes as a, getLocaleBundle as g, listLocales as l, registerLocale as r };
