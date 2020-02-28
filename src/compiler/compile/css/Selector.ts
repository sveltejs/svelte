import MagicString from 'magic-string';
import Stylesheet from './Stylesheet';
import { gather_possible_values, UNKNOWN } from './gather_possible_values';
import { CssNode } from './interfaces';
import Component from '../Component';
import Element from '../nodes/Element';

enum BlockAppliesToNode {
	NotPossible,
	Possible,
	UnknownSelectorType
}

export default class Selector {
	node: CssNode;
	stylesheet: Stylesheet;
	blocks: Block[];
	local_blocks: Block[];
	used: boolean;

	constructor(node: CssNode, stylesheet: Stylesheet) {
		this.node = node;
		this.stylesheet = stylesheet;

		this.blocks = group_selectors(node);

		// take trailing :global(...) selectors out of consideration
		let i = this.blocks.length;
		while (i > 0) {
			if (!this.blocks[i - 1].global) break;
			i -= 1;
		}

		this.local_blocks = this.blocks.slice(0, i);
		this.used = this.local_blocks.length === 0;
	}

	apply(node: Element, stack: Element[]) {
		const to_encapsulate: any[] = [];

		apply_selector(this.local_blocks.slice(), node, stack.slice(), to_encapsulate);

		if (to_encapsulate.length > 0) {
			to_encapsulate.forEach(({ node, block }) => {
				this.stylesheet.nodes_with_css_class.add(node);
				block.should_encapsulate = true;
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

	transform(code: MagicString, attr: string, max_amount_class_specificity_increased: number) {
		const amount_class_specificity_to_increase = max_amount_class_specificity_increased - this.blocks.filter(block => block.should_encapsulate).length;
		attr = attr.repeat(amount_class_specificity_to_increase + 1);

		function encapsulate_block(block: Block) {
			let i = block.selectors.length;

			while (i--) {
				const selector = block.selectors[i];
				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') {
					if (selector.name !== 'root') {
						if (i === 0) code.prependRight(selector.start, attr);
					}
					continue;
				}

				if (selector.type === 'TypeSelector' && selector.name === '*') {
					code.overwrite(selector.start, selector.end, attr);
				} else {
					code.appendLeft(selector.end, attr);
				}

				break;
			}
		}

		this.blocks.forEach((block) => {
			if (block.global) {
				const selector = block.selectors[0];
				const first = selector.children[0];
				const last = selector.children[selector.children.length - 1];
				code.remove(selector.start, first.start).remove(last.end, selector.end);
			}

			if (block.should_encapsulate) encapsulate_block(block);
		});
	}

	validate(component: Component) {
		this.blocks.forEach((block) => {
			let i = block.selectors.length;
			while (i-- > 1) {
				const selector = block.selectors[i];
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					component.error(selector, {
						code: `css-invalid-global`,
						message: `:global(...) must be the first element in a compound selector`
					});
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
				component.error(this.blocks[i].selectors[0], {
					code: `css-invalid-global`,
					message: `:global(...) can be at the start or end of a selector sequence, but not in the middle`
				});
			}
		}
	}

	get_amount_class_specificity_increased() {
		let count = 0;
		for (const block of this.blocks) {
			if (block.should_encapsulate) {
				count ++;
			}
		}
		return count;
	}
}

function apply_selector(blocks: Block[], node: Element, stack: Element[], to_encapsulate: any[]): boolean {
	const block = blocks.pop();
	if (!block) return false;

	if (!node) {
		return blocks.every(block => block.global);
	}

	switch (block_might_apply_to_node(block, node)) {
		case BlockAppliesToNode.NotPossible:
			return false;

		case BlockAppliesToNode.UnknownSelectorType:
			// bail. TODO figure out what these could be
			to_encapsulate.push({ node, block });
			return true;
	}

	if (block.combinator) {
		if (block.combinator.type === 'WhiteSpace') {
			for (const ancestor_block of blocks) {
				if (ancestor_block.global) {
					continue;
				}

				for (const stack_node of stack) {
					if (block_might_apply_to_node(ancestor_block, stack_node) !== BlockAppliesToNode.NotPossible) {
						to_encapsulate.push({ node: stack_node, block: ancestor_block });
					}
				}

				if (to_encapsulate.length) {
					to_encapsulate.push({ node, block });
					return true;
				}
			}

			if (blocks.every(block => block.global)) {
				to_encapsulate.push({ node, block });
				return true;
			}

			return false;
		} else if (block.combinator.name === '>') {
			if (apply_selector(blocks, stack.pop(), stack, to_encapsulate)) {
				to_encapsulate.push({ node, block });
				return true;
			}

			return false;
		}

		// TODO other combinators
		to_encapsulate.push({ node, block });
		return true;
	}

	to_encapsulate.push({ node, block });
	return true;
}

function block_might_apply_to_node(block, node): BlockAppliesToNode {
	let i = block.selectors.length;

	while (i--) {
		const selector = block.selectors[i];
		const name = typeof selector.name === 'string' && selector.name.replace(/\\(.)/g, '$1');

		if (selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector') {
			continue;
		}

		if (selector.type === 'PseudoClassSelector' && name === 'global') {
			// TODO shouldn't see this here... maybe we should enforce that :global(...)
			// cannot be sandwiched between non-global selectors?
			return BlockAppliesToNode.NotPossible;
		}

		if (selector.type === 'ClassSelector') {
			if (!attribute_matches(node, 'class', name, '~=', false) && !node.classes.some(c => c.name === name)) return BlockAppliesToNode.NotPossible;
		}

		else if (selector.type === 'IdSelector') {
			if (!attribute_matches(node, 'id', name, '=', false)) return BlockAppliesToNode.NotPossible;
		}

		else if (selector.type === 'AttributeSelector') {
			if (!attribute_matches(node, selector.name.name, selector.value && unquote(selector.value), selector.matcher, selector.flags)) return BlockAppliesToNode.NotPossible;
		}

		else if (selector.type === 'TypeSelector') {
			if (node.name.toLowerCase() !== name.toLowerCase() && name !== '*') return BlockAppliesToNode.NotPossible;
		}

		else {
			return BlockAppliesToNode.UnknownSelectorType;
		}
	}

	return BlockAppliesToNode.Possible;
}

function test_attribute(operator, expected_value, case_insensitive, value) {
	if (case_insensitive) {
		expected_value = expected_value.toLowerCase();
		value = value.toLowerCase();
	}
	switch (operator) {
		case '=': return value === expected_value;
		case '~=': return value.split(/\s/).includes(expected_value);
		case '|=': return `${value}-`.startsWith(`${expected_value}-`);
		case '^=': return value.startsWith(expected_value);
		case '$=': return value.endsWith(expected_value);
		case '*=': return value.includes(expected_value);
		default: throw new Error(`this shouldn't happen`);
	}
}

function attribute_matches(node: CssNode, name: string, expected_value: string, operator: string, case_insensitive: boolean) {
	const spread = node.attributes.find(attr => attr.type === 'Spread');
	if (spread) return true;

	if (node.bindings.some((binding: CssNode) => binding.name === name)) return true;

	const attr = node.attributes.find((attr: CssNode) => attr.name === name);
	if (!attr) return false;
	if (attr.is_true) return operator === null;
	if (!expected_value) return true;

	if (attr.chunks.length === 1) {
		const value = attr.chunks[0];
		if (!value) return false;
		if (value.type === 'Text') return test_attribute(operator, expected_value, case_insensitive, value.data);
	}

	const possible_values = new Set();

	let prev_values = [];
	for (const chunk of attr.chunks) {
		const current_possible_values = new Set();
		if (chunk.type === 'Text') {
			current_possible_values.add(chunk.data);
		} else {
			gather_possible_values(chunk.node, current_possible_values);
		}

		// impossible to find out all combinations
		if (current_possible_values.has(UNKNOWN)) return true;

		if (prev_values.length > 0) {
			const start_with_space = [];
			const remaining = [];
			current_possible_values.forEach((current_possible_value: string) => {
				if (/^\s/.test(current_possible_value)) {
					start_with_space.push(current_possible_value);
				} else {
					remaining.push(current_possible_value);
				}
			});

			if (remaining.length > 0) {
				if (start_with_space.length > 0) {
					prev_values.forEach(prev_value => possible_values.add(prev_value));
				}

				const combined = [];
				prev_values.forEach((prev_value: string) => {
					remaining.forEach((value: string) => {
						combined.push(prev_value + value);
					});
				});
				prev_values = combined;

				start_with_space.forEach((value: string) => {
					if (/\s$/.test(value)) {
						possible_values.add(value);
					} else {
						prev_values.push(value);
					}
				});
				continue;
			} else {
				prev_values.forEach(prev_value => possible_values.add(prev_value));
				prev_values = [];
			}
		}

		current_possible_values.forEach((current_possible_value: string) => {
			if (/\s$/.test(current_possible_value)) {
				possible_values.add(current_possible_value);
			} else {
				prev_values.push(current_possible_value);
			}
		});
		if (prev_values.length < current_possible_values.size) {
			prev_values.push(' ');
		}

		if (prev_values.length > 20) {
			// might grow exponentially, bail out
			return true;
		}
	}
	prev_values.forEach(prev_value => possible_values.add(prev_value));

	if (possible_values.has(UNKNOWN)) return true;

	for (const value of possible_values) {
		if (test_attribute(operator, expected_value, case_insensitive, value)) return true;
	}

	return false;
}

function unquote(value: CssNode) {
	if (value.type === 'Identifier') return value.name;
	const str = value.value;
	if (str[0] === str[str.length - 1] && str[0] === "'" || str[0] === '"') {
		return str.slice(1, str.length - 1);
	}
	return str;
}

class Block {
	global: boolean;
	combinator: CssNode;
	selectors: CssNode[]
	start: number;
	end: number;
	should_encapsulate: boolean;

	constructor(combinator: CssNode) {
		this.combinator = combinator;
		this.global = false;
		this.selectors = [];

		this.start = null;
		this.end = null;

		this.should_encapsulate = false;
	}

	add(selector: CssNode) {
		if (this.selectors.length === 0) {
			this.start = selector.start;
			this.global = selector.type === 'PseudoClassSelector' && selector.name === 'global';
		}

		this.selectors.push(selector);
		this.end = selector.end;
	}
}

function group_selectors(selector: CssNode) {
	let block: Block = new Block(null);

	const blocks = [block];

	selector.children.forEach((child: CssNode) => {
		if (child.type === 'WhiteSpace' || child.type === 'Combinator') {
			block = new Block(child);
			blocks.push(block);
		} else {
			block.add(child);
		}
	});

	return blocks;
}
