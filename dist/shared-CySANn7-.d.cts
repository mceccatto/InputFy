import { I as InputFyError } from './errors-EOLUu52Y.cjs';

/** Converte issues em mapa aninhado de mensagens (react-hook-form, NestJS) */
declare function issuesToFieldErrors(issues: Array<{
    path: (string | number)[];
    message: string;
}>): Record<string, {
    type: string;
    message: string;
}>;
declare function formatValidationFailure(error: InputFyError): {
    statusCode: number;
    body: {
        error: string;
        issues: InputFyError["issues"];
        fieldErrors: Record<string, string[]>;
    };
};

export { formatValidationFailure as f, issuesToFieldErrors as i };
