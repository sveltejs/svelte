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
	pos?: number;
	message: string;
	filename?: string;
	frame?: string;
	toString: () => string;
}

export interface CompileOptions {
	format?: string;
	name?: string;
	filename?: string;
	generate?: string;

	outputFilename?: string;
	cssOutputFilename?: string;

	dev?: boolean;
	shared?: boolean | string;
	cascade?: boolean;
	hydratable?: boolean;

	onerror?: (error: Error) => void;
	onwarn?: (warning: Warning) => void;
}
