import { get_possible_values } from './utils.js';
import { regex_starts_with_whitespace, regex_ends_with_whitespace } from '../phases/patterns.js';
import { error } from '../errors.js';
import { Stylesheet, Rule } from './Stylesheet.js';

const NO_MATCH = 'NO_MATCH';
const POSSIBLE_MATCH = 'POSSIBLE_MATCH';
const UNKNOWN_SELECTOR = 'UNKNOWN_SELECTOR';

const NodeExist = /** @type {const} */ ({
	Probably: 0,
	Definitely: 1
});

/**
 * @typedef {typeof NodeExist[keyof typeof NodeExist]} NodeExistsValue
 * @typedef {import("#compiler").Css.SimpleSelector & { use_wrapper: { used: boolean }, visible: boolean }} SimpleSelectorWithData
 * */

const whitelist_attribute_selector = new Map([
	['details', new Set(['open'])],
	['dialog', new Set(['open'])]
]);

export class ComplexSelector {
	/** @type {import('#compiler').Css.ComplexSelector} */
	node;

	/** @type {Stylesheet} */
	stylesheet;

	/** @type {RelativeSelector[][]} */
	selector_list;

	/** @type {RelativeSelector[][]} */
	local_selector_list;

	used = false;

	/**
	 * @param {import('#compiler').Css.ComplexSelector} node
	 * @param {Stylesheet} stylesheet
	 * @param {Rule} rule
	 */
	constructor(node, stylesheet, rule) {
		this.node = node;
		this.stylesheet = stylesheet;

		this.selector_list = group_selectors(node, rule);

		this.local_selector_list = this.selector_list.map((complex_selector) => {
			const i = complex_selector.findLastIndex((block) => !block.can_ignore());
			return complex_selector.slice(0, i + 1);
		});

		// if we have a `:root {...}` or `:global(...) {...}` selector, we need to mark
		// this selector as `used` even if the component doesn't contain any nodes
		this.used = this.local_selector_list.some((blocks) => blocks.length === 0);
	}

	/**
	 * Determines whether the given selector potentially applies to `node` —
	 * if so, marks both the selector and the node as encapsulated
	 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node - The node to apply the selector to.
	 * @returns {void}
	 */
	apply(node) {
		for (const complex_selector of this.local_selector_list) {
			if (apply_selector(complex_selector.slice(), node, this.stylesheet)) {
				this.used = true;
			}
		}
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} modifier
	 */
	transform(code, modifier) {
		/** @param {import('#compiler').Css.SimpleSelector} selector */
		function remove_global_pseudo_class(selector) {
			code
				.remove(selector.start, selector.start + ':global('.length)
				.remove(selector.end - 1, selector.end);
		}

		/**
		 * @param {RelativeSelector} relative_selector
		 * @param {string} modifier
		 */
		function encapsulate_block(relative_selector, modifier) {
			for (const selector of relative_selector.compound.selectors) {
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					remove_global_pseudo_class(selector);
				}
			}

			let i = relative_selector.compound.selectors.length;

			let first_selector = relative_selector.compound.selectors[0];
			if (first_selector.type === 'TypeSelector' && !first_selector.visible) return;

			while (i--) {
				const selector = relative_selector.compound.selectors[i];

				if (selector.use_wrapper.used) break;

				selector.use_wrapper.used = true;

				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') {
					if (!relative_selector.root && !relative_selector.host) {
						if (i === 0) code.prependRight(selector.start, modifier);
					}
					continue;
				}

				if (selector.type === 'TypeSelector' && selector.name === '*') {
					code.update(selector.start, selector.end, modifier);
				} else {
					code.appendLeft(selector.end, modifier);
				}

				break;
			}
		}

		for (const complex_selector of this.selector_list) {
			// We must wrap modifier with :where if the first selector is invisible (part of a nested rule)
			let is_first_invisible_selector = complex_selector[0].contains_invisible_selectors;
			let contains_any_invisible_selectors = complex_selector.some(
				(relative_selector) => relative_selector.contains_invisible_selectors
			);
			let first = contains_any_invisible_selectors ? is_first_invisible_selector : true;
			for (const relative_selector of complex_selector) {
				if (relative_selector.global) {
					// Remove the global pseudo class from the selector
					remove_global_pseudo_class(relative_selector.compound.selectors[0]);
				}

				if (relative_selector.should_encapsulate) {
					// for the first occurrence, we use a classname selector, so that every
					// encapsulated selector gets a +0-1-0 specificity bump. thereafter,
					// we use a `:where` selector, which does not affect specificity
					encapsulate_block(relative_selector, first ? modifier : `:where(${modifier})`);
					first = false;
				}
			}
		}
	}

	/** @param {import('../phases/types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.validate_global_placement();
		this.validate_global_with_multiple_selectors();
		this.validate_global_compound_selector();
		this.validate_invalid_combinator_without_selector(analysis);
	}

	validate_global_placement() {
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

	/** @param {import('../phases/types.js').ComponentAnalysis} analysis */
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
									.some(
										(s) => s.type !== 'PseudoElementSelector' && s.type !== 'PseudoClassSelector'
									))
						) {
							error(selector, 'invalid-css-global-selector-list');
						}
					}
				}
			}
		}
	}
}

