import type { AST } from '#compiler';

export interface Element {
	type: 'element';
	name: string;
	attributes: Record<string, string | undefined>;
	children: Node[];
}

export interface Text {
	type: 'text';
	nodes: AST.Text[];
}

export interface Anchor {
	type: 'anchor';
	data: string | undefined;
}

export type Node = Element | Text | Anchor;
