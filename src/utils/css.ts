import { Node } from '../interfaces';

export function groupSelectors(selector: Node) {
	let block = {
		global: selector.children[0].type === 'PseudoClassSelector' && selector.children[0].name === 'global',
		selectors: [],
		combinator: null
	};

	const blocks = [block];

	selector.children.forEach((child: Node, i: number) => {
		if (child.type === 'WhiteSpace' || child.type === 'Combinator') {
			const next = selector.children[i + 1];

			block = {
				global: next.type === 'PseudoClassSelector' && next.name === 'global',
				selectors: [],
				combinator: child
			};

			blocks.push(block);
		} else {
			block.selectors.push(child);
		}
	});

	return blocks;
}

export function walkRules(nodes: Node[], callback: (node: Node) => void) {
	nodes.forEach((node: Node) => {
		if (node.type === 'Rule') {
			callback(node);
		} else if (node.type === 'Atrule') {
			if (node.name === 'media' || node.name === 'supports' || node.name === 'document') {
				walkRules(node.block.children, callback);
			}
		}
	});
}