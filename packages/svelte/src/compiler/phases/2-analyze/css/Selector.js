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

/**
 * @typedef {typeof NodeExist[keyof typeof NodeExist]} NodeExistsValue
 * @typedef {Array<RelativeSelector>} ComplexSelector
 * @typedef {Array<ComplexSelector>} SelectorList
 * @typedef {import("#compiler").Css.SimpleSelector & { use_wrapper: { used: boolean }, visible: boolean }} SimpleSelectorWithData
 * */

const whitelist_attribute_selector = new Map([
	['details', new Set(['open'])],
	['dialog', new Set(['open'])]
]);

export default class Selector {
	/** @type {import('#compiler').Css.Selector} */
	node;

	/** @type {import('./Stylesheet.js').default} */
	stylesheet;

	/** @type {SelectorList} */
	selector_list;

	/** @type {SelectorList} */
	local_selector_list;

	/** @type {boolean} */
	used;

	/**
	 * @param {import('#compiler').Css.Selector} node
	 * @param {import('./Stylesheet.js').default} stylesheet
	 * @param {ComplexSelector[] | null} parent_selector_list
	 */
	constructor(node, stylesheet, parent_selector_list) {
		this.node = node;
		this.stylesheet = stylesheet;
		this.selector_list = group_selectors(node, parent_selector_list);

		this.used = false;

		// Initialize local_selector_list
		this.local_selector_list = [];

		// Process each block group to take trailing :global(...) selectors out of consideration
		this.selector_list.forEach(complex_selector => {
			let i = complex_selector.length;
			while (i > 0) {
				if (!complex_selector[i - 1].global) break;
				i -= 1;
			}
			// Add the processed group (with global selectors removed) to local_selector_list
			this.local_selector_list.push(complex_selector.slice(0, i));
		});

		// Determine `used` based on the processed local_selector_list
		let host_only = false;
		let root_only = false;

		// Check if there's exactly one group and one block within that group, and if it's host or root
		if (this.local_selector_list.length === 1 && this.local_selector_list[0].length === 1) {
			const single_block = this.local_selector_list[0][0];
			host_only = single_block.compound.host;
			root_only = single_block.compound.root;
		}

		// Check if there are no local blocks across all groups, or if there's a host_only or root_only situation
		const no_local_blocks = this.local_selector_list.every(group => group.length === 0);
		this.used = no_local_blocks || host_only || root_only;
	}
	/**
	 * Determines whether the given selector is used within the component's nodes
	 * and marks the corresponding blocks for encapsulation if so.
	 *
	 * In CSS nesting, the selector might be used in one nested rule, but not in another
	 * e.g:
	 * ```css
	 * a, b {
	 *  c {
	 *   color: red;
	 * }
	 * ```
	 *
	 * ```svelte
	 * <a>
	 * 	<c>...</c>
	 * </a>
	 * <b>
	 *  No 'c' here
	 * </b>
	 * ```
	 *
	 * In the above example, the selector `a c` is used, but `b c` is not.
	 * We should mark it for encapsulation as a result.
	 *
	 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node - The node to apply the selector to.
	 * @returns {void}
	 */
	apply(node) {
		/**
		 * Create a map of blocks to their nodes to know whether they should be encapsulated
		 * @type {Map<RelativeSelector, Set<import('#compiler').RegularElement | import('#compiler').SvelteElement>>}
		 * */
		const used_blocks = new Map();

		this.local_selector_list.map(complex_selector => apply_selector(complex_selector.slice(), node, used_blocks));

		// Iterate over used_blocks
		for (const [relative_selector, nodes] of used_blocks) {
			relative_selector.should_encapsulate = true;
			for (const node of nodes) {
				this.stylesheet.nodes_with_css_class.add(node);
			}
			this.used = true;
		}
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} attr
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, attr, max_amount_class_specificity_increased) {
		/** @param {import('#compiler').Css.SimpleSelector} selector */
		function remove_global_pseudo_class(selector) {
			code
				.remove(selector.start, selector.start + ':global('.length)
				.remove(selector.end - 1, selector.end);
		}

		/**
		 * @param {RelativeSelector} relative_selector
		 * @param {string} attr
		 */
		function encapsulate_block(relative_selector, attr) {
			for (const selector of relative_selector.compound.selectors) {
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					remove_global_pseudo_class(selector);
				}
			}

			let i = relative_selector.compound.selectors.length;

			while (i--) {
				const selector = relative_selector.compound.selectors[i];

				if (!selector.visible) continue
				if (selector.use_wrapper.used) continue;

				selector.use_wrapper.used = true;

				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') {
					// console.log("PseudoElementSelector or PseudoClassSelector", selector)
					if (!relative_selector.root && !relative_selector.host) {
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
		};

		for (const complex_selector of this.selector_list) {
			let amount_class_specificity_to_increase =
				max_amount_class_specificity_increased - complex_selector
					.filter(selector => selector.should_encapsulate)
					// .filter(selector => !selector.contains_invisible_selectors)
					// .filter(selector => !selector.compound.selectors[0].use_wrapper.used)
					.length;

			complex_selector.map((relative_selector, index) => {
				if (relative_selector.global) {
					// Remove the global pseudo class from the selector
					remove_global_pseudo_class(relative_selector.compound.selectors[0]);
				}

				if(relative_selector.should_encapsulate) {
					encapsulate_block(
						relative_selector,
						index === complex_selector
							.filter(selector => !selector.contains_invisible_selectors)
							// .filter(selector => selector.compound.selectors.some(selector => selector.use_wrapper.used))
							.length - 1
							? attr.repeat(amount_class_specificity_to_increase + 1)
							: attr
					);
				}
			});
		}
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.validate_invalid_css_global_placement();
		this.validate_global_with_multiple_selectors();
		this.validate_global_compound_selector();
		this.validate_invalid_combinator_without_selector(analysis);
	}


	validate_invalid_css_global_placement() {
		for (let complex_selector of this.selector_list) {
			let start = 0;
			let end = complex_selector.length;
			for (; start < end; start += 1) {
				if (!complex_selector[start].global) break;
			}
			for (; end > start; end -= 1) {
				if (!complex_selector[end - 1].global) break;
			}
			for (let i = start; i < end; i += 1) {
				if (complex_selector[i].global) {
					error(complex_selector[i].compound.selectors[0], 'invalid-css-global-placement');
				}
			}
		}
	}


	validate_global_with_multiple_selectors() {
		for (const complex_selector of this.selector_list) {
			if (complex_selector.length === 1 && complex_selector[0].compound.selectors.length === 1) {
				// standalone :global() with multiple selectors is OK
				return;
			}
			for (const relative_selector of complex_selector) {
				for (const selector of relative_selector.compound.selectors) {
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
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate_invalid_combinator_without_selector(analysis) {
		for (const complex_selector of this.selector_list) {
			for (const relative_selector of complex_selector) {
				if (relative_selector.compound.selectors.length === 0) {
					error(this.node, 'invalid-css-selector');
				}
			}
		}
	}

	validate_global_compound_selector() {
		for (const group of this.selector_list) {
			for (const relative_selector of group) {
				if (relative_selector.compound.selectors.length === 1) continue;

				for (let i = 0; i < relative_selector.compound.selectors.length; i++) {
					const selector = relative_selector.compound.selectors[i];

					if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
						const child = selector.args?.children[0].children[0];
						if (
							child?.type === 'TypeSelector' &&
							!/[.:#]/.test(child.name[0]) &&
							(i !== 0 ||
								relative_selector.compound.selectors
									.slice(1)
									.some(s => s.type !== 'PseudoElementSelector' && s.type !== 'PseudoClassSelector'))
						) {
							error(selector, 'invalid-css-global-selector-list');
						}
					}
				}
			}
		}
	}

	get_amount_class_specificity_increased() {
		// Is this right? Should we be counting the amount of blocks that are visible?
		// Or should we be counting the amount of selectors that are visible?
		return this.selector_list[0].filter(selector => selector.should_encapsulate).length;
	}

}

/**
 * @param {Map<RelativeSelector, Set<import('#compiler').RegularElement | import('#compiler').SvelteElement>>} map
 * @param {RelativeSelector} block
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 */
function add_node(map, block, node) {
	if (!map.has(block)) {
		map.set(block, new Set());
	}
	map.get(block)?.add(node);
}

/**
 * @param {RelativeSelector[]} blocks
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} node
 * @param {Map<RelativeSelector, Set<import('#compiler').RegularElement | import('#compiler').SvelteElement>>} to_encapsulate
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
		add_node(to_encapsulate, block, node);
		return true;
	}

	if (block.combinator) {
		if (block.combinator.type === 'Combinator' && block.combinator.name === ' ') {
			for (const ancestor_block of blocks) {
				if (ancestor_block.global) {
					continue;
				}
				if (ancestor_block.host) {
					add_node(to_encapsulate, block, node);
					return true;
				}
				/** @type {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} */
				let parent = node;
				while ((parent = get_element_parent(parent))) {
					if (block_might_apply_to_node(ancestor_block, parent) !== NO_MATCH) {
						add_node(to_encapsulate, ancestor_block, parent);
					}
				}
				if (to_encapsulate.size) {
					add_node(to_encapsulate, block, node);
					return true;
				}
			}
			if (blocks.every(block => block.global)) {
				add_node(to_encapsulate, block, node);
				return true;
			}
			return false;
		} else if (block.combinator.name === '>') {
			const has_global_parent = blocks.every((block) => block.global);
			if (has_global_parent || apply_selector(blocks, get_element_parent(node), to_encapsulate)) {
				add_node(to_encapsulate, block, node);
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
				add_node(to_encapsulate, block, node);
				return true;
			}
			for (const possible_sibling of siblings.keys()) {
				if (apply_selector(blocks.slice(), possible_sibling, to_encapsulate)) {
					add_node(to_encapsulate, block, node);
					has_match = true;
				}
			}
			return has_match;
		}
		// TODO other combinators
		add_node(to_encapsulate, block, node);
		return true;
	}
	add_node(to_encapsulate, block, node);
	return true;
}

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * @param {RelativeSelector} block
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {NO_MATCH | POSSIBLE_MATCH | UNKNOWN_SELECTOR}
 */
