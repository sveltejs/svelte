import type { Scope } from '../scope.js';
import type { AST, StateFields, ValidatedModuleCompileOptions } from '#compiler';
import type { Analysis } from '../types.js';
import type { VariableDeclaration } from 'estree';

export interface TransformState {
	readonly analysis: Analysis;
	readonly options: ValidatedModuleCompileOptions;
	readonly scope: Scope;
	readonly scopes: Map<AST.SvelteNode, Scope>;

	readonly state_fields: StateFields;
	readonly computed_field_declarations: VariableDeclaration[] | null;
}
