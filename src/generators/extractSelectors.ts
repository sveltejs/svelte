import { Node } from '../interfaces';

export default function extractSelectors(css: Node) :Node[] {
	if (!css) return [];

	const selectors = [];

	function processRule(rule: Node) {
		if (rule.type !== 'Rule') {
			// TODO @media etc
			throw new Error(`not supported: ${rule.type}`);
		}

		const selectors = rule.selector.children;
		selectors.forEach(processSelector);
	}

	function processSelector(selector: Node) {
		selectors.push({
			used: false,
			appliesTo: (node: Node, stack: Node[]) => {
				let i = selector.children.length;
				let j = stack.length;

				while (i--) {
					if (!node) return false;

					const part = selector.children[i];

					if (part.type === 'ClassSelector') {
						if (!classMatches(node, part.name)) return false;
					}

					else if (part.type === 'TypeSelector') {
						if (node.name !== part.name) return false;
					}

					else if (part.type === 'WhiteSpace') {
						node = stack[--j];
					}

					else {
						throw new Error(`TODO ${part.type}`);
					}
				}

				return true;
			}
		});
	}

	css.children.forEach(processRule);

	return selectors;
}

function classMatches(node: Node, className: string) {
	const attr = node.attributes.find((attr: Node) => attr.name === 'class');
	if (!attr) return false;
	if (attr.value.length > 1) return true;
	if (attr.value[0].type !== 'Text') return true;

	return attr.value[0].data.split(' ').indexOf(className) !== -1;
}