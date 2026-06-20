import { I as InputFyError, c as IssueSeverity } from './errors-EOLUu52Y.js';
import { H as HTMLReportOptions, S as SeverityGroups } from './types-Ds4_A0AI.js';

/** Relatório HTML pronto para formulários web (3.4) */
declare function formatErrorHTML(error: InputFyError, options?: HTMLReportOptions): string;

declare function aggregateBySeverity(error: InputFyError): SeverityGroups;
declare function countBySeverity(error: InputFyError): Record<IssueSeverity, number>;

export { aggregateBySeverity as a, countBySeverity as c, formatErrorHTML as f };
