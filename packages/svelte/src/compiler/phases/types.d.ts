import type {
	Binding,
	Css,
	Fragment,
	OnDirective,
	RegularElement,
	SlotElement,
	SvelteElement,
	SvelteNode,
	SvelteOptions
} from '#compiler';
import type { Identifier, LabeledStatement, Program, VariableDeclaration } from 'estree';
import type { Scope, ScopeRoot } from './scope.js';

export interface Js {
	ast: Program;
	scope: Scope;
	scopes: Map<SvelteNode, Scope>;
}

export interface Template {
	ast: Fragment;
	scope: Scope;
	scopes: Map<SvelteNode, Scope>;
}

export interface ReactiveStatement {
	assignments: Set<Binding>;
	dependencies: Binding[];
}

/**
 * Analysis common to modules and components
 */
export interface Analysis {
	module: Js;
	name: string; // TODO should this be filename? it's used in `compileModule` as well as `compile`
	runes: boolean;
	immutable: boolean;

	// TODO figure out if we can move this to ComponentAnalysis
	accessors: boolean;
}

export interface ComponentAnalysis extends Analysis {
	root: ScopeRoot;
	instance: Js;
	template: Template;
	elements: Array<RegularElement | SvelteElement>;
	runes: boolean;
	exports: Array<{ name: string; alias: string | null }>;
	/** Whether the component uses `$$props` */
	uses_props: boolean;
	/** Whether the component uses `$$restProps` */
	uses_rest_props: boolean;
	/** Whether the component uses `$$slots` */
	uses_slots: boolean;
	uses_component_bindings: boolean;
	uses_render_tags: boolean;
	needs_context: boolean;
	needs_props: boolean;
	/** Set to the first event directive (on:x) found on a DOM element in the code */
	event_directive_node: OnDirective | null;
	/** true if uses event attributes (onclick) on a DOM element */
	uses_event_attributes: boolean;
	custom_element: boolean | SvelteOptions['customElement'];
	/** If `true`, should append styles through JavaScript */
	inject_styles: boolean;
	reactive_statements: Map<LabeledStatement, ReactiveStatement>;
	top_level_snippets: VariableDeclaration[];
	/** Identifiers that make up the `bind:group` expression -> internal group binding name */
	binding_groups: Map<[key: string, bindings: Array<Binding | null>], Identifier>;
	slot_names: Map<string, SlotElement>;
	css: {
		ast: Css.StyleSheet | null;
		hash: string;
		keyframes: string[];
	};
	source: string;
}

declare module 'estree' {
	interface ArrowFunctionExpression {
		metadata: {
			hoisted: boolean;
			hoisted_params: Pattern[];
			scope: Scope;
		};
	}

	interface FunctionExpression {
		metadata: {
			hoisted: boolean;
			hoisted_params: Pattern[];
			scope: Scope;
		};
	}

	interface FunctionDeclaration {
		metadata: {
			hoisted: boolean;
			hoisted_params: Pattern[];
			scope: Scope;
		};
	}
}
