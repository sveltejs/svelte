import type { Scope } from '../scope.js';
import type { AST, StateField, ValidatedModuleCompileOptions } from '#compiler';
import type { Analysis } from '../types.js';

export interface TransformState {
	readonly analysis: Analysis;
	readonly options: ValidatedModuleCompileOptions;
	readonly scope: Scope;
	readonly scopes: Map<AST.SvelteNode, Scope>;

	readonly state_fields: Map<string, StateField>;
}
