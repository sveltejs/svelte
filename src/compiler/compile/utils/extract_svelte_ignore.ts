import { flatten } from "./flatten";

const pattern = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

export function extract_svelte_ignore(text: string): string[] {
	const match = pattern.exec(text);
	return match ? match[1].split(/[^\S]/).map(x => x.trim()).filter(Boolean) : [];
}

export function extract_svelte_ignore_from_comments<Node extends { leadingComments?: Array<{value: string}> }>(node: Node): string[] {
	return flatten((node.leadingComments || []).map(comment => extract_svelte_ignore(comment.value)));
}
