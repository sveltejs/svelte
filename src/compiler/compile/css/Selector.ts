import MagicString from 'magic-string';
import Stylesheet from './Stylesheet';
import { gather_possible_values, UNKNOWN } from './gather_possible_values';
import { CssNode } from './interfaces';
import Component from '../Component';
import Element from '../nodes/Element';
import { INode } from '../nodes/interfaces';
import EachBlock from '../nodes/EachBlock';
import IfBlock from '../nodes/IfBlock';
import AwaitBlock from '../nodes/AwaitBlock';
import compiler_errors from '../compiler_errors';

enum BlockAppliesToNode {
	NotPossible,
	Possible,
	UnknownSelectorType
}
enum NodeExist {
	Probably = 1,
	Definitely = 2,
}

const whitelist_attribute_selector = new Map([
	['details', new Set(['open'])],
	['dialog', new Set(['open'])]
]);

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

		const host_only = this.blocks.length === 1 && this.blocks[0].host;
		const root_only = this.blocks.length === 1 && this.blocks[0].root;

		this.used = this.local_blocks.length === 0 || host_only || root_only;
	}

	apply(node: Element) {
		const to_encapsulate: Array<{ node: Element, block: Block }> = [];

		apply_selector(this.local_blocks.slice(), node, to_encapsulate);

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

		function remove_global_pseudo_class(selector: CssNode) {
			const first = selector.children[0];
			const last = selector.children[selector.children.length - 1];
			code.remove(selector.start, first.start).remove(last.end, selector.end);
		}

		function encapsulate_block(block: Block, attr: string) {
			for (const selector of block.selectors) {
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					remove_global_pseudo_class(selector);
				}
			}

			let i = block.selectors.length;

			while (i--) {
				const selector = block.selectors[i];
				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') {
					if (selector.name !== 'root' && selector.name !== 'host') {
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

		this.blocks.forEach((block, index) => {
			if (block.global) {
				remove_global_pseudo_class(block.selectors[0]);
			}
			if (block.should_encapsulate) encapsulate_block(block, index === this.blocks.length - 1 ? attr.repeat(amount_class_specificity_to_increase + 1) : attr);
		});
	}

	validate(component: Component) {
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
				return component.error(this.blocks[i].selectors[0], compiler_errors.css_invalid_global);
			}
		}

		this.validate_global_with_multiple_selectors(component);
		this.validate_invalid_combinator_without_selector(component);
	}

	validate_global_with_multiple_selectors(component: Component) {
		if (this.blocks.length === 1 && this.blocks[0].selectors.length === 1) {
			// standalone :global() with multiple selectors is OK
			return;
		}

		for (const block of this.blocks) {
			for (const selector of block.selectors) {
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					if (/[^\\],(?!([^([]+[^\\]|[^([\\])[)\]])/.test(selector.children[0].value)) {
						component.error(selector, compiler_errors.css_invalid_global_selector);
					}
				}
			}
		}
	}
	validate_invalid_combinator_without_selector(component: Component) {
		for (let i = 0; i < this.blocks.length; i++) {
			const block = this.blocks[i];
			if (block.combinator && block.selectors.length === 0) {
				component.error(this.node, compiler_errors.css_invalid_selector(component.source.slice(this.node.start, this.node.end)));
			}
			if (!block.combinator && block.selectors.length === 0) {
				component.error(this.node, compiler_errors.css_invalid_selector(component.source.slice(this.node.start, this.node.end)));
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

function apply_selector(blocks: Block[], node: Element, to_encapsulate: Array<{ node: Element, block: Block }>): boolean {
	const block = blocks.pop();
	if (!block) return false;

	if (!node) {
		return (
			(block.global && blocks.every(block => block.global)) ||
			(block.host && blocks.length === 0)
		);
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

				if (ancestor_block.host) {
					to_encapsulate.push({ node, block });
					return true;
				}

				let parent = node;
				while (parent = get_element_parent(parent)) {
					if (block_might_apply_to_node(ancestor_block, parent) !== BlockAppliesToNode.NotPossible) {
						to_encapsulate.push({ node: parent, block: ancestor_block });
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
			const has_global_parent = blocks.every(block => block.global);
			if (has_global_parent || apply_selector(blocks, get_element_parent(node), to_encapsulate)) {
				to_encapsulate.push({ node, block });
				return true;
			}

			return false;
		} else if (block.combinator.name === '+' || block.combinator.name === '~') {
			const siblings = get_possible_element_siblings(node, block.combinator.name === '+');
			let has_match = false;

			// NOTE: if we have :global(), we couldn't figure out what is selected within `:global` due to the
			// css-tree limitation that does not parse the inner selector of :global
			// so unless we are sure there will be no sibling to match, we will consider it as matched
			const has_global = blocks.some(block => block.global);
			if (has_global) {
				if (siblings.size === 0 && get_element_parent(node) !== null) {
					return false;
				}
				to_encapsulate.push({ node, block });
				return true;
			}

			for (const possible_sibling of siblings.keys()) {
				if (apply_selector(blocks.slice(), possible_sibling, to_encapsulate)) {
					to_encapsulate.push({ node, block });
					has_match = true;
				}
			}
			return has_match;
		}

		// TODO other combinators
		to_encapsulate.push({ node, block });
		return true;
	}

	to_encapsulate.push({ node, block });
	return true;
}

function block_might_apply_to_node(block: Block, node: Element): BlockAppliesToNode {
	let i = block.selectors.length;

	while (i--) {
		const selector = block.selectors[i];
		const name = typeof selector.name === 'string' && selector.name.replace(/\\(.)/g, '$1');

		if (selector.type === 'PseudoClassSelector' && (name === 'host' || name === 'root')) {
			return BlockAppliesToNode.NotPossible;
		}

		if (block.selectors.length === 1 && selector.type === 'PseudoClassSelector' && name === 'global') {
			return BlockAppliesToNode.NotPossible;
		}

		if (selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector') {
			continue;
		}

		if (selector.type === 'ClassSelector') {
			if (!attribute_matches(node, 'class', name, '~=', false) && !node.classes.some(c => c.name === name)) return BlockAppliesToNode.NotPossible;
		} else if (selector.type === 'IdSelector') {
			if (!attribute_matches(node, 'id', name, '=', false)) return BlockAppliesToNode.NotPossible;
		} else if (selector.type === 'AttributeSelector') {
			if (
				!(whitelist_attribute_selector.has(node.name.toLowerCase()) && whitelist_attribute_selector.get(node.name.toLowerCase()).has(selector.name.name.toLowerCase())) &&
				!attribute_matches(node, selector.name.name, selector.value && unquote(selector.value), selector.matcher, selector.flags)) {
				return BlockAppliesToNode.NotPossible;
			}
		} else if (selector.type === 'TypeSelector') {
			if (node.name.toLowerCase() !== name.toLowerCase() && name !== '*' && !node.is_dynamic_element) return BlockAppliesToNode.NotPossible;
		} else {
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
		default: throw new Error("this shouldn't happen");
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

function get_element_parent(node: Element): Element | null {
	let parent: INode = node;
	while ((parent = parent.parent) && parent.type !== 'Element');
	return parent as Element | null;
}

function get_possible_element_siblings(node: INode, adjacent_only: boolean): Map<Element, NodeExist> {
	const result: Map<Element, NodeExist> = new Map();
	let prev: INode = node;
	while (prev = prev.prev) {
		if (prev.type === 'Element') {
			if (!prev.attributes.find(attr => attr.type === 'Attribute' && attr.name.toLowerCase() === 'slot')) {
				result.set(prev, NodeExist.Definitely);
			}

			if (adjacent_only) {
				break;
			}
		} else if (prev.type === 'EachBlock' || prev.type === 'IfBlock' || prev.type === 'AwaitBlock') {
			const possible_last_child = get_possible_last_child(prev, adjacent_only);

			add_to_map(possible_last_child, result);
			if (adjacent_only && has_definite_elements(possible_last_child)) {
				return result;
			}
		}
	}

	if (!prev || !adjacent_only) {
		let parent: INode = node;
		let skip_each_for_last_child = node.type === 'ElseBlock';
		while ((parent = parent.parent) && (parent.type === 'EachBlock' || parent.type === 'IfBlock' || parent.type === 'ElseBlock' || parent.type === 'AwaitBlock')) {
			const possible_siblings = get_possible_element_siblings(parent, adjacent_only);
			add_to_map(possible_siblings, result);

			if (parent.type === 'EachBlock') {
				// first child of each block can select the last child of each block as previous sibling
				if (skip_each_for_last_child) {
					skip_each_for_last_child = false;
				} else {
					add_to_map(get_possible_last_child(parent, adjacent_only), result);
				}
			} else if (parent.type === 'ElseBlock') {
				skip_each_for_last_child = true;
				parent = parent.parent;
			}

			if (adjacent_only && has_definite_elements(possible_siblings)) {
				break;
			}
		}
	}

	return result;
}

function get_possible_last_child(block: EachBlock | IfBlock | AwaitBlock, adjacent_only: boolean): Map<Element, NodeExist> {
	const result: Map<Element, NodeExist> = new Map();

	if (block.type === 'EachBlock') {
		const each_result: Map<Element, NodeExist> = loop_child(block.children, adjacent_only);
		const else_result: Map<Element, NodeExist> = block.else ? loop_child(block.else.children, adjacent_only) : new Map();

		const not_exhaustive = !has_definite_elements(else_result);

		if (not_exhaustive) {
			mark_as_probably(each_result);
			mark_as_probably(else_result);
		}
		add_to_map(each_result, result);
		add_to_map(else_result, result);
	} else if (block.type === 'IfBlock') {
		const if_result: Map<Element, NodeExist> = loop_child(block.children, adjacent_only);
		const else_result: Map<Element, NodeExist> = block.else ? loop_child(block.else.children, adjacent_only) : new Map();

		const not_exhaustive = !has_definite_elements(if_result) || !has_definite_elements(else_result);

		if (not_exhaustive) {
			mark_as_probably(if_result);
			mark_as_probably(else_result);
		}

		add_to_map(if_result, result);
		add_to_map(else_result, result);
	} else if (block.type === 'AwaitBlock') {
		const pending_result: Map<Element, NodeExist> = block.pending ? loop_child(block.pending.children, adjacent_only) : new Map();
		const then_result: Map<Element, NodeExist> = block.then ? loop_child(block.then.children, adjacent_only) : new Map();
		const catch_result: Map<Element, NodeExist> = block.catch ? loop_child(block.catch.children, adjacent_only) : new Map();

		const not_exhaustive = !has_definite_elements(pending_result) || !has_definite_elements(then_result) || !has_definite_elements(catch_result);

		if (not_exhaustive) {
			mark_as_probably(pending_result);
			mark_as_probably(then_result);
			mark_as_probably(catch_result);
		}

		add_to_map(pending_result, result);
		add_to_map(then_result, result);
		add_to_map(catch_result, result);
	}

	return result;
}

function has_definite_elements(result: Map<Element, NodeExist>): boolean {
	if (result.size === 0) return false;
	for (const exist of result.values()) {
		if (exist === NodeExist.Definitely) {
			return true;
		}
	}
	return false;
}

function add_to_map(from: Map<Element, NodeExist>, to: Map<Element, NodeExist>) {
	from.forEach((exist, element) => {
		to.set(element, higher_existence(exist, to.get(element)));
	});
}

function higher_existence(exist1: NodeExist | null, exist2: NodeExist | null): NodeExist {
	if (exist1 === undefined || exist2 === undefined) return exist1 || exist2;
	return exist1 > exist2 ? exist1 : exist2;
}

function mark_as_probably(result: Map<Element, NodeExist>) {
	for (const key of result.keys()) {
		result.set(key, NodeExist.Probably);
	}
}

function loop_child(children: INode[], adjacent_only: boolean) {
	const result: Map<Element, NodeExist> = new Map();
	for (let i = children.length - 1; i >= 0; i--) {
		const child = children[i];
		if (child.type === 'Element') {
			result.set(child, NodeExist.Definitely);
			if (adjacent_only) {
				break;
			}
		} else if (child.type === 'EachBlock' || child.type === 'IfBlock' || child.type === 'AwaitBlock') {
			const child_result = get_possible_last_child(child, adjacent_only);
			add_to_map(child_result, result);
			if (adjacent_only && has_definite_elements(child_result)) {
				break;
			}
		}
	}
	return result;
}

class Block {
	host: boolean;
	root: boolean;
	combinator: CssNode;
	selectors: CssNode[];
	start: number;
	end: number;
	should_encapsulate: boolean;

	constructor(combinator: CssNode) {
		this.combinator = combinator;
		this.host = false;
		this.root = false;
		this.selectors = [];

		this.start = null;
		this.end = null;

		this.should_encapsulate = false;
	}

	add(selector: CssNode) {
		if (this.selectors.length === 0) {
			this.start = selector.start;
			this.host = selector.type === 'PseudoClassSelector' && selector.name === 'host';
		}
		this.root = this.root || selector.type === 'PseudoClassSelector' && selector.name === 'root';

		this.selectors.push(selector);
		this.end = selector.end;
	}

	get global() {
		return (
			this.selectors.length >= 1 &&
			this.selectors[0].type === 'PseudoClassSelector' &&
			this.selectors[0].name === 'global' &&
			this.selectors.every((selector) => selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector')
		);
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
