import { I as InputFyError, k as InputFyIssue, b as InputFyTypeAny } from '../../errors-EOLUu52Y.cjs';
import { FieldValues, ResolverResult } from '../../integrations/react-hook-form/index.cjs';
export { InputFyResolverOptions, inputfyHookFormResolver, inputfyResolver } from '../../integrations/react-hook-form/index.cjs';
export { i as issuesToFieldErrors } from '../../shared-CySANn7-.cjs';
export { H as HTMLReportOptions, S as SeverityGroups } from '../../types-URGDvyHZ.cjs';
import { f as formatErrorHTML } from '../../severity-C1YH4EOu.cjs';
export { a as aggregateBySeverity, c as countBySeverity } from '../../severity-C1YH4EOu.cjs';

interface FormFieldError {
    type: string;
    message: string;
}
type FormFieldErrors = Record<string, FormFieldError>;
/** Converte InputFyError em mapa de erros por campo para formulários */
declare function errorToFormFields(error: InputFyError): FormFieldErrors;
/** Converte issues em estrutura aninhada para UI */
declare function issuesToNestedFormErrors(issues: InputFyIssue[]): Record<string, unknown>;
/** Agrupa erros por severidade para exibição em formulários */
declare function groupFormErrorsByField(error: InputFyError): Record<string, string[]>;
/** Verifica se formulário tem erros em campo específico */
declare function hasFieldError(fields: FormFieldErrors, path: string): boolean;
/** Primeira mensagem de erro de um campo */
declare function getFieldErrorMessage(fields: FormFieldErrors, path: string): string | undefined;

/** Cria resolver + mapeamento de erros para formulários web */
declare function createFormValidator<T extends InputFyTypeAny>(schema: T): {
    resolver: (values: FieldValues) => Promise<ResolverResult<T["_output"]>>;
    mapErrors: typeof errorToFormFields;
    formatHTML: typeof formatErrorHTML;
};

export { FieldValues, type FormFieldError, type FormFieldErrors, ResolverResult, createFormValidator, errorToFormFields, formatErrorHTML, getFieldErrorMessage, groupFormErrorsByField, hasFieldError, issuesToNestedFormErrors };
