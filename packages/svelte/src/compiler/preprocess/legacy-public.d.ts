import {
	MarkupPreprocessor as M,
	Preprocessor as PP,
	PreprocessorGroup as PG,
	Processed as P,
	SveltePreprocessor as S
} from './public.js';

/** @deprecated import this from 'svelte/preprocess' instead */
export type MarkupPreprocessor = M;
/** @deprecated import this from 'svelte/preprocess' instead */
export type Preprocessor = PP;
/** @deprecated import this from 'svelte/preprocess' instead */
export type PreprocessorGroup = PG;
/** @deprecated import this from 'svelte/preprocess' instead */
export type Processed = P;
/** @deprecated import this from 'svelte/preprocess' instead */
export type SveltePreprocessor<PreprocessorType extends keyof PG, Options = any> = S<
	PreprocessorType,
	Options
>;
