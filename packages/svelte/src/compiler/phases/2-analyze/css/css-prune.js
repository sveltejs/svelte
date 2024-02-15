import { walk } from 'zimmerframe';
import { get_possible_values } from './utils.js';
import { regex_ends_with_whitespace, regex_starts_with_whitespace } from '../../patterns.js';

/**
 * @typedef {{
 *   stylesheet: import('#compiler').Css.StyleSheet;
 *   element: import('#compiler').RegularElement | import('#compiler').SvelteElement;
 * }} State
 */
/** @typedef {typeof NodeExist[keyof typeof NodeExist]} NodeExistsValue */

const NO_MATCH = 'NO_MATCH';
const POSSIBLE_MATCH = 'POSSIBLE_MATCH';
const UNKNOWN_SELECTOR = 'UNKNOWN_SELECTOR';

const NodeExist = /** @type {const} */ ({
	Probably: 0,
	Definitely: 1
});

const whitelist_attribute_selector = new Map([
	['details', ['open']],
	['dialog', ['open']]
]);

/**
 *
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 */
export function prune(stylesheet, element) {
	/** @type {State} */
	const state = { stylesheet, element };

	walk(stylesheet, state, visitors);
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, State>} */
const visitors = {
	ComplexSelector(node, context) {
		context.next();

		const i = node.children.findLastIndex((child) => {
			return !child.metadata.is_global && !child.metadata.is_host && !child.metadata.is_root;
		});

		const relative_selectors = node.children.slice(0, i + 1);

		if (apply_selector(relative_selectors, context.state.element, context.state.stylesheet)) {
			node.metadata.used = true;
		}
	},
	RelativeSelector(node, context) {
		// for now, don't visit children (i.e. inside `:foo(...)`)
		// this will likely change when we implement `:is(...)` etc
	}
};

/**
 * @param {import('#compiler').Css.RelativeSelector[]} relative_selectors
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} element
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @returns {boolean}
 */
function apply_selector(relative_selectors, element, stylesheet) {
	if (!element) {
		return relative_selectors.every(({ metadata }) => metadata.is_global || metadata.is_host);
	}

	const relative_selector = relative_selectors.pop();
	if (!relative_selector) return false;

	const applies = relative_selector_might_apply_to_node(relative_selector, element);

	if (applies === NO_MATCH) {
		return false;
	}

	/**
	 * Mark both the compound selector and the node it selects as encapsulated,
	 * for transformation in a later step
	 * @param {import('#compiler').Css.RelativeSelector} relative_selector
	 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
	 */
	function mark(relative_selector, element) {
		relative_selector.metadata.scoped = true;
		element.metadata.scoped = true;
		return true;
	}

	if (applies === UNKNOWN_SELECTOR) {
		return mark(relative_selector, element);
	}

	if (relative_selector.combinator) {
		if (
			relative_selector.combinator.type === 'Combinator' &&
			relative_selector.combinator.name === ' '
		) {
			for (const ancestor_selector of relative_selectors) {
				if (ancestor_selector.metadata.is_global) {
					continue;
				}

				if (ancestor_selector.metadata.is_host) {
					return mark(relative_selector, element);
				}

				/** @type {import('#compiler').RegularElement | import('#compiler').SvelteElement | null} */
				let parent = element;
				let matched = false;
				while ((parent = get_element_parent(parent))) {
					if (relative_selector_might_apply_to_node(ancestor_selector, parent) !== NO_MATCH) {
						mark(ancestor_selector, parent);
						matched = true;
					}
				}

				if (matched) {
					return mark(relative_selector, element);
				}
			}

			if (relative_selectors.every((relative_selector) => relative_selector.metadata.is_global)) {
				return mark(relative_selector, element);
			}

			return false;
		}

		if (relative_selector.combinator.name === '>') {
			const has_global_parent = relative_selectors.every(
				(relative_selector) => relative_selector.metadata.is_global
			);

			if (
				has_global_parent ||
				apply_selector(relative_selectors, get_element_parent(element), stylesheet)
			) {
				return mark(relative_selector, element);
			}

			return false;
		}

		if (relative_selector.combinator.name === '+' || relative_selector.combinator.name === '~') {
			const siblings = get_possible_element_siblings(
				element,
				relative_selector.combinator.name === '+'
			);

			let has_match = false;
			// NOTE: if we have :global(), we couldn't figure out what is selected within `:global` due to the
			// css-tree limitation that does not parse the inner selector of :global
			// so unless we are sure there will be no sibling to match, we will consider it as matched
			const has_global = relative_selectors.some(
				(relative_selector) => relative_selector.metadata.is_global
			);

			if (has_global) {
				if (siblings.size === 0 && get_element_parent(element) !== null) {
					return false;
				}
				return mark(relative_selector, element);
			}

			for (const possible_sibling of siblings.keys()) {
				if (apply_selector(relative_selectors.slice(), possible_sibling, stylesheet)) {
					mark(relative_selector, element);
					has_match = true;
				}
			}

			return has_match;
		}

		// TODO other combinators
		return mark(relative_selector, element);
	}

	return mark(relative_selector, element);
}

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * @param {import('#compiler').Css.RelativeSelector} relative_selector
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @returns {NO_MATCH | POSSIBLE_MATCH | UNKNOWN_SELECTOR}
 */
function relative_selector_might_apply_to_node(relative_selector, node) {
	if (relative_selector.metadata.is_host || relative_selector.metadata.is_root) return NO_MATCH;

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
				!whitelisted?.includes(selector.name.toLowerCase()) &&
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
