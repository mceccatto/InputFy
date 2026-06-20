import { k as InputFyIssue, j as IssueCode, c as IssueSeverity } from './errors-EOLUu52Y.js';

type LocaleCode = "en" | "pt-BR" | "pt-PT" | "es" | "es-MX" | "fr" | "de" | "it" | "ja" | "ko" | "zh-CN" | "zh-TW" | "ru" | "ar" | "hi" | "bn" | "tr" | "vi" | "pl" | "nl" | "sv" | "da" | "no" | "nb" | "fi" | "cs" | "sk" | "hu" | "ro" | "bg" | "hr" | "sr" | "sl" | "uk" | "el" | "he" | "th" | "id" | "ms" | "fa" | "ur" | "sw" | "af" | "ca" | "lt" | "lv" | "et" | "is" | "mk" | "sq" | "ka" | "az" | "kk" | "uz" | "mn" | "ne" | "ta" | "te" | "kn" | "ml" | "mr" | "gu" | "pa" | "am" | "yo" | "ig" | "ha" | "eu" | "gl";
type IssueMessageContext = {
    defaultError: string;
    data: unknown;
    suggestion?: string | undefined;
    locale: LocaleCode;
};
type IssueErrorMapFn = (issue: InputFyIssue, ctx: IssueMessageContext) => {
    message: string;
} | undefined;
/** Mapeamento fino por código de issue */
type IssueCodeErrorMap = Partial<Record<IssueCode, IssueErrorMapFn>>;
type ErrorMap = (issue: InputFyIssue, ctx: {
    defaultError: string;
    data: unknown;
}) => {
    message: string;
};
interface LocaleBundle {
    code: LocaleCode;
    name: string;
    /** Templates com placeholders {{expected}}, {{received}}, {{options}}, etc. */
    messages: Partial<Record<IssueCode, string>>;
    didYouMean?: string;
}
interface InputFyGlobalConfig {
    locale?: LocaleCode;
    /** Mapeamento global por código de issue (3.3) */
    errorMap?: IssueCodeErrorMap | ErrorMap;
    /** Severidade padrão para issues sem severidade explícita */
    defaultSeverity?: IssueSeverity;
    /** Incluir sugestões "Did you mean...?" em enums/unions */
    suggestions?: boolean;
}
interface HTMLReportOptions {
    classPrefix?: string;
    showSuggestions?: boolean;
    showSeverity?: boolean;
    title?: string;
}
interface SeverityGroups {
    errors: InputFyIssue[];
    warnings: InputFyIssue[];
    info: InputFyIssue[];
}

export type { ErrorMap as E, HTMLReportOptions as H, InputFyGlobalConfig as I, LocaleBundle as L, SeverityGroups as S, IssueCodeErrorMap as a, LocaleCode as b };
