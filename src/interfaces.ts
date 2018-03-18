import {SourceMap} from 'magic-string';

export interface Node {
	start: number;
	end: number;
	type: string;
	[propName: string]: any;
}

export interface Parser {
	readonly template: string;
	readonly filename?: string;

	index: number;
	stack: Array<Node>;

	html: Node;
	css: Node;
	js: Node;
	metaTags: {};
}

export interface Parsed {
	hash: number;
	html: Node;
	css: Node;
	js: Node;
}

export interface Warning {
	loc?: { line: number; column: number; pos?: number };
	end?: { line: number; column: number; };
	pos?: number;
	message: string;
	filename?: string;
	frame?: string;
	toString: () => string;
}

export type ModuleFormat = 'es' | 'amd' | 'cjs' | 'iife' | 'umd' | 'eval';

export interface CompileOptions {
	format?: ModuleFormat;
	name?: string;
	filename?: string;
	generate?: string;
	globals?: ((id: string) => string) | object;
	amd?: {
		id?: string;
	};

	outputFilename?: string;
	cssOutputFilename?: string;

	dev?: boolean;
	immutable?: boolean;
	shared?: boolean | string;
	cascade?: boolean;
	hydratable?: boolean;
	legacy?: boolean;
	customElement?: CustomElementOptions | true;
	css?: boolean;
	store?: boolean;

	onerror?: (error: Error) => void;
	onwarn?: (warning: Warning) => void;
}

export interface GenerateOptions {
	name: string;
	format: ModuleFormat;
	banner?: string;
	sharedPath?: string;
	helpers?: { name: string, alias: string }[];
}

export interface Visitor {
	enter: (node: Node) => void;
	leave?: (node: Node) => void;
}

export interface CustomElementOptions {
	tag?: string;
	props?: string[];
}

export interface PreprocessOptions {
	markup?: (options: {content: string, filename: string}) => { code: string, map?: SourceMap | string };
	style?: Preprocessor;
	script?: Preprocessor;
	filename?: string
}

export type Preprocessor = (options: {content: string, attributes: Record<string, string | boolean>, filename?: string}) => { code: string, map?: SourceMap | string };
