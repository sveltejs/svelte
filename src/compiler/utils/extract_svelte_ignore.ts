import { TemplateNode } from '../interfaces';
import { flatten } from './flatten';

const pattern = /^\s*svelte-ignore\s+([\s\S]+)\s*$/m;

export function extract_svelte_ignore(text: string): string[] {
	const match = pattern.exec(text);
	return match ? match[1].split(/[^\S]/).map(x => x.trim()).filter(Boolean) : [];
}

export function extract_svelte_ignore_from_comments<Node extends { leadingComments?: Array<{value: string}> }>(node: Node): string[] {
	return flatten((node.leadingComments || []).map(comment => extract_svelte_ignore(comment.value)));
}

export function extract_ignores_above_position(position: number, template_nodes: TemplateNode[]): string[] {
	const previous_node_idx = template_nodes.findIndex(child => child.end === position);
	if (previous_node_idx === -1) {
		return [];
	}

	for (let i = previous_node_idx; i >= 0; i--) {
		const node = template_nodes[i];
		if (node.type !== 'Comment' && node.type !== 'Text') {
			return [];
		}
		if (node.type === 'Comment') {
			if (node.ignores.length) {
				return node.ignores;
			}
		}
	}

	return [];
}
