interface BaseNode {
	start: number;
	end: number;
	type: string;
	children?: Node[];
	[prop_name: string]: any;
}

export interface Text extends BaseNode {
	type: 'Text';
	data: string;
}

export interface MustacheTag extends BaseNode {
	type: 'MustacheTag';
	expression: Node;
}

export type DirectiveType = 'Action'
| 'Animation'
| 'Binding'
| 'Class'
| 'EventHandler'
| 'Let'
| 'Ref'
| 'Transition';

interface BaseDirective extends BaseNode {
	type: DirectiveType;
	expression: null|Node;
	name: string;
	modifiers: string[];
}

export interface Transition extends BaseDirective{
	type: 'Transition';
	intro: boolean;
	outro: boolean;
}

export type Directive = BaseDirective | Transition;

export type Node = Text
| MustacheTag
| BaseNode
| Directive
| Transition;

export interface Parser {
	readonly template: string;
	readonly filename?: string;

	index: number;
	stack: Node[];

	html: Node;
	css: Node;
	js: Node;
	meta_tags: {};
}

export interface Ast {
	html: Node;
	css: Node;
	instance: Node;
	module: Node;
}

export interface Warning {
	start?: { line: number; column: number; pos?: number };
	end?: { line: number; column: number };
	pos?: number;
	code: string;
	message: string;
	filename?: string;
	frame?: string;
	toString: () => string;
}

export type ModuleFormat = 'esm' | 'cjs';

export interface CompileOptions {
	format?: ModuleFormat;
	name?: string;
	filename?: string;
	generate?: string | false;

	outputFilename?: string;
	cssOutputFilename?: string;
	sveltePath?: string;

	dev?: boolean;
	accessors?: boolean;
	immutable?: boolean;
	hydratable?: boolean;
	legacy?: boolean;
	customElement?: boolean;
	tag?: string;
	css?: boolean;

	preserveComments?: boolean;
	preserveWhitespace?: boolean;
}

export interface ParserOptions {
	filename?: string;
	customElement?: boolean;
}

export interface Visitor {
	enter: (node: Node) => void;
	leave?: (node: Node) => void;
}

export interface AppendTarget {
	slots: Record<string, string>;
	slot_stack: string[];
}

export interface Var {
	name: string;
	export_name?: string; // the `bar` in `export { foo as bar }`
	injected?: boolean;
	module?: boolean;
	mutated?: boolean;
	reassigned?: boolean;
	referenced?: boolean;
	writable?: boolean;

	// used internally, but not exposed
	global?: boolean;
	internal?: boolean; // event handlers, bindings
	initialised?: boolean;
	hoistable?: boolean;
	subscribable?: boolean;
	is_reactive_dependency?: boolean;
}