export { g as getLocaleBundle, a as getLocaleCodes, l as listLocales, r as registerLocale } from '../registry-CjuJUZWD.cjs';
import { j as IssueCode } from '../errors-EOLUu52Y.cjs';
import { L as LocaleBundle, b as LocaleCode } from '../types-URGDvyHZ.cjs';

/** Templates base em inglês — referência para todos os locales */
declare const EN_MESSAGES: Record<IssueCode, string>;
declare const EN_BUNDLE: LocaleBundle;
declare function createLocaleBundle(code: LocaleCode, name: string, messages: Partial<Record<IssueCode, string>>, didYouMean?: string): LocaleBundle;

export { EN_BUNDLE, EN_MESSAGES, LocaleBundle, LocaleCode, createLocaleBundle };
