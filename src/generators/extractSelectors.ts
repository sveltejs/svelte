import { Node } from '../interfaces';

export default function extractSelectors(css: Node) :Node[] {
	if (!css) return [];

	const selectors = [];

	function processRule(rule: Node) {
		if (rule.type === 'Atrule') {
			if (rule.name === 'keyframes') return;
			if (rule.name == 'media') {
				rule.block.children.forEach(processRule);
				return;
			}
			console.log(rule);
			throw new Error('nope');
		}
		if (rule.type !== 'Rule') {
			// TODO @media etc
			throw new Error(`not supported: ${rule.type}`);
		}

		const selectors = rule.selector.children;
		selectors.forEach(processSelector);
	}

	function processSelector(selector: Node) {
		selectors.push({
			used: false, // TODO use this! warn on unused selectors
			apply: (node: Node, stack: Node[]) => {
				const applies = selectorAppliesTo(selector.children, node, stack.slice());

				if (applies) {
					node._needsCssAttribute = true;
					if (selector.children.find(isDescendantSelector)) stack[0]._needsCssAttribute = true;
				}
			}
		});
	}

	css.children.forEach(processRule);

	return selectors;
}

function isDescendantSelector(selector: Node) {
	return selector.type === 'WhiteSpace'; // TODO or '>'
}

function selectorAppliesTo(parts: Node[], node: Node, stack: Node[]) {
	let i = parts.length;
	let j = stack.length;

	while (i--) {
		const part = parts[i];

		if (part.type === 'PseudoClassSelector' && part.name === 'global') {
			// bail
			return true;
		}

		if (!node) return false;

		if (part.type === 'PseudoClassSelector' || part.type === 'PseudoElementSelector') {
			continue;
		}

		if (part.type === 'ClassSelector') {
			if (!classMatches(node, part.name)) return false;
		}

		else if (part.type === 'TypeSelector') {
			if (node.name !== part.name) return false;
		}

		else if (part.type === 'WhiteSpace') {
			parts = parts.slice(0, i);

			while (stack.length) {
				if (selectorAppliesTo(parts, stack.pop(), stack)) {
					return true;
				}
			}

			return false;
		}

		else if (part.type === 'Combinator') {
			if (part.name === '>') {
				return selectorAppliesTo(parts.slice(0, i), stack.pop(), stack);
			}

			console.log(part);
			return true;
		}

		else {
			throw new Error(`TODO ${part.type}`);
		}
	}

	return true;
}

function classMatches(node: Node, className: string) {
	const attr = node.attributes.find((attr: Node) => attr.name === 'class');
	if (!attr) return false;
	if (attr.value.length > 1) return true;
	if (attr.value[0].type !== 'Text') return true;

	return attr.value[0].data.split(' ').indexOf(className) !== -1;
}