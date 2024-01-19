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
	readonly init: Statement[];
	/** Stuff that happens inside separate render effects (due to call expressions) */
	readonly update_effects: Statement[];
	/** Stuff that happens inside the render effect */
	readonly update: {
		init?: Statement;
		/** If the update array only contains a single entry, this singular entry will be used, if present */
		singular?: Statement;
		/** Used if condition for singular prop is false (see comment above) */
		grouped: Statement;
	}[];
	/** Stuff that happens after the render effect (control blocks, dynamic elements, bindings, actions, etc) */
	readonly after_update: Statement[];
	/** The HTML template string */
	readonly template: string[];
	readonly metadata: {
		namespace: Namespace;
		/** `true` if the HTML template needs to be instantiated with `importNode` */
		template_needs_import_node: boolean;
		bound_contenteditable: boolean;
	};
	readonly preserve_whitespace: boolean;

	/** The anchor node for the current context */
	readonly node: Identifier;
}

export interface StateField {
	kind: 'state' | 'frozen_state' | 'derived';
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
