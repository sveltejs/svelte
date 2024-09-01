import type { Expression, Statement, ModuleDeclaration, LabeledStatement } from 'estree';
import type { Namespace, SvelteNode, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';
import type { StateField } from '../client/types.js';

export interface ServerTransformState extends TransformState {
	/** The $: calls, which will be ordered in the end */
	readonly legacy_reactive_statements: Map<LabeledStatement, Statement>;
	readonly private_derived: Map<string, StateField>;
}

export interface ComponentServerTransformState extends ServerTransformState {
	readonly analysis: ComponentAnalysis;
	readonly options: ValidatedCompileOptions;

	readonly init: Statement[];

	readonly hoisted: Array<Statement | ModuleDeclaration>;

	/** The SSR template  */
	readonly template: Array<Statement | Expression>;
	readonly namespace: Namespace;
	readonly preserve_whitespace: boolean;
	readonly skip_hydration_boundaries: boolean;
}

export type Context = import('zimmerframe').Context<SvelteNode, ServerTransformState>;
export type Visitors = import('zimmerframe').Visitors<SvelteNode, ServerTransformState>;

export type ComponentContext = import('zimmerframe').Context<
	SvelteNode,
	ComponentServerTransformState
>;
export type ComponentVisitors = import('zimmerframe').Visitors<
	SvelteNode,
	ComponentServerTransformState
>;
