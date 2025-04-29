import type { Scope } from '../scope.js';
import type { AST, ValidatedModuleCompileOptions } from '#compiler';
import type { Analysis } from '../types.js';
import type { StateCreationRuneName } from '../../../utils.js';
import type { PrivateIdentifier } from 'estree';

export interface TransformState {
	readonly analysis: Analysis;
	readonly options: ValidatedModuleCompileOptions;
	readonly scope: Scope;
	readonly scopes: Map<AST.SvelteNode, Scope>;
}

export interface StateField {
	kind: StateCreationRuneName;
	id: PrivateIdentifier;
}
