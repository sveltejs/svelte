import type {
	ModuleDeclaration,
	Statement,
	LabeledStatement,
	Identifier,
	PrivateIdentifier
} from 'estree';
import type { Namespace, SvelteNode, ValidatedCompileOptions } from '#compiler';
import type { TransformState } from '../types.js';
import type { ComponentAnalysis } from '../../types.js';

export interface ClientTransformState extends TransformState {
	readonly private_state: Map<string, StateField>;
	readonly public_state: Map<string, StateField>;

	/**
	 * `true` if the current lexical scope belongs to a class constructor. this allows
	 * us to rewrite `this.foo` as `this.#foo.value`
	 */
	readonly in_constructor: boolean;

	/** The $: calls, which will be ordered in the end */
	readonly legacy_reactive_statements: Map<LabeledStatement, Statement>;
}

export interface ComponentClientTransformState extends ClientTransformState {
	readonly analysis: ComponentAnalysis;
	readonly options: ValidatedCompileOptions;
	readonly hoisted: Array<Statement | ModuleDeclaration>;
	readonly events: Set<string>;

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
	readonly metadata: {
		namespace: Namespace;
		bound_contenteditable: boolean;
		/**
		 * Stuff that is set within the children of one `create_block` that is relevant
		 * to said `create_block`. Shouldn't be destructured or otherwise spread unless
		 * inside `create_block` to keep the object reference intact (it's also nested
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
}

export interface StateField {
	kind: 'state' | 'frozen_state' | 'derived' | 'derived_call';
	id: PrivateIdentifier;
}

export type Context = import('zimmerframe').Context<SvelteNode, ClientTransformState>;
export type Visitors = import('zimmerframe').Visitors<SvelteNode, ClientTransformState>;

export type ComponentContext = import('zimmerframe').Context<
	SvelteNode,
	ComponentClientTransformState
>;
export type ComponentVisitors = import('zimmerframe').Visitors<
	SvelteNode,
	ComponentClientTransformState
>;
