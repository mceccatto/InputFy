import { I as InputFyError, b as InputFyTypeAny } from '../../errors-EOLUu52Y.js';

declare class InputFyBadRequestException extends Error {
    readonly statusCode = 400;
    readonly response: Record<string, unknown>;
    constructor(error: InputFyError);
}
interface PipeTransform<T = unknown> {
    transform(value: unknown, metadata?: InputFyPipeMetadata): T;
}
interface InputFyPipeMetadata {
    type?: "body" | "query" | "param" | "custom";
    data?: string;
}
interface InputFyValidationPipeOptions {
    /** Lançar InputFyBadRequestException em falha (default: true) */
    throwOnError?: boolean;
    /** Retorna valor bruto se undefined/null e schema optional no topo */
    skipMissing?: boolean;
}
/** Pipe de validação estilo NestJS ValidationPipe (7.4) */
declare class InputFyValidationPipe<T extends InputFyTypeAny = InputFyTypeAny> implements PipeTransform<T["_output"]> {
    private readonly schema;
    private readonly options;
    constructor(schema: T, options?: InputFyValidationPipeOptions);
    transform(value: unknown, _metadata?: InputFyPipeMetadata): T["_output"];
}
declare function createInputFyPipe<T extends InputFyTypeAny>(schema: T, options?: InputFyValidationPipeOptions): InputFyValidationPipe<T>;
declare function InputFyDto<T extends InputFyTypeAny>(schema: T): (target: object) => object;
declare function getInputFyDtoSchema(target: object): InputFyTypeAny | undefined;
/** Valida instância de classe DTO decorada com @InputFyDto */
declare function validateDtoInstance<T extends object>(instance: T): T;

export { InputFyBadRequestException, InputFyDto, type InputFyPipeMetadata, InputFyValidationPipe, type InputFyValidationPipeOptions, type PipeTransform, createInputFyPipe, getInputFyDtoSchema, validateDtoInstance };
