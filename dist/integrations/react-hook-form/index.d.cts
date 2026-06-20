import { b as InputFyTypeAny } from '../../errors-EOLUu52Y.cjs';

type FieldValues = Record<string, unknown>;
interface ResolverSuccess<T> {
    values: T;
    errors: Record<string, never>;
}
interface ResolverFailure {
    values: Record<string, never>;
    errors: Record<string, {
        type: string;
        message: string;
    }>;
}
type ResolverResult<T> = ResolverSuccess<T> | ResolverFailure;
interface InputFyResolverOptions {
    /** Modo async mesmo para schemas síncronos (default: false) */
    async?: boolean;
    /** Modo raw — não strip unknown keys (default: false, usa parse normal) */
    raw?: boolean;
}
/** Resolver para react-hook-form (7.2) — drop-in similar ao zodResolver */
declare function inputfyResolver<T extends InputFyTypeAny>(schema: T, _options?: InputFyResolverOptions): (values: FieldValues) => Promise<ResolverResult<T["_output"]>>;
/** Alias compatível com convenção @hookform/resolvers */
declare const inputfyHookFormResolver: typeof inputfyResolver;

export { type FieldValues, type InputFyResolverOptions, type ResolverFailure, type ResolverResult, type ResolverSuccess, inputfyHookFormResolver, inputfyResolver };
