import { Node } from '../interfaces';

export function isGlobalSelector(block: Node[]) {
	return block.length === 1 && block[0].type === 'PseudoClassSelector' && block[0].name === 'global';
}

export function groupSelectors(selector: Node) {
	let block: Node[] = [];
	const blocks: Node[][] = [block];

	selector.children.forEach((child: Node) => {
		if (child.type === 'WhiteSpace' || child.type === 'Combinator') {
			block = [];
			blocks.push(block);
		} else {
			block.push(child);
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