import MagicString from 'magic-string';
import { Validator } from '../validate/index';
import { Node } from '../interfaces';

export default class Selector {
	node: Node;
	blocks: Block[];
	localBlocks: Block[];
	used: boolean;

	constructor(node: Node) {
		this.node = node;

		this.blocks = groupSelectors(node);

		// take trailing :global(...) selectors out of consideration
		let i = this.blocks.length;
		while (i > 0) {
			if (!this.blocks[i - 1].global) break;
			i -= 1;
		}

		this.localBlocks = this.blocks.slice(0, i);
		this.used = this.blocks[0].global;
	}

	apply(node: Node, stack: Node[]) {
		const applies = selectorAppliesTo(this.localBlocks.slice(), node, stack.slice());

		if (applies) {
			this.used = true;

			// add svelte-123xyz attribute to outermost and innermost
			// elements — no need to add it to intermediate elements
			node._needsCssAttribute = true;
			if (stack[0] && this.node.children.find(isDescendantSelector)) stack[0]._needsCssAttribute = true;
		}
	}

	minify(code: MagicString) {
		let c: number = null;
		this.blocks.forEach((block, i) => {
			if (i > 0) {
				if (block.start - c > 1) {
					code.overwrite(c, block.start, block.combinator.name || ' ');
				}
			}

			c = block.end;
		});
	}

	transform(code: MagicString, attr: string) {
		function encapsulateBlock(block: Block) {
			let i = block.selectors.length;
			while (i--) {
				const selector = block.selectors[i];
				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') continue;

				if (selector.type === 'TypeSelector' && selector.name === '*') {
					code.overwrite(selector.start, selector.end, attr);
				} else {
					code.appendLeft(selector.end, attr);
				}

				return;
			}
		}

		this.blocks.forEach((block, i) => {
			if (block.global) {
				const selector = block.selectors[0];
				const first = selector.children[0];
				const last = selector.children[selector.children.length - 1];
				code.remove(selector.start, first.start).remove(last.end, selector.end);
			} else if (i === 0 || i === this.blocks.length - 1) {
				encapsulateBlock(block);
			}
		});
	}

	validate(validator: Validator) {
		this.blocks.forEach((block) => {
			let i = block.selectors.length;
			while (i-- > 1) {
				const selector = block.selectors[i];
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					validator.error(`:global(...) must be the first element in a compound selector`, selector.start);
				}
			}
		});

		let start = 0;
		let end = this.blocks.length;

		for (; start < end; start += 1) {
			if (!this.blocks[start].global) break;
		}

		for (; end > start; end -= 1) {
			if (!this.blocks[end - 1].global) break;
		}

		for (let i = start; i < end; i += 1) {
			if (this.blocks[i].global) {
				validator.error(`:global(...) can be at the start or end of a selector sequence, but not in the middle`, this.blocks[i].selectors[0].start);
			}
		}
	}
}

function isDescendantSelector(selector: Node) {
	return selector.type === 'WhiteSpace' || selector.type === 'Combinator';
}

function selectorAppliesTo(blocks: Block[], node: Node, stack: Node[]): boolean {
	const block = blocks.pop();
	if (!block) return false;

	if (!node) {
		return blocks.every(block => block.global);
	}

	let i = block.selectors.length;
	let j = stack.length;

	while (i--) {
		const selector = block.selectors[i];

		if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
			// TODO shouldn't see this here... maybe we should enforce that :global(...)
			// cannot be sandwiched between non-global selectors?
			return false;
		}

		if (selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector') {
			continue;
		}

		if (selector.type === 'ClassSelector') {
			if (!attributeMatches(node, 'class', selector.name, '~=', false)) return false;
		}

		else if (selector.type === 'IdSelector') {
			if (!attributeMatches(node, 'id', selector.name, '=', false)) return false;
		}

		else if (selector.type === 'AttributeSelector') {
			if (!attributeMatches(node, selector.name.name, selector.value && unquote(selector.value.value), selector.operator, selector.flags)) return false;
		}

		else if (selector.type === 'TypeSelector') {
			if (node.name !== selector.name && selector.name !== '*') return false;
		}

		else {
			// bail. TODO figure out what these could be
			return true;
		}
	}

	if (block.combinator) {
		if (block.combinator.type === 'WhiteSpace') {
			while (stack.length) {
				if (selectorAppliesTo(blocks.slice(), stack.pop(), stack)) {
					return true;
				}
			}

			return false;
		} else if (block.combinator.name === '>') {
			return selectorAppliesTo(blocks, stack.pop(), stack);
		}

		// TODO other combinators
		return true;
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

class Block {
	global: boolean;
	combinator: Node;
	selectors: Node[]
	start: number;
	end: number;

	constructor(combinator: Node) {
		this.combinator = combinator;
		this.global = false;
		this.selectors = [];

		this.start = null;
		this.end = null;
	}

	add(selector: Node) {
		if (this.selectors.length === 0) {
			this.start = selector.start;
			this.global = selector.type === 'PseudoClassSelector' && selector.name === 'global';
		}

		this.selectors.push(selector);
		this.end = selector.end;
	}
}

function groupSelectors(selector: Node) {
	let block: Block = new Block(null);

	const blocks = [block];

	selector.children.forEach((child: Node, i: number) => {
		if (child.type === 'WhiteSpace' || child.type === 'Combinator') {
			block = new Block(child);
			blocks.push(block);
		} else {
			block.add(child);
		}
	});

	return blocks;
}