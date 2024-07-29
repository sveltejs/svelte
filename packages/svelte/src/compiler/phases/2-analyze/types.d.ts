import type { Scope } from '../scope.js';
import type { ComponentAnalysis, ReactiveStatement } from '../types.js';
import type {
	ClassDirective,
	ExpressionMetadata,
	ExpressionTag,
	OnDirective,
	RenderTag,
	SpreadAttribute,
	SvelteNode,
	ValidatedCompileOptions
} from '#compiler';
import type { LabeledStatement } from 'estree';

export interface AnalysisState {
	scope: Scope;
	analysis: ComponentAnalysis;
	options: ValidatedCompileOptions;
	ast_type: 'instance' | 'template' | 'module';
	parent_element: string | null;
	has_props_rune: boolean;
	/** Which slots the current parent component has */
	component_slots: Set<string>;
	/** Information about the current expression/directive/block value */
	expression: ExpressionMetadata | null;
	/** The current {@render ...} tag, if any */
	render_tag: null | RenderTag;
	private_derived_state: string[];
	function_depth: number;
}

export interface LegacyAnalysisState extends AnalysisState {
	instance_scope: Scope;
	reactive_statement: null | ReactiveStatement;
	reactive_statements: Map<LabeledStatement, ReactiveStatement>;
}

export type Context<State extends AnalysisState = AnalysisState> = import('zimmerframe').Context<
	SvelteNode,
	State
>;

export type Visitors<State extends AnalysisState = AnalysisState> = import('zimmerframe').Visitors<
	SvelteNode,
	State
>;