function block_might_apply_to_node(block, node) {
	if (block.host || block.root) return NO_MATCH;

	let i = block.compound.selectors.length;
	while (i--) {
		const selector = block.compound.selectors[i];

		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		if (selector.type === 'PseudoClassSelector' && (name === 'host' || name === 'root')) {
			return NO_MATCH;
		}
		if (
			block.compound.selectors.length === 1 &&
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


/**
 * Not shared between different Selector instances
 */
class RelativeSelector {
	/** @type {import('#compiler').Css.Combinator | null} */
	combinator;

	/** @type {CompoundSelector} */
	compound;

	/** @type {boolean} */
	should_encapsulate;

	/**
	 * @param {import('#compiler').Css.Combinator | null} combinator
	 * @param {CompoundSelector} compound
	 * */
	constructor(combinator, compound) {
		this.combinator = combinator;
		this.compound = compound;
		this.should_encapsulate = false;
	}

	/** @param {SimpleSelectorWithData} selector */
	add(selector) {
		this.compound.add(selector);
	}

	get global() { return this.compound.global }
	get host() { return this.compound.host }
	get root() { return this.compound.root }
	get end() {return this.compound.end }
	get start() {
		if (this.combinator) return this.combinator.start;
		return this.compound.start;
	}

	get contains_invisible_selectors() {
		return this.compound.selectors.some(selector => !selector.visible);
	}
}

/** @type {import('#compiler').Css.Combinator} */
const FakeCombinator = {
	type: 'Combinator',
	name: ' ',
	start: -1,
	end: -1
};

/**
 * Shared between different Selector instances, so they are
 * not encapsulated multiple times
 **/
class CompoundSelector {
	/** @type {Array<SimpleSelectorWithData>} */
	selectors;

	/** @type {number} */
	start;

	/** @type {number} */
	end;

	/** @type {boolean} */
	host;

	/** @type {boolean} */
	root;

	constructor() {
		this.selectors = [];
		this.start = -1;
		this.end = -1;
		this.host = false
		this.root = false
	}

	/** @param {SimpleSelectorWithData} selector */
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
			this.selectors.every(selector => selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector')
		);
	}
}

/**
 * Groups selectors and inserts parent blocks into nested rules.
 *
 * @param {import('#compiler').Css.Selector} selector - The selector to group and analyze.
 * @param {SelectorList | null} parent_selector_list - The parent blocks group to insert into nested rules.
 * @returns {SelectorList} - The grouped selectors with parent's blocks inserted if nested.
 */
function group_selectors(selector, parent_selector_list) {
	// If it isn't a nested rule, then we add an empty block group
	if (parent_selector_list === null) {
		return [selector_to_blocks([...selector.children], null)];
	}

	return parent_selector_list.map(parent_complex_selector => {
		const block_group = selector_to_blocks(
			[...selector.children],
			[...parent_complex_selector] // Clone the parent's blocks to avoid modifying the original array
		);

		return block_group;
	})
}


/**
 * @param {import('#compiler').Css.Selector["children"]} children
 * @param {ComplexSelector | null} parent_complex_selector - The parent blocks to insert into the nesting selector positions.
 */
function selector_to_blocks(children, parent_complex_selector) {
	let block = new RelativeSelector(null, new CompoundSelector);
	const blocks = [block];

	// If this is a nested rule
	if (parent_complex_selector) {
		let nested_selector_index = children.findIndex(child => child.type === 'NestingSelector');

		if (nested_selector_index === -1) {
			nested_selector_index = 0; // insert the parent selectors at the beginning of the children array
		} else {
			children.splice(nested_selector_index, 1); // remove the nesting selector, so we can insert there
		}

		// Modify the first child after the nesting selector to have a flag disabling attr

		let parent_selectors = []
		for (const relative_selector of parent_complex_selector) {
			if (relative_selector.combinator) parent_selectors.push(relative_selector.combinator);
			parent_selectors.push(
				...relative_selector.compound.selectors.map(selector => ({ ...selector, visible: false}))
			);
		}

		/**
		 * Some cases
		 * b { c { color: red }} -> need to insert ' ' before c, so output needs to look like b c
		 * b { & c { color: red }} -> already has a child combinator before c, so output needs to look like b c
		 * b { & > c { color: red }} -> next combinator is '>' so output needs to look like b > c
		 * b { c & { color: red }} -> so we need to insert ' ' after c so output needs to look like c b
		 */

		// if the first child is a PseudoClass, mark it as invisible
		if (children[nested_selector_index]?.type === 'PseudoClassSelector') {
			/** @type {SimpleSelectorWithData} */ (children[nested_selector_index]).visible = false;
		}

		let first_child_combinator = children[nested_selector_index]?.type === 'Combinator'
			? /** @type {import('#compiler').Css.Combinator} */(children[nested_selector_index])
			: null;

		if (first_child_combinator?.type !== 'Combinator') {
			children.unshift(FakeCombinator); // insert a fake combinator at the beginning
		}

		// Finally, insert the parent selectors into the children array
		children.splice(nested_selector_index, 0, ...parent_selectors);
	}

	// console.log(children)

	for (const child of children) {
		if (child.type === 'Combinator') {
			block = new RelativeSelector(child, new CompoundSelector);
			blocks.push(block);
		} else if (child.type === 'NestingSelector') {
			if (!parent_complex_selector) {
				error(child, 'nesting-selector-not-allowed');
			} else {
				// We've already handled these above
				throw new Error('unexpected nesting selector');
			}
		} else {
			// We want to maintain a reference to the original child, so we can modify it later
			let new_child = /** @type {SimpleSelectorWithData}} */ (child);
			new_child.visible = new_child.visible === undefined ? true : new_child.visible;
			new_child.use_wrapper = new_child.use_wrapper ?? { used: false };
			block.add(new_child);
		}
	}

	return blocks;
}