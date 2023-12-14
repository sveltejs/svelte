import { get_possible_values } from './gather_possible_values.js';
import { regex_starts_with_whitespace, regex_ends_with_whitespace } from '../../patterns.js';
import { error } from '../../../errors.js';

const NO_MATCH = 'NO_MATCH';
const POSSIBLE_MATCH = 'POSSIBLE_MATCH';
const UNKNOWN_SELECTOR = 'UNKNOWN_SELECTOR';

const NodeExist = /** @type {const} */ ({
	Probably: 0,
	Definitely: 1
});

/** @typedef {typeof NodeExist[keyof typeof NodeExist]} NodeExistsValue */

const whitelist_attribute_selector = new Map([
	['details', new Set(['open'])],
	['dialog', new Set(['open'])]
]);

export default class Selector {
	/** @type {import('#compiler').Css.Selector} */
	node;

	/** @type {import('./Stylesheet.js').default} */
	stylesheet;

	/** @type {Block[]} */
	blocks;

	/** @type {Block[]} */
	local_blocks;

	/** @type {boolean} */
	used;

	/**
	 * @param {import('#compiler').Css.Selector} node
	 * @param {import('./Stylesheet.js').default} stylesheet
	 */
	constructor(node, stylesheet) {
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

	/** @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node */
	apply(node) {
		/** @type {Array<{ node: import('#compiler').RegularElement | import('#compiler').SvelteElement; block: Block }>} */
		const to_encapsulate = [];
		apply_selector(this.local_blocks.slice(), node, to_encapsulate);
		if (to_encapsulate.length > 0) {
			to_encapsulate.forEach(({ node, block }) => {
				this.stylesheet.nodes_with_css_class.add(node);
				block.should_encapsulate = true;
			});
			this.used = true;
		}
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} attr
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, attr, max_amount_class_specificity_increased) {
		const amount_class_specificity_to_increase =
			max_amount_class_specificity_increased -
			this.blocks.filter((block) => block.should_encapsulate).length;

		/** @param {import('#compiler').Css.SimpleSelector} selector */
		function remove_global_pseudo_class(selector) {
			code
				.remove(selector.start, selector.start + ':global('.length)
				.remove(selector.end - 1, selector.end);
		}

		/**
		 * @param {Block} block
		 * @param {string} attr
		 */
		function encapsulate_block(block, attr) {
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
					code.update(selector.start, selector.end, attr);
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
			if (block.should_encapsulate)
				encapsulate_block(
					block,
					index === this.blocks.length - 1
						? attr.repeat(amount_class_specificity_to_increase + 1)
						: attr
				);
		});
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate(analysis) {
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
				error(this.blocks[i].selectors[0], 'invalid-css-global-placement');
			}
		}
		this.validate_global_with_multiple_selectors();
		this.validate_global_compound_selector();
		this.validate_invalid_combinator_without_selector(analysis);
	}

	validate_global_with_multiple_selectors() {
		if (this.blocks.length === 1 && this.blocks[0].selectors.length === 1) {
			// standalone :global() with multiple selectors is OK
			return;
		}
		for (const block of this.blocks) {
			for (const selector of block.selectors) {
				if (
					selector.type === 'PseudoClassSelector' &&
					selector.name === 'global' &&
					selector.args !== null &&
					selector.args.children.length > 1
				) {
					error(selector, 'invalid-css-global-selector');
				}
			}
		}
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate_invalid_combinator_without_selector(analysis) {
		for (let i = 0; i < this.blocks.length; i++) {
			const block = this.blocks[i];
			if (block.selectors.length === 0) {
				error(this.node, 'invalid-css-selector');
			}
		}
	}

	validate_global_compound_selector() {
		for (const block of this.blocks) {
			for (let i = 0; i < block.selectors.length; i++) {
				const selector = block.selectors[i];
				if (
					selector.type === 'PseudoClassSelector' &&
					selector.name === 'global' &&
					block.selectors.length !== 1 &&
					(i === block.selectors.length - 1 ||
						block.selectors.slice(i + 1).some((s) => s.type !== 'PseudoElementSelector'))
				) {
					error(selector, 'invalid-css-global-selector-list');
				}
			}
		}
	}

	get_amount_class_specificity_increased() {
		return this.blocks.filter((block) => block.should_encapsulate).length;
	}
}

/**
 * @param {Block[]} blocks
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} node
 * @param {Array<{ node: import('#compiler').RegularElement | import('#compiler').SvelteElement; block: Block }>} to_encapsulate
 * @returns {boolean}
 */
function apply_selector(blocks, node, to_encapsulate) {
	const block = blocks.pop();
	if (!block) return false;
	if (!node) {
		return (
			(block.global && blocks.every((block) => block.global)) || (block.host && blocks.length === 0)
		);
	}
	const applies = block_might_apply_to_node(block, node);

	if (applies === NO_MATCH) {
		return false;
	}

	if (applies === UNKNOWN_SELECTOR) {
		to_encapsulate.push({ node, block });
		return true;
	}

	if (block.combinator) {
		if (block.combinator.type === 'Combinator' && block.combinator.name === ' ') {
			for (const ancestor_block of blocks) {
				if (ancestor_block.global) {
					continue;
				}
				if (ancestor_block.host) {
					to_encapsulate.push({ node, block });
					return true;
				}
				/** @type {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} */
				let parent = node;
				while ((parent = get_element_parent(parent))) {
					if (block_might_apply_to_node(ancestor_block, parent) !== NO_MATCH) {
						to_encapsulate.push({ node: parent, block: ancestor_block });
					}
				}
				if (to_encapsulate.length) {
					to_encapsulate.push({ node, block });
					return true;
				}
			}
			if (blocks.every((block) => block.global)) {
				to_encapsulate.push({ node, block });
				return true;
			}
			return false;
		} else if (block.combinator.name === '>') {
			const has_global_parent = blocks.every((block) => block.global);
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
			const has_global = blocks.some((block) => block.global);
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

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * @param {Block} block
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {NO_MATCH | POSSIBLE_MATCH | UNKNOWN_SELECTOR}
 */
function block_might_apply_to_node(block, node) {
	if (block.host || block.root) return NO_MATCH;

	let i = block.selectors.length;
	while (i--) {
		const selector = block.selectors[i];

		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		if (selector.type === 'PseudoClassSelector' && (name === 'host' || name === 'root')) {
			return NO_MATCH;
		}
		if (
			block.selectors.length === 1 &&
			selector.type === 'PseudoClassSelector' &&
			name === 'global'
		) {
			return NO_MATCH;
		}

		if (selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector') {
			continue;
		}

		if (selector.type === 'AttributeSelector') {
			const whitelisted = whitelist_attribute_selector.get(node.name.toLowerCase());
			if (
				!whitelisted?.has(selector.name.toLowerCase()) &&
				!attribute_matches(
					node,
					selector.name,
					selector.value && unquote(selector.value),
					selector.matcher,
					selector.flags?.includes('i') ?? false
				)
			) {
				return NO_MATCH;
			}
		} else {
			if (selector.type === 'ClassSelector') {
				if (
					!attribute_matches(node, 'class', name, '~=', false) &&
					!node.attributes.some(
						(attribute) => attribute.type === 'ClassDirective' && attribute.name === name
					)
				) {
					return NO_MATCH;
				}
			} else if (selector.type === 'IdSelector') {
				if (!attribute_matches(node, 'id', name, '=', false)) return NO_MATCH;
			} else if (selector.type === 'TypeSelector') {
				if (
					node.name.toLowerCase() !== name.toLowerCase() &&
					name !== '*' &&
					node.type !== 'SvelteElement'
				) {
					return NO_MATCH;
				}
			} else {
				return UNKNOWN_SELECTOR;
			}
		}
	}

	return POSSIBLE_MATCH;
}

/**
 * @param {any} operator
 * @param {any} expected_value
 * @param {any} case_insensitive
 * @param {any} value
 */
function test_attribute(operator, expected_value, case_insensitive, value) {
	if (case_insensitive) {
		expected_value = expected_value.toLowerCase();
		value = value.toLowerCase();
	}
	switch (operator) {
		case '=':
			return value === expected_value;
		case '~=':
			return value.split(/\s/).includes(expected_value);
		case '|=':
			return `${value}-`.startsWith(`${expected_value}-`);
		case '^=':
			return value.startsWith(expected_value);
		case '$=':
			return value.endsWith(expected_value);
		case '*=':
			return value.includes(expected_value);
		default:
			throw new Error("this shouldn't happen");
	}
}

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @param {string} name
 * @param {string | null} expected_value
 * @param {string | null} operator
 * @param {boolean} case_insensitive
 */
function attribute_matches(node, name, expected_value, operator, case_insensitive) {
	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') return true;
		if (attribute.type === 'BindDirective' && attribute.name === name) return true;

		if (attribute.type !== 'Attribute') continue;
		if (attribute.name.toLowerCase() !== name.toLowerCase()) continue;

		if (attribute.value === true) return operator === null;
		if (expected_value === null) return true;

		const chunks = attribute.value;
		if (chunks.length === 1) {
			const value = chunks[0];
			if (value.type === 'Text') {
				return test_attribute(operator, expected_value, case_insensitive, value.data);
			}
		}

		const possible_values = new Set();

		/** @type {string[]} */
		let prev_values = [];
		for (const chunk of chunks) {
			const current_possible_values = get_possible_values(chunk);

			// impossible to find out all combinations
			if (!current_possible_values) return true;

			if (prev_values.length > 0) {
				/** @type {string[]} */
				const start_with_space = [];

				/** @type {string[]} */
				const remaining = [];

				current_possible_values.forEach((current_possible_value) => {
					if (regex_starts_with_whitespace.test(current_possible_value)) {
						start_with_space.push(current_possible_value);
					} else {
						remaining.push(current_possible_value);
					}
				});
				if (remaining.length > 0) {
					if (start_with_space.length > 0) {
						prev_values.forEach((prev_value) => possible_values.add(prev_value));
					}

					/** @type {string[]} */
					const combined = [];

					prev_values.forEach((prev_value) => {
						remaining.forEach((value) => {
							combined.push(prev_value + value);
						});
					});
					prev_values = combined;
					start_with_space.forEach((value) => {
						if (regex_ends_with_whitespace.test(value)) {
							possible_values.add(value);
						} else {
							prev_values.push(value);
						}
					});
					continue;
				} else {
					prev_values.forEach((prev_value) => possible_values.add(prev_value));
					prev_values = [];
				}
			}
			current_possible_values.forEach((current_possible_value) => {
				if (regex_ends_with_whitespace.test(current_possible_value)) {
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
		prev_values.forEach((prev_value) => possible_values.add(prev_value));

		for (const value of possible_values) {
			if (test_attribute(operator, expected_value, case_insensitive, value)) return true;
		}
	}

	return false;
}

/** @param {string} str */
function unquote(str) {
	if ((str[0] === str[str.length - 1] && str[0] === "'") || str[0] === '"') {
		return str.slice(1, str.length - 1);
	}
	return str;
}

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {import('#compiler').RegularElement | import('#compiler').SvelteElement | null}
 */
function get_element_parent(node) {
	/** @type {import('#compiler').SvelteNode | null} */
	let parent = node;
	while (
		// @ts-expect-error TODO figure out a more elegant solution
		(parent = parent.parent) &&
		parent.type !== 'RegularElement' &&
		parent.type !== 'SvelteElement'
	);
	return parent ?? null;
}

/**
 * Finds the given node's previous sibling in the DOM
 *
 * The Svelte `<slot>` is just a placeholder and is not actually real. Any children nodes
 * in `<slot>` are 'flattened' and considered as the same level as the `<slot>`'s siblings
 *
 * e.g.
 * ```html
 * <h1>Heading 1</h1>
 * <slot>
 *   <h2>Heading 2</h2>
 * </slot>
 * ```
 *
 * is considered to look like:
 * ```html
 * <h1>Heading 1</h1>
 * <h2>Heading 2</h2>
 * ```
 * @param {import('#compiler').SvelteNode} node
 * @returns {import('#compiler').SvelteNode}
 */
function find_previous_sibling(node) {
	/** @type {import('#compiler').SvelteNode} */
	let current_node = node;
	do {
		if (current_node.type === 'SlotElement') {
			const slot_children = current_node.fragment.nodes;
			if (slot_children.length > 0) {
				current_node = slot_children.slice(-1)[0]; // go to its last child first
				continue;
			}
		}
		while (
			// @ts-expect-error TODO
			!current_node.prev &&
			// @ts-expect-error TODO
			current_node.parent &&
			// @ts-expect-error TODO
			current_node.parent.type === 'SlotElement'
		) {
			// @ts-expect-error TODO
			current_node = current_node.parent;
		}
		// @ts-expect-error
		current_node = current_node.prev;
	} while (current_node && current_node.type === 'SlotElement');
	return current_node;
}

/**
 * @param {import('#compiler').SvelteNode} node
 * @param {boolean} adjacent_only
 * @returns {Map<import('#compiler').RegularElement, NodeExistsValue>}
 */
function get_possible_element_siblings(node, adjacent_only) {
	/** @type {Map<import('#compiler').RegularElement, NodeExistsValue>} */
	const result = new Map();

	/** @type {import('#compiler').SvelteNode} */
	let prev = node;
	while ((prev = find_previous_sibling(prev))) {
		if (prev.type === 'RegularElement') {
			if (
				!prev.attributes.find(
					(attr) => attr.type === 'Attribute' && attr.name.toLowerCase() === 'slot'
				)
			) {
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
		/** @type {import('#compiler').SvelteNode | null} */
		let parent = node;

		while (
			// @ts-expect-error TODO
			(parent = parent?.parent) &&
			(parent.type === 'EachBlock' || parent.type === 'IfBlock' || parent.type === 'AwaitBlock')
		) {
			const possible_siblings = get_possible_element_siblings(parent, adjacent_only);
			add_to_map(possible_siblings, result);

			// @ts-expect-error
			if (parent.type === 'EachBlock' && !parent.fallback?.nodes.includes(node)) {
				// `{#each ...}<a /><b />{/each}` — `<b>` can be previous sibling of `<a />`
				add_to_map(get_possible_last_child(parent, adjacent_only), result);
			}

			if (adjacent_only && has_definite_elements(possible_siblings)) {
				break;
			}
		}
	}

	return result;
}

/**
 * @param {import('#compiler').EachBlock | import('#compiler').IfBlock | import('#compiler').AwaitBlock} block
 * @param {boolean} adjacent_only
 * @returns {Map<import('#compiler').RegularElement, NodeExistsValue>}
 */
function get_possible_last_child(block, adjacent_only) {
	/** @typedef {Map<import('#compiler').RegularElement, NodeExistsValue>} NodeMap */

	/** @type {NodeMap} */
	const result = new Map();
	if (block.type === 'EachBlock') {
		/** @type {NodeMap} */
		const each_result = loop_child(block.body.nodes, adjacent_only);

		/** @type {NodeMap} */
		const else_result = block.fallback
			? loop_child(block.fallback.nodes, adjacent_only)
			: new Map();
		const not_exhaustive = !has_definite_elements(else_result);
		if (not_exhaustive) {
			mark_as_probably(each_result);
			mark_as_probably(else_result);
		}
		add_to_map(each_result, result);
		add_to_map(else_result, result);
	} else if (block.type === 'IfBlock') {
		/** @type {NodeMap} */
		const if_result = loop_child(block.consequent.nodes, adjacent_only);

		/** @type {NodeMap} */
		const else_result = block.alternate
			? loop_child(block.alternate.nodes, adjacent_only)
			: new Map();
		const not_exhaustive = !has_definite_elements(if_result) || !has_definite_elements(else_result);
		if (not_exhaustive) {
			mark_as_probably(if_result);
			mark_as_probably(else_result);
		}
		add_to_map(if_result, result);
		add_to_map(else_result, result);
	} else if (block.type === 'AwaitBlock') {
		/** @type {NodeMap} */
		const pending_result = block.pending
			? loop_child(block.pending.nodes, adjacent_only)
			: new Map();

		/** @type {NodeMap} */
		const then_result = block.then ? loop_child(block.then.nodes, adjacent_only) : new Map();

		/** @type {NodeMap} */
		const catch_result = block.catch ? loop_child(block.catch.nodes, adjacent_only) : new Map();
		const not_exhaustive =
			!has_definite_elements(pending_result) ||
			!has_definite_elements(then_result) ||
			!has_definite_elements(catch_result);
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

/**
 * @param {Map<import('#compiler').RegularElement, NodeExistsValue>} result
 * @returns {boolean}
 */
function has_definite_elements(result) {
	if (result.size === 0) return false;
	for (const exist of result.values()) {
		if (exist === NodeExist.Definitely) {
			return true;
		}
	}
	return false;
}

/**
 * @param {Map<import('#compiler').RegularElement, NodeExistsValue>} from
 * @param {Map<import('#compiler').RegularElement, NodeExistsValue>} to
 * @returns {void}
 */
function add_to_map(from, to) {
	from.forEach((exist, element) => {
		to.set(element, higher_existence(exist, to.get(element)));
	});
}

/**
 * @param {NodeExistsValue | undefined} exist1
 * @param {NodeExistsValue | undefined} exist2
 * @returns {NodeExistsValue}
 */
function higher_existence(exist1, exist2) {
	// @ts-expect-error TODO figure out if this is a bug
	if (exist1 === undefined || exist2 === undefined) return exist1 || exist2;
	return exist1 > exist2 ? exist1 : exist2;
}

/** @param {Map<import('#compiler').RegularElement, NodeExistsValue>} result */
function mark_as_probably(result) {
	for (const key of result.keys()) {
		result.set(key, NodeExist.Probably);
	}
}

/**
 * @param {import('#compiler').SvelteNode[]} children
 * @param {boolean} adjacent_only
 */
function loop_child(children, adjacent_only) {
	/** @type {Map<import('#compiler').RegularElement, NodeExistsValue>} */
	const result = new Map();
	for (let i = children.length - 1; i >= 0; i--) {
		const child = children[i];
		if (child.type === 'RegularElement') {
			result.set(child, NodeExist.Definitely);
			if (adjacent_only) {
				break;
			}
		} else if (
			child.type === 'EachBlock' ||
			child.type === 'IfBlock' ||
			child.type === 'AwaitBlock'
		) {
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
	/** @type {boolean} */
	host;

	/** @type {boolean} */
	root;

	/** @type {import('#compiler').Css.Combinator | null} */
	combinator;

	/** @type {import('#compiler').Css.SimpleSelector[]} */
	selectors;

	/** @type {number} */
	start;

	/** @type {number} */
	end;

	/** @type {boolean} */
	should_encapsulate;

	/** @param {import('#compiler').Css.Combinator | null} combinator */
	constructor(combinator) {
		this.combinator = combinator;
		this.host = false;
		this.root = false;
		this.selectors = [];
		this.start = -1;
		this.end = -1;
		this.should_encapsulate = false;
	}

	/** @param {import('#compiler').Css.SimpleSelector} selector */
	add(selector) {
		if (this.selectors.length === 0) {
			this.start = selector.start;
			this.host = selector.type === 'PseudoClassSelector' && selector.name === 'host';
		}
		this.root = this.root || (selector.type === 'PseudoClassSelector' && selector.name === 'root');
		this.selectors.push(selector);
		this.end = selector.end;
	}
	get global() {
		return (
			this.selectors.length >= 1 &&
			this.selectors[0].type === 'PseudoClassSelector' &&
			this.selectors[0].name === 'global' &&
			this.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			)
		);
	}
}

/** @param {import('#compiler').Css.Selector} selector */
function group_selectors(selector) {
	let block = new Block(null);
	const blocks = [block];

	selector.children.forEach((child) => {
		if (child.type === 'Combinator') {
			block = new Block(child);
			blocks.push(block);
		} else {
			block.add(child);
		}
	});
	return blocks;
}