/**
 * @param {RelativeSelector[]} relative_selectors
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} node
 * @param {Stylesheet} stylesheet
 * @returns {boolean}
 */
function apply_selector(relative_selectors, node, stylesheet) {
	const relative_selector = relative_selectors.pop();
	if (!relative_selector) return false;
	if (!node) {
		return (
			(relative_selector.global &&
				relative_selectors.every((relative_selector) => relative_selector.global)) ||
			(relative_selector.host && relative_selectors.length === 0)
		);
	}
	const applies = block_might_apply_to_node(relative_selector, node);

	if (applies === NO_MATCH) {
		return false;
	}

	/**
	 * Mark both the compound selector and the node it selects as encapsulated,
	 * for transformation in a later step
	 * @param {RelativeSelector} relative_selector
	 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
	 */
	function mark(relative_selector, node) {
		relative_selector.should_encapsulate = true;
		stylesheet.nodes_with_css_class.add(node);
		return true;
	}

	if (applies === UNKNOWN_SELECTOR) {
		return mark(relative_selector, node);
	}

	if (relative_selector.combinator) {
		if (
			relative_selector.combinator.type === 'Combinator' &&
			relative_selector.combinator.name === ' '
		) {
			for (const ancestor_block of relative_selectors) {
				if (ancestor_block.global) {
					continue;
				}

				if (ancestor_block.host) {
					return mark(relative_selector, node);
				}

				/** @type {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} */
				let parent = node;
				let matched = false;
				while ((parent = get_element_parent(parent))) {
					if (block_might_apply_to_node(ancestor_block, parent) !== NO_MATCH) {
						mark(ancestor_block, parent);
						matched = true;
					}
				}
				if (matched) {
					return mark(relative_selector, node);
				}
			}

			if (relative_selectors.every((relative_selector) => relative_selector.global)) {
				return mark(relative_selector, node);
			}

			return false;
		} else if (relative_selector.combinator.name === '>') {
			const has_global_parent = relative_selectors.every(
				(relative_selector) => relative_selector.global
			);
			if (
				has_global_parent ||
				apply_selector(relative_selectors, get_element_parent(node), stylesheet)
			) {
				return mark(relative_selector, node);
			}

			return false;
		} else if (
			relative_selector.combinator.name === '+' ||
			relative_selector.combinator.name === '~'
		) {
			const siblings = get_possible_element_siblings(
				node,
				relative_selector.combinator.name === '+'
			);
			let has_match = false;

			// NOTE: if we have :global(), we couldn't figure out what is selected within `:global` due to the
			// css-tree limitation that does not parse the inner selector of :global
			// so unless we are sure there will be no sibling to match, we will consider it as matched
			const has_global = relative_selectors.some((relative_selector) => relative_selector.global);
			if (has_global) {
				if (siblings.size === 0 && get_element_parent(node) !== null) {
					return false;
				}
				return mark(relative_selector, node);
			}

			for (const possible_sibling of siblings.keys()) {
				if (apply_selector(relative_selectors.slice(), possible_sibling, stylesheet)) {
					mark(relative_selector, node);
					has_match = true;
				}
			}

			return has_match;
		}

		// TODO other combinators
		return mark(relative_selector, node);
	}

	return mark(relative_selector, node);
}

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * @param {RelativeSelector} relative_selector
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {NO_MATCH | POSSIBLE_MATCH | UNKNOWN_SELECTOR}
 */
