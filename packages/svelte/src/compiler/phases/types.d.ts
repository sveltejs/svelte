import type { AST, Binding } from '#compiler';
import type { Identifier, LabeledStatement, Node, Program } from 'estree';
import type { Scope, ScopeRoot } from './scope.js';

export interface Js {
	ast: Program;
	scope: Scope;
	scopes: Map<AST.SvelteNode, Scope>;
}

export interface Template {
	ast: AST.Fragment;
	scope: Scope;
	scopes: Map<AST.SvelteNode, Scope>;
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
	tracing: boolean;

	// TODO figure out if we can move this to ComponentAnalysis
	accessors: boolean;
}

export interface ComponentAnalysis extends Analysis {
	root: ScopeRoot;
	instance: Js;
	template: Template;
	/** Used for CSS pruning and scoping */
	elements: Array<AST.RegularElement | AST.SvelteElement>;
	runes: boolean;
	tracing: boolean;
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
	event_directive_node: AST.OnDirective | null;
	/** true if uses event attributes (onclick) on a DOM element */
	uses_event_attributes: boolean;
	/**
	 * Contains the content of `<svelte:options customElement={...} />`,
	 * or if not present a boolean which corresponds to the compiler option value
	 */
	custom_element: boolean | AST.SvelteOptions['customElement'];
	/** If `true`, should append styles through JavaScript */
	inject_styles: boolean;
	reactive_statements: Map<LabeledStatement, ReactiveStatement>;
	/** Identifiers that make up the `bind:group` expression -> internal group binding name */
	binding_groups: Map<[key: string, bindings: Array<Binding | null>], Identifier>;
	slot_names: Map<string, AST.SlotElement>;
	css: {
		ast: AST.CSS.StyleSheet | null;
		hash: string;
		keyframes: string[];
	};
	source: string;
	undefined_exports: Map<string, Node>;
	/**
	 * Every render tag/component, and whether it could be definitively resolved or not
	 */
	snippet_renderers: Map<
		AST.RenderTag | AST.Component | AST.SvelteComponent | AST.SvelteSelf,
		boolean
	>;
	/**
	 * Every snippet that is declared locally
	 */
	snippets: Set<AST.SnippetBlock>;
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
