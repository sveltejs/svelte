import type {
	Binding,
	Fragment,
	RegularElement,
	SvelteElement,
	SvelteNode,
	SvelteOptions
} from '#compiler';
import type { Identifier, LabeledStatement, Program } from 'estree';
import type Stylesheet from './2-analyze/css/Stylesheet.js';
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
	assignments: Set<Identifier>;
	dependencies: Set<Binding>;
}

export interface RawWarning {
	code: string;
	message: string;
	position: [number, number] | undefined;
}

/**
 * Analysis common to modules and components
 */
export interface Analysis {
	module: Js;
	name: string; // TODO should this be filename? it's used in `compileModule` as well as `compile`
	warnings: RawWarning[];
	runes: boolean;
	immutable: boolean;

	// TODO figure out if we can move this to ComponentAnalysis
	accessors: boolean;
}

export interface ComponentAnalysis extends Analysis {
	root: ScopeRoot;
	instance: Js;
	template: Template;
	stylesheet: Stylesheet;
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
	custom_element: boolean | SvelteOptions['customElement'];
	/** If `true`, should append styles through JavaScript */
	inject_styles: boolean;
	reactive_statements: Map<LabeledStatement, ReactiveStatement>;
	/** Identifiers that make up the `bind:group` expression -> internal group binding name */
	binding_groups: Map<Array<Binding | null>, Identifier>;
	slot_names: Set<string>;
}

declare module 'estree' {
	interface ArrowFunctionExpression {
		metadata: {
			hoistable: boolean | 'impossible';
			hoistable_params: Pattern[];
			scope: Scope;
		};
	}

	interface FunctionExpression {
		metadata: {
			hoistable: boolean | 'impossible';
			hoistable_params: Pattern[];
			scope: Scope;
		};
	}

	interface FunctionDeclaration {
		metadata: {
			hoistable: boolean | 'impossible';
			hoistable_params: Pattern[];
			scope: Scope;
		};
	}
}
