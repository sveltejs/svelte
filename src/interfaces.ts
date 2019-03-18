export interface Node {
	start: number;
	end: number;
	type: string;
	[prop_name: string]: any;
}

export interface Parser {
	readonly template: string;
	readonly filename?: string;

	index: number;
	stack: Array<Node>;

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
	end?: { line: number; column: number; };
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

	preserveComments?: boolean | false;
}

export interface Visitor {
	enter: (node: Node) => void;
	leave?: (node: Node) => void;
}

export interface AppendTarget {
	slots: Record<string, string>;
	slot_stack: string[]
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
}