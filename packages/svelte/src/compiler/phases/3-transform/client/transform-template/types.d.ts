import type { AST } from '#compiler';

export interface Element {
	type: 'element';
	name: string;
	attributes: Record<string, string | undefined>;
	children: Node[];
	is_html: boolean;
	/** used for populating __svelte_meta */
	start: number;
}

export interface Text {
	type: 'text';
	nodes: AST.Text[];
}

export interface Comment {
	type: 'comment';
	data: string | undefined;
}

export type Node = Element | Text | Comment;
