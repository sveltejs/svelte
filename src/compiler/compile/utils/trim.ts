import { INode } from '../nodes/interfaces';
import TextNode from '../nodes/Text';
import Wrapper from '../render_dom/wrappers/shared/Wrapper';
import TextWrapper from '../render_dom/wrappers/Text';
import { trim_end, trim_start } from '../../utils/trim';
import { link } from '../../utils/link';

function trimmable_at(child: INode, next_sibling: INode): boolean {
	// Whitespace is trimmable if one of the following is true:
	// The child and its sibling share a common nearest each block (not at an each block boundary)
	// The next sibling's previous node is an each block
	return (
		next_sibling.find_nearest(/EachBlock/) === child.find_nearest(/EachBlock/) ||
		next_sibling.prev.type === 'EachBlock'
	);
}

export function trim_text_node(
	node: TextNode,
	nodes: INode[] | Wrapper[],
	next: INode | Wrapper
): string {
	let { data } = node;
	const next_node =
		next && (next as TextWrapper).node ? (next as TextWrapper).node : (next as TextNode);
	// We want to remove trailing whitespace inside an element/component/block,
	// *unless* there is no whitespace between this node and its next sibling
	if (nodes.length === 0) {
		const should_trim = next_node
			? next_node.type === 'Text' && /^\s/.test(node.data) && trimmable_at(node, next_node)
			: !node.has_ancestor('EachBlock');
		if (should_trim && !node.keep_space()) {
			data = trim_end(data);
		}
	}
	return data;
}

export function trim_first_text_node(nodes: INode[] | Wrapper[]): void {
	// bail early if there's no first node
	if (!nodes[0]) return;
	// determine whether we're handling a node or a wrapper
	const first = (nodes[0] as TextWrapper).node ? (nodes[0] as TextWrapper) : (nodes[0] as TextNode);
	const first_node = (first as TextWrapper).node
		? (first as TextWrapper).node
		: (first as TextNode);
	// check if the (derived) node requires trimming
	if (first_node.type === 'Text' && !first_node.keep_space()) {
		// mutate the original data accordingly
		first.data = trim_start(first.data);
		if (!first.data) {
			first.var = null;
			nodes.shift();
			if (nodes[0]) {
				nodes[0].prev = null;
			}
		}
	}
}

// a simplified version of the iterative logic in `compile/render_dom/wrappers/Fragment`
// for use in ssr handlers
export function trim_text_nodes(nodes: INode[], next: INode): INode[] {
	const trimmed_nodes: INode[] = [];
	let last_child: INode;
	let i = nodes.length;

	while (i--) {
		const child = nodes[i];

		if (child.type === 'Text') {
			if (child.should_skip()) continue;

			const data = trim_text_node(child, trimmed_nodes, next);
			if (!data) continue;

			// glue text nodes (which could e.g. be separated by comments) together
			if (last_child && last_child.type === 'Text') {
				last_child.data = data + last_child.data;
				continue;
			}
		}

		trimmed_nodes.unshift(child);
		link(last_child, (last_child = child));
	}

	trim_first_text_node(trimmed_nodes);

	return trimmed_nodes;
}
