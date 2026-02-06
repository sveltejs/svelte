import type {
	Expression,
	Statement,
	ModuleDeclaration,
	LabeledStatement,
	Identifier
} from 'estree';
import type { AST, Namespace, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';

export interface ServerTransformState extends TransformState {
	/** The $: calls, which will be ordered in the end */
	readonly legacy_reactive_statements: Map<LabeledStatement, Statement>;
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
	/** True if the current node is a) a component or render tag and b) the sole child of a block  */
	readonly is_standalone: boolean;
	/** Transformed async `{@const }` declarations (if any) and those coming after them */
	async_consts?: {
		id: Identifier;
		thunks: Expression[];
	};
}

export type Context = import('zimmerframe').Context<AST.SvelteNode, ServerTransformState>;
export type Visitors = import('zimmerframe').Visitors<AST.SvelteNode, ServerTransformState>;

export type ComponentContext = import('zimmerframe').Context<
	AST.SvelteNode,
	ComponentServerTransformState
>;
export type ComponentVisitors = import('zimmerframe').Visitors<
	AST.SvelteNode,
	ComponentServerTransformState
>;
