import type { Scope } from '../scope.js';
import type { Binding, SvelteNode, ValidatedModuleCompileOptions } from '#compiler';
import type { Analysis } from '../types.js';
import type { Expression, Identifier } from 'estree';

export interface TransformState {
	readonly analysis: Analysis;
	readonly options: ValidatedModuleCompileOptions;
	readonly scope: Scope;
	readonly scopes: Map<SvelteNode, Scope>;
	readonly getters: Map<Binding, Expression | ((id: Identifier) => Expression)>;
}
