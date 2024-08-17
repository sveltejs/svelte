import type {
	ModuleDeclaration,
	Statement,
	LabeledStatement,
	Identifier,
	PrivateIdentifier,
	Expression,
	AssignmentExpression,
	UpdateExpression
} from 'estree';
import type { Namespace, SvelteNode, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';
import type { SourceLocation } from '#shared';

export interface ClientTransformState extends TransformState {
	readonly private_state: Map<string, StateField>;
	readonly public_state: Map<string, StateField>;

	/**
	 * `true` if the current lexical scope belongs to a class constructor. this allows
	 * us to rewrite `this.foo` as `this.#foo.value`
	 */
	readonly in_constructor: boolean;

	readonly transform: Record<
		string,
		{
			/** turn `foo` into e.g. `$.get(foo)` */
			read: (id: Identifier) => Expression;
			/** turn `foo = bar` into e.g. `$.set(foo, bar)` */
			assign?: (node: Identifier, value: Expression) => Expression;
			/** turn `foo.bar = baz` into e.g. `$.mutate(foo, $.get(foo).bar = baz);` */
			mutate?: (node: Identifier, mutation: AssignmentExpression) => Expression;
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
	readonly is_instance: boolean;

	/** Stuff that happens before the render effect(s) */
	readonly before_init: Statement[];
	/** Stuff that happens before the render effect(s) */
	readonly init: Statement[];
	/** Stuff that happens inside the render effect */
	readonly update: Statement[];
	/** Stuff that happens after the render effect (control blocks, dynamic elements, bindings, actions, etc) */
	readonly after_update: Statement[];
	/** The HTML template string */
	readonly template: string[];
	readonly locations: SourceLocation[];
	readonly metadata: {
		namespace: Namespace;
		bound_contenteditable: boolean;
		/**
		 * Stuff that is set within the children of one `Fragment` visitor that is relevant
		 * to said fragment. Shouldn't be destructured or otherwise spread unless inside the
		 * `Fragment` visitor to keep the object reference intact (it's also nested
		 * within `metadata` for this reason).
		 */
		context: {
			/** `true` if the HTML template needs to be instantiated with `importNode` */
			template_needs_import_node: boolean;
			/**
			 * `true` if HTML template contains a `<script>` tag. In this case we need to invoke a special
			 * template instantiation function (see `create_fragment_with_script_from_html` for more info)
			 */
			template_contains_script_tag: boolean;
		};
	};
	readonly preserve_whitespace: boolean;

	/** The anchor node for the current context */
	readonly node: Identifier;

	/** Imports that should be re-evaluated in legacy mode following a mutation */
	readonly legacy_reactive_imports: Statement[];

	/** The $: calls, which will be ordered in the end */
	readonly legacy_reactive_statements: Map<LabeledStatement, Statement>;
}

export interface StateField {
	kind: 'state' | 'raw_state' | 'linked_state' | 'derived' | 'derived_by';
	id: PrivateIdentifier;
}

export type Context = import('zimmerframe').Context<SvelteNode, ClientTransformState>;
export type Visitors = import('zimmerframe').Visitors<SvelteNode, any>;

export type ComponentContext = import('zimmerframe').Context<
	SvelteNode,
	ComponentClientTransformState
>;
export type ComponentVisitors = import('zimmerframe').Visitors<
	SvelteNode,
	ComponentClientTransformState
>;
