import MagicString from 'magic-string';
import { gatherPossibleValues, UNKNOWN } from './gatherPossibleValues';
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
		const toEncapsulate: Node[] = [];
		applySelector(this.localBlocks.slice(), node, stack.slice(), toEncapsulate);

		if (toEncapsulate.length > 0) {
			toEncapsulate.filter((_, i) => i === 0 || i === toEncapsulate.length - 1).forEach(({ node, block }) => {
				node._needsCssAttribute = true;
				block.shouldEncapsulate = true;
			});

			this.used = true;
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

				break;
			}

			i = block.selectors.length;
			while (i--) {
				const selector = block.selectors[i];

				if (selector.type === 'RefSelector') {
					code.overwrite(selector.start, selector.end, `[svelte-ref-${selector.name}]`, {
						contentOnly: true,
						storeName: false
					});
				}
			}
		}

		this.blocks.forEach((block, i) => {
			if (block.global) {
				const selector = block.selectors[0];
				const first = selector.children[0];
				const last = selector.children[selector.children.length - 1];
				code.remove(selector.start, first.start).remove(last.end, selector.end);
			}

			if (block.shouldEncapsulate) encapsulateBlock(block);
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

function applySelector(blocks: Block[], node: Node, stack: Node[], toEncapsulate: any[]): boolean {
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
			if (!attributeMatches(node, selector.name.name, selector.value && unquote(selector.value), selector.matcher, selector.flags)) return false;
		}

		else if (selector.type === 'TypeSelector') {
			if (node.name !== selector.name && selector.name !== '*') return false;
		}

		else if (selector.type === 'RefSelector') {
			if (node.attributes.some((attr: Node) => attr.type === 'Ref' && attr.name === selector.name)) {
				node._cssRefAttribute = selector.name;
				toEncapsulate.push({ node, block });
				return true;
			}
			return;
		}

		else {
			// bail. TODO figure out what these could be
			toEncapsulate.push({ node, block });
			return true;
		}
	}

	if (block.combinator) {
		if (block.combinator.type === 'WhiteSpace') {
			while (stack.length) {
				if (applySelector(blocks.slice(), stack.pop(), stack, toEncapsulate)) {
					toEncapsulate.push({ node, block });
					return true;
				}
			}

			return false;
		} else if (block.combinator.name === '>') {
			if (applySelector(blocks, stack.pop(), stack, toEncapsulate)) {
				toEncapsulate.push({ node, block });
				return true;
			}
			return false;
		}

		// TODO other combinators
		toEncapsulate.push({ node, block });
		return true;
	}

	toEncapsulate.push({ node, block });
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
	if (attr.value.length > 1) return true;

	const pattern = operators[operator](expectedValue, caseInsensitive ? 'i' : '');
	const value = attr.value[0];

	if (value.type === 'Text') return pattern.test(value.data);

	const possibleValues = new Set();
	gatherPossibleValues(value.expression, possibleValues);
	if (possibleValues.has(UNKNOWN)) return true;

	for (const x of Array.from(possibleValues)) { // TypeScript for-of is slightly unlike JS
		if (pattern.test(x)) return true;
	}

	return false;
}

function isDynamic(value: Node) {
	return value.length > 1 || value[0].type !== 'Text';
}

function unquote(value: Node) {
	if (value.type === 'Identifier') return value.name;
	const str = value.value;
	if (str[0] === str[str.length - 1] && str[0] === "'" || str[0] === '"') {
		return str.slice(1, str.length - 1);
	}
	return str;
}

class Block {
	global: boolean;
	combinator: Node;
	selectors: Node[]
	start: number;
	end: number;
	shouldEncapsulate: boolean;

	constructor(combinator: Node) {
		this.combinator = combinator;
		this.global = false;
		this.selectors = [];

		this.start = null;
		this.end = null;

		this.shouldEncapsulate = false;
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
