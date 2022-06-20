import { INode } from '../../../nodes/interfaces';
import { trim_end, trim_start } from '../../../../utils/trim';
import { link } from '../../../../utils/link';

// similar logic from `compile/render_dom/wrappers/Fragment`
// We want to remove trailing whitespace inside an element/component/block,
// *unless* there is no whitespace between this node and its next sibling
export default function remove_whitespace_children(children: INode[], next?: INode): INode[] {
	const nodes: INode[] = [];
	let last_child: INode;
	let i = children.length;
	while (i--) {
		const child = children[i];

		if (child.type === 'Text') {
			if (child.should_skip()) {
				continue;
			}

			let { data } = child;

			if (nodes.length === 0) {
				const should_trim = next
					? next.type === 'Text' &&
					  /^\s/.test(next.data) &&
					  trimmable_at(child, next)
					: !child.has_ancestor('EachBlock');

				if (should_trim && !child.keep_space()) {
					data = trim_end(data);
					if (!data) continue;
				}
			}

			// glue text nodes (which could e.g. be separated by comments) together
			if (last_child && last_child.type === 'Text') {
				last_child.data = data + last_child.data;
				continue;
			}

			nodes.unshift(child);
			link(last_child, last_child = child);
		} else {
			nodes.unshift(child);
			link(last_child, last_child = child);
		}
	}

	const first = nodes[0];
	if (first && first.type === 'Text' && !first.keep_space()) {
		first.data = trim_start(first.data);
		if (!first.data) {
			first.var = null;
			nodes.shift();

			if (nodes[0]) {
				nodes[0].prev = null;
			}
		}
	}

	return nodes;
}

function trimmable_at(child: INode, next_sibling: INode): boolean {
	// Whitespace is trimmable if one of the following is true:
	// The child and its sibling share a common nearest each block (not at an each block boundary)
	// The next sibling's previous node is an each block
	return (
		next_sibling.find_nearest(/EachBlock/) ===
			child.find_nearest(/EachBlock/) || next_sibling.prev.type === 'EachBlock'
	);
}
