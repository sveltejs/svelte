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