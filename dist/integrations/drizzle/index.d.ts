import { as as v } from '../../inputfy-aGR7NXWa.js';
import '../../errors-EOLUu52Y.js';
import '../../complex-D98V5XLF.js';
import '../../observed-parse-DpCYABpo.js';
import '../../types-Ds4_A0AI.js';
import 'node:stream';
import '../../severity-l3NCENDj.js';

type DrizzleDataType = "string" | "number" | "boolean" | "date" | "bigint" | "json" | "buffer" | "custom";
/** Metadados de coluna Drizzle (compatível com getTableColumns) */
interface DrizzleColumnMeta {
    name: string;
    notNull?: boolean;
    hasDefault?: boolean;
    primary?: boolean;
    dataType?: DrizzleDataType;
    columnType?: string;
    enumValues?: readonly string[];
    maxLength?: number;
}
type DrizzleColumnMap = Record<string, DrizzleColumnMeta>;
type DrizzleSchemaMode = "select" | "insert" | "update";
interface FromDrizzleOptions {
    mode?: DrizzleSchemaMode;
}
/** Cria schema InputFy a partir de mapa de colunas Drizzle (7.6) */
declare function fromDrizzleColumns(columns: DrizzleColumnMap, options?: FromDrizzleOptions): ReturnType<typeof v.object>;
/** Extrai colunas de tabela Drizzle via duck-typing ou getTableColumns */
declare function extractDrizzleColumns(table: unknown): DrizzleColumnMap;
/** Inferir schema de tabela Drizzle ORM */
declare function fromDrizzleTable(table: unknown, options?: FromDrizzleOptions): ReturnType<typeof v.object>;
declare const createSelectSchema: (columns: DrizzleColumnMap) => ReturnType<typeof v.object>;
declare const createInsertSchema: (columns: DrizzleColumnMap) => ReturnType<typeof v.object>;
declare const createUpdateSchema: (columns: DrizzleColumnMap) => ReturnType<typeof v.object>;
/** Integração opcional com drizzle-orm getTableColumns */
declare function fromDrizzleTableAsync(table: unknown, options?: FromDrizzleOptions): Promise<ReturnType<typeof v.object>>;

export { type DrizzleColumnMap, type DrizzleColumnMeta, type DrizzleDataType, type DrizzleSchemaMode, type FromDrizzleOptions, createInsertSchema, createSelectSchema, createUpdateSchema, extractDrizzleColumns, fromDrizzleColumns, fromDrizzleTable, fromDrizzleTableAsync };
