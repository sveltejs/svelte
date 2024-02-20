import type {
	Expression,
	Identifier,
	Statement,
	ModuleDeclaration,
	LabeledStatement
} from 'estree';
import type { SvelteNode, Namespace, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';

export type TemplateExpression = {
	type: 'expression';
	value: Expression;
	needs_escaping: boolean;
};

export type TemplateString = {
	type: 'string';
	value: string;
};

export type TemplateStatement = {
	type: 'statement';
	value: Statement;
};

export type Template = TemplateExpression | TemplateString | TemplateStatement;

export interface Anchor {
	type: 'Anchor';
	id: Identifier;
}

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
	readonly template: Template[];
	readonly metadata: {
		namespace: Namespace;
	};
	readonly preserve_whitespace: boolean;
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
