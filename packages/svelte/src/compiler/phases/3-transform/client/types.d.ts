import type {
	ModuleDeclaration,
	Statement,
	LabeledStatement,
	Identifier,
	Expression,
	AssignmentExpression,
	UpdateExpression,
	VariableDeclaration
} from 'estree';
import type { AST, Namespace, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';
import type { Template } from './transform-template/template.js';
import type { Memoizer } from './visitors/shared/utils.js';

export interface ClientTransformState extends TransformState {
	/**
	 * `true` if the current lexical scope belongs to a class constructor. this allows
	 * us to rewrite `this.foo` as `this.#foo.value`
	 */
	readonly in_constructor: boolean;

	/**
	 * True if we're directly inside a `$derived(...)` expression (but not `$derived.by(...)`)
	 */
	readonly in_derived: boolean;

	/** `true` if we're transforming the contents of `<script>` */
	readonly is_instance: boolean;

	readonly transform: Record<
		string,
		{
			/** turn `foo` into e.g. `$.get(foo)` */
			read: (id: Identifier) => Expression;
			/** turn `foo = bar` into e.g. `$.set(foo, bar)` */
			assign?: (node: Identifier, value: Expression, proxy?: boolean) => Expression;
			/** turn `foo.bar = baz` into e.g. `$.mutate(foo, $.get(foo).bar = baz);` */
			mutate?: (node: Identifier, mutation: AssignmentExpression | UpdateExpression) => Expression;
			/** turn `foo++` into e.g. `$.update(foo)` */
			update?: (node: UpdateExpression) => Expression;
		}
	>;
}

export interface ComponentClientTransformState extends ClientTransformState {
	readonly analysis: ComponentAnalysis;
	readonly options: ValidatedCompileOptions;
	readonly hoisted: Array<Statement | ModuleDeclaration>;
	readonly events: Set<string>;
	readonly store_to_invalidate?: string;

	/** Stuff that happens before the render effect(s) */
	readonly init: Statement[];
	/** Stuff that happens inside the render effect */
	readonly update: Statement[];
	/** Stuff that happens after the render effect (control blocks, dynamic elements, bindings, actions, etc) */
	readonly after_update: Statement[];
	/** Memoized expressions */
	readonly memoizer: Memoizer;
	/** The HTML template string */
	readonly template: Template;
	readonly metadata: {
		namespace: Namespace;
		bound_contenteditable: boolean;
	};
	readonly preserve_whitespace: boolean;

	/** The anchor node for the current context */
	readonly node: Identifier;

	/** Imports that should be re-evaluated in legacy mode following a mutation */
	readonly legacy_reactive_imports: Statement[];

	/** The $: calls, which will be ordered in the end */
	readonly legacy_reactive_statements: Map<LabeledStatement, Statement>;

	/** Snippets hoisted to the instance */
	readonly instance_level_snippets: VariableDeclaration[];
	/** Snippets hoisted to the module */
	readonly module_level_snippets: VariableDeclaration[];
}

export type Context = import('zimmerframe').Context<AST.SvelteNode, ClientTransformState>;
export type Visitors = import('zimmerframe').Visitors<AST.SvelteNode, any>;

export type ComponentContext = import('zimmerframe').Context<
	AST.SvelteNode,
	ComponentClientTransformState
>;
export type ComponentVisitors = import('zimmerframe').Visitors<
	AST.SvelteNode,
	ComponentClientTransformState
>;