function block_might_apply_to_node(relative_selector, node) {
	if (relative_selector.host || relative_selector.root) return NO_MATCH;

	let i = relative_selector.compound.selectors.length;
	while (i--) {
		const selector = relative_selector.compound.selectors[i];

		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		if (selector.type === 'PseudoClassSelector' && (name === 'host' || name === 'root')) {
			return NO_MATCH;
		}
		if (
			relative_selector.compound.selectors.length === 1 &&
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
 * @param {import('#compiler').EachBlock | import('#compiler').IfBlock | import('#compiler').AwaitBlock} relative_selector
 * @param {boolean} adjacent_only
 * @returns {Map<import('#compiler').RegularElement, NodeExistsValue>}
 */
function get_possible_last_child(relative_selector, adjacent_only) {
	/** @typedef {Map<import('#compiler').RegularElement, NodeExistsValue>} NodeMap */

	/** @type {NodeMap} */
	const result = new Map();
	if (relative_selector.type === 'EachBlock') {
		/** @type {NodeMap} */
		const each_result = loop_child(relative_selector.body.nodes, adjacent_only);

		/** @type {NodeMap} */
		const else_result = relative_selector.fallback
			? loop_child(relative_selector.fallback.nodes, adjacent_only)
			: new Map();
		const not_exhaustive = !has_definite_elements(else_result);
		if (not_exhaustive) {
			mark_as_probably(each_result);
			mark_as_probably(else_result);
		}
		add_to_map(each_result, result);
		add_to_map(else_result, result);
	} else if (relative_selector.type === 'IfBlock') {
		/** @type {NodeMap} */
		const if_result = loop_child(relative_selector.consequent.nodes, adjacent_only);

		/** @type {NodeMap} */
		const else_result = relative_selector.alternate
			? loop_child(relative_selector.alternate.nodes, adjacent_only)
			: new Map();
		const not_exhaustive = !has_definite_elements(if_result) || !has_definite_elements(else_result);
		if (not_exhaustive) {
			mark_as_probably(if_result);
			mark_as_probably(else_result);
		}
		add_to_map(if_result, result);
		add_to_map(else_result, result);
	} else if (relative_selector.type === 'AwaitBlock') {
		/** @type {NodeMap} */
		const pending_result = relative_selector.pending
			? loop_child(relative_selector.pending.nodes, adjacent_only)
			: new Map();

		/** @type {NodeMap} */
		const then_result = relative_selector.then
			? loop_child(relative_selector.then.nodes, adjacent_only)
			: new Map();

		/** @type {NodeMap} */
		const catch_result = relative_selector.catch
			? loop_child(relative_selector.catch.nodes, adjacent_only)
			: new Map();
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

	can_ignore() {
		return this.compound.global || this.compound.host || this.compound.root;
	}

	get global() {
		return this.compound.global;
	}

	get host() {
		return this.compound.host;
	}

	get root() {
		return this.compound.root;
	}

	get contains_invisible_selectors() {
		return this.compound.selectors.some((selector) => !selector.visible);
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
		this.host = false;
		this.root = false;
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
			this.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			)
		);
	}
}

/**
 * Groups selectors and inserts parent blocks into nested rules.
 *
 * @param {import('#compiler').Css.ComplexSelector} selector - The selector to group and analyze.
 * @param {Rule} rule
 * @returns {RelativeSelector[][]} - The grouped selectors with parent's blocks inserted if nested.
 */
function group_selectors(selector, rule) {
	// TODO this logic isn't quite right, as it doesn't properly account for atrules
	if (rule.parent instanceof Rule) {
		const parent_selector_list = rule.parent.selectors
			.map((selector) => selector.selector_list)
			.flat();

		return parent_selector_list.map((parent_complex_selector) => {
			return selector_to_blocks(
				[...selector.children],
				[...parent_complex_selector] // Clone the parent's blocks to avoid modifying the original array
			);
		});
	}

	return [selector_to_blocks([...selector.children], null)];
}

/**
 * @param {import('#compiler').Css.ComplexSelector["children"]} children
 * @param {RelativeSelector[] | null} parent_complex_selector - The parent rule's selectors to insert/swap into the nesting selector positions.
 */
function selector_to_blocks(children, parent_complex_selector) {
	let block = new RelativeSelector(null, new CompoundSelector());
	const blocks = [block];

	// If this is a nested rule
	if (parent_complex_selector) nest_fake_parents(children, parent_complex_selector);

	for (const child of children) {
		if (child.type === 'Combinator') {
			block = new RelativeSelector(child, new CompoundSelector());
			blocks.push(block);
		} else if (child.type === 'NestingSelector') {
			if (!parent_complex_selector) {
				error(child, 'nesting-selector-not-allowed');
			} else {
				// We shoudld've already handled these above (except for multiple nesting selectors, which is supposed to work?)
				throw new Error('Unexpected nesting selector');
			}
		} else {
			// shared reference bween all children
			child.use_wrapper = child.use_wrapper ?? { used: false };

			// Shallow copy the child to avoid modifying the original's visibility
			block.add(
				/** @type {SimpleSelectorWithData} */ ({
					...child,
					visible: child.visible === undefined ? true : child.visible
				})
			);
		}
	}

	return blocks;
}

/**
 * @param {RelativeSelector[]} parent_complex_selector - The parent blocks to insert into the nesting selector positions.
 * @returns {import('#compiler').Css.ComplexSelector["children"]} - The parent selectors to insert into the nesting selector positions.
 */
function get_parent_selectors(parent_complex_selector) {
	const parent_selectors = [];
	for (const relative_selector of parent_complex_selector) {
		if (relative_selector.combinator) {
			parent_selectors.push(relative_selector.combinator);
		}
		parent_selectors.push(
			...relative_selector.compound.selectors.map((selector) => ({
				...selector,
				visible: false
			}))
		);
	}
	return parent_selectors;
}

/**
 * Nest the parent selectors into the children array so we can easily
 * check for usage and scoping.
 *
 * Some cases:
 * b { c { color: red }} -> need to insert ' ' before c, so output needs to look like [b, " ", c]
 * b { & c { color: red }} -> already has a child combinator before c, so output needs to look like [b, " ", c]
 * b { & > c { color: red }} -> next combinator is '>' so output needs to look like [b, >, c]
 * b { c & { color: red }} -> so we need to insert ' ' after c so children needs to look like [c, " ",b]
 * .x { & { color: red }} -> no combinator, so children needs to look like .x.x
 *
 * @param {import('#compiler').Css.ComplexSelector["children"]} children
 * @param {RelativeSelector[]} parent_complex_selector - The parent blocks to insert into the nesting selector positions.
 */
function nest_fake_parents(children, parent_complex_selector) {
	const nested_selector_indexes = children.reduce((indexes, child, index) => {
		if (child.type === 'NestingSelector') {
			indexes.push(index);
		}
		return indexes;
	}, /** @type {number[]} */ ([]));

	let used_ampersand = nested_selector_indexes.length !== 0;

	if (!used_ampersand) {
		// insert the parent selectors at the beginning of the children array
		nested_selector_indexes.push(0);
		// If there are no nesting selectors and the next item is not a combinator
		// we need to insert a fake combinator because:
		// a { b { color: red }} is equivalent to a { & b { color: red }}
		// however a { + b { color: red }} is not equivalent to a [ "&", " ", "+", "b" ] { color: red }}
		if (children[0].type !== 'Combinator') {
			children.unshift(FakeCombinator);
		}
		children.unshift({ type: 'NestingSelector', name: '&', start: -1, end: -1 });
	}

	/** @type typeof children */
	const parent_selectors = get_parent_selectors(parent_complex_selector);

	// Insert the parent selectors into the children array in reverse order (so we don't mess up the indexes)
	for (const nested_selector_index of nested_selector_indexes.reverse()) {
		children.splice(nested_selector_index, 1, ...parent_selectors);
	}
}
