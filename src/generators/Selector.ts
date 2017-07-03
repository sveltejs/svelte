import { groupSelectors, isGlobalSelector, walkRules } from '../utils/css';
import { Node } from '../interfaces';

export default class Selector {
	node: Node;
	blocks: Node[][];
	parts: Node[];
	used: boolean;

	constructor(node: Node) {
		this.node = node;

		this.blocks = groupSelectors(this.node);

		// take trailing :global(...) selectors out of consideration
		let i = node.children.length;
		while (i > 2) {
			const last = node.children[i-1];
			const penultimate = node.children[i-2];

			if (last.type === 'PseudoClassSelector' && last.name === 'global') {
				i -= 2;
			} else {
				break;
			}
		}

		this.parts = node.children.slice(0, i);

		this.used = isGlobalSelector(this.blocks[0]);
	}

	apply(node: Node, stack: Node[]) {
		const applies = selectorAppliesTo(this.parts, node, stack.slice());

		if (applies) {
			this.used = true;

			// add svelte-123xyz attribute to outermost and innermost
			// elements — no need to add it to intermediate elements
			node._needsCssAttribute = true;
			if (stack[0] && this.node.children.find(isDescendantSelector)) stack[0]._needsCssAttribute = true;
		}
	}
}

function isDescendantSelector(selector: Node) {
	return selector.type === 'WhiteSpace' || selector.type === 'Combinator';
}

function selectorAppliesTo(parts: Node[], node: Node, stack: Node[]): boolean {
	let i = parts.length;
	let j = stack.length;

	while (i--) {
		if (!node) {
			return parts.every((part: Node) => {
				return part.type === 'Combinator' || (part.type === 'PseudoClassSelector' && part.name === 'global');
			});
		}

		const part = parts[i];

		if (part.type === 'PseudoClassSelector' && part.name === 'global') {
			// TODO shouldn't see this here... maybe we should enforce that :global(...)
			// cannot be sandwiched between non-global selectors?
			return false;
		}

		if (part.type === 'PseudoClassSelector' || part.type === 'PseudoElementSelector') {
			continue;
		}

		if (part.type === 'ClassSelector') {
			if (!attributeMatches(node, 'class', part.name, '~=', false)) return false;
		}

		else if (part.type === 'IdSelector') {
			if (!attributeMatches(node, 'id', part.name, '=', false)) return false;
		}

		else if (part.type === 'AttributeSelector') {
			if (!attributeMatches(node, part.name.name, part.value && unquote(part.value.value), part.operator, part.flags)) return false;
		}

		else if (part.type === 'TypeSelector') {
			if (part.name === '*') return true;
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

			// TODO other combinators
			return true;
		}

		else {
			// bail. TODO figure out what these could be
			return true;
		}
	}

	return true;
}

const operators = {
	'=' : (value: string, flags: string) => new RegExp(`^${value}$`, flags),
	'~=': (value: string, flags: string) => new RegExp(`\\b${value}\\b`, flags),
	'|=': (value: string, flags: string) => new RegExp(`^${value}(-.+)?$`, flags),
	'^=': (value: string, flags: string) => new RegExp(`^${value}`, flags),
	'$=': (value: string, flags: string) => new RegExp(`${value}$`, flags),
	'*=': (value: string, flags: string) => new RegExp(value, flags)
};

function attributeMatches(node: Node, name: string, expectedValue: string, operator: string, caseInsensitive: boolean) {
	const attr = node.attributes.find((attr: Node) => attr.name === name);
	if (!attr) return false;
	if (attr.value === true) return operator === null;
	if (isDynamic(attr.value)) return true;

	const actualValue = attr.value[0].data;

	const pattern = operators[operator](expectedValue, caseInsensitive ? 'i' : '');
	return pattern.test(actualValue);
}

function isDynamic(value: Node) {
	return value.length > 1 || value[0].type !== 'Text';
}

function unquote(str: string) {
	if (str[0] === str[str.length - 1] && str[0] === "'" || str[0] === '"') {
		return str.slice(1, str.length - 1);
	}
}