import type { Scope } from '../scope.js';
import type { ComponentAnalysis, ReactiveStatement } from '../types.js';
import type { AST, ExpressionMetadata, ValidatedCompileOptions } from '#compiler';

export interface AnalysisState {
	scope: Scope;
	scopes: Map<AST.SvelteNode, Scope>;
	analysis: ComponentAnalysis;
	options: ValidatedCompileOptions;
	ast_type: 'instance' | 'template' | 'module';
	/**
	 * Tag name of the parent element. `null` if the parent is `svelte:element`, `#snippet`, a component or the root.
	 * Parent doesn't necessarily mean direct path predecessor because there could be `#each`, `#if` etc in-between.
	 */
	parent_element: string | null;
	has_props_rune: boolean;
	/** Which slots the current parent component has */
	component_slots: Set<string>;
	/** Information about the current expression/directive/block value */
	expression: ExpressionMetadata | null;
	derived_state: { name: string; private: boolean }[];
	function_depth: number;

	// legacy stuff
	reactive_statement: null | ReactiveStatement;
}

export type Context<State extends AnalysisState = AnalysisState> = import('zimmerframe').Context<
	AST.SvelteNode,
	State
>;

export type Visitors<State extends AnalysisState = AnalysisState> = import('zimmerframe').Visitors<
	AST.SvelteNode,
	State
>;
