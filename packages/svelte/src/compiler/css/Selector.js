import { get_possible_values } from './utils.js';
import { regex_starts_with_whitespace, regex_ends_with_whitespace } from '../phases/patterns.js';
import { error } from '../errors.js';
import { Stylesheet } from './Stylesheet.js';

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

export class ComplexSelector {
	/** @type {import('#compiler').Css.ComplexSelector} */
	node;

	/** @type {import('./Stylesheet.js').Stylesheet} */
	stylesheet;

	/** @type {RelativeSelector[]} */
	relative_selectors;

	/**
	 * The `relative_selectors`, minus any trailing global selectors
	 * (which includes `:root` and `:host`) since we ignore these
	 * when determining if a selector is used.
	 * @type {RelativeSelector[]}
	 */
	local_relative_selectors;

	used = false;

	/**
	 * @param {import('#compiler').Css.ComplexSelector} node
	 * @param {import('./Stylesheet.js').Stylesheet} stylesheet
	 */
	constructor(node, stylesheet) {
		this.node = node;
		this.stylesheet = stylesheet;

		this.relative_selectors = group_selectors(node);

		// take trailing :global(...) selectors out of consideration
		const i = this.relative_selectors.findLastIndex((s) => !s.can_ignore());
		this.local_relative_selectors = this.relative_selectors.slice(0, i + 1);

		// if we have a `:root {...}` or `:global(...) {...}` selector, we need to mark
		// this selector as `used` even if the component doesn't contain any nodes
		this.used = this.local_relative_selectors.length === 0;
	}

	/** @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node */
	apply(node) {
		if (apply_selector(this.local_relative_selectors.slice(), node, this.stylesheet)) {
			this.used = true;
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
			for (const selector of relative_selector.selectors) {
				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					remove_global_pseudo_class(selector);
				}
			}

			let i = relative_selector.selectors.length;
			while (i--) {
				const selector = relative_selector.selectors[i];

				if (selector.type === 'PseudoElementSelector' || selector.type === 'PseudoClassSelector') {
					if (selector.name !== 'root' && selector.name !== 'host') {
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

		let first = true;
		for (const relative_selector of this.relative_selectors) {
			if (relative_selector.is_global) {
				remove_global_pseudo_class(relative_selector.selectors[0]);
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

	/** @param {import('../phases/types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.validate_global_placement();
		this.validate_global_with_multiple_selectors();
		this.validate_global_compound_selector();
		this.validate_invalid_combinator_without_selector(analysis);
	}

	validate_global_placement() {
		let start = 0;
		let end = this.relative_selectors.length;
		for (; start < end; start += 1) {
			if (!this.relative_selectors[start].is_global) break;
		}
		for (; end > start; end -= 1) {
			if (!this.relative_selectors[end - 1].is_global) break;
		}
		for (let i = start; i < end; i += 1) {
			if (this.relative_selectors[i].is_global) {
				error(this.relative_selectors[i].selectors[0], 'invalid-css-global-placement');
			}
		}
	}

	validate_global_with_multiple_selectors() {
		if (this.relative_selectors.length === 1 && this.relative_selectors[0].selectors.length === 1) {
			// standalone :global() with multiple selectors is OK
			return;
		}
		for (const relative_selector of this.relative_selectors) {
			for (const selector of relative_selector.selectors) {
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

	/** @param {import('../phases/types.js').ComponentAnalysis} analysis */
	validate_invalid_combinator_without_selector(analysis) {
		for (let i = 0; i < this.relative_selectors.length; i++) {
			const relative_selector = this.relative_selectors[i];
			if (relative_selector.selectors.length === 0) {
				error(this.node, 'invalid-css-selector');
			}
		}
	}

	validate_global_compound_selector() {
		for (const relative_selector of this.relative_selectors) {
			if (relative_selector.selectors.length === 1) continue;

			for (let i = 0; i < relative_selector.selectors.length; i++) {
				const selector = relative_selector.selectors[i];

				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					const child = selector.args?.children[0].children[0];
					if (
						child?.type === 'TypeSelector' &&
						!/[.:#]/.test(child.name[0]) &&
						(i !== 0 ||
							relative_selector.selectors
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
			(relative_selector.is_global &&
				relative_selectors.every((relative_selector) => relative_selector.is_global)) ||
			(relative_selector.is_host && relative_selectors.length === 0)
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
				if (ancestor_block.is_global) {
					continue;
				}
				if (ancestor_block.is_host) {
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
			if (relative_selectors.every((relative_selector) => relative_selector.is_global)) {
				return mark(relative_selector, node);
			}
			return false;
		} else if (relative_selector.combinator.name === '>') {
			const has_global_parent = relative_selectors.every(
				(relative_selector) => relative_selector.is_global
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
			const has_global = relative_selectors.some(
				(relative_selector) => relative_selector.is_global
			);
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
	if (relative_selector.is_host || relative_selector.is_root) return NO_MATCH;

	let i = relative_selector.selectors.length;
	while (i--) {
		const selector = relative_selector.selectors[i];

		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		if (selector.type === 'PseudoClassSelector' && (name === 'host' || name === 'root')) {
			return NO_MATCH;
		}
		if (
			relative_selector.selectors.length === 1 &&
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
 * Represents a compound selector (aka an array of simple selectors) plus
 * a preceding combinator (if not the first in the list). Given this...
 *
 * ```css
 * .a + .b.c {...}
 * ```
 *
 * ...both `.a` and `+ .b.c` are relative selectors.
 * Combined, they are a complex selector.
 */
class RelativeSelector {
	/** @type {import('#compiler').Css.Combinator | null} */
	combinator;

	/** @type {import('#compiler').Css.SimpleSelector[]} */
	selectors = [];

	is_host = false;
	is_root = false;
	should_encapsulate = false;
	start = -1;
	end = -1;

	/** @param {import('#compiler').Css.Combinator | null} combinator */
	constructor(combinator) {
		this.combinator = combinator;
	}

	/** @param {import('#compiler').Css.SimpleSelector} selector */
	add(selector) {
		if (this.selectors.length === 0) {
			this.start = selector.start;
			this.is_host = selector.type === 'PseudoClassSelector' && selector.name === 'host';
		}
		this.is_root =
			this.is_root || (selector.type === 'PseudoClassSelector' && selector.name === 'root');
		this.selectors.push(selector);
		this.end = selector.end;
	}

	can_ignore() {
		return this.is_global || this.is_host || this.is_root;
	}

	get is_global() {
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

/** @param {import('#compiler').Css.ComplexSelector} selector */
function group_selectors(selector) {
	let relative_selector = new RelativeSelector(null);
	const relative_selectors = [relative_selector];

	selector.children.forEach((child) => {
		if (child.type === 'Combinator') {
			relative_selector = new RelativeSelector(child);
			relative_selectors.push(relative_selector);
		} else {
			relative_selector.add(child);
		}
	});
	return relative_selectors;
}
