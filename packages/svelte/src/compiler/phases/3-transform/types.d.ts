import type { Scope } from '../scope.js';
import type { SvelteNode, ValidatedModuleCompileOptions } from '#compiler';
import type { Analysis } from '../types.js';
import type { Expression, Identifier } from 'estree';

export interface TransformState {
	readonly analysis: Analysis;
	readonly options: ValidatedModuleCompileOptions;
	readonly scope: Scope;
	readonly scopes: Map<SvelteNode, Scope>;
	/**
	 * A map of `[name, node]` pairs, where `Identifier` nodes matching `name`
	 * will be replaced with `node` (e.g. `x` -> `$.get(x)`)
	 */
	readonly getters: Record<string, Expression | ((id: Identifier) => Expression)>;
}
