import { walk } from 'zimmerframe';
import { get_possible_values } from './utils.js';
import { regex_ends_with_whitespace, regex_starts_with_whitespace } from '../../patterns.js';
import { error } from '../../../errors.js';

/**
 * @typedef {{
 *   stylesheet: import('#compiler').Css.StyleSheet;
 *   element: import('#compiler').RegularElement | import('#compiler').SvelteElement;
 * }} State
 */
/** @typedef {NODE_PROBABLY_EXISTS | NODE_DEFINITELY_EXISTS} NodeExistsValue */

const NODE_PROBABLY_EXISTS = 0;
const NODE_DEFINITELY_EXISTS = 1;

const whitelist_attribute_selector = new Map([
	['details', ['open']],
	['dialog', ['open']]
]);

/** @type {import('#compiler').Css.Combinator} */
const descendant_combinator = {
	type: 'Combinator',
	name: ' ',
	start: -1,
	end: -1
};

/** @type {import('#compiler').Css.RelativeSelector} */
const nesting_selector = {
	type: 'RelativeSelector',
	start: -1,
	end: -1,
	combinator: null,
	selectors: [
		{
			type: 'NestingSelector',
			name: '&',
			start: -1,
			end: -1
		}
	],
	metadata: {
		is_global: false,
		is_host: false,
		is_root: false,
		scoped: false
	}
};

/**
 *
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 */
export function prune(stylesheet, element) {
	walk(stylesheet, { stylesheet, element }, visitors);
}

/** @type {import('zimmerframe').Visitors<import('#compiler').Css.Node, State>} */
const visitors = {
	ComplexSelector(node, context) {
		const selectors = truncate(node);
		const inner = selectors[selectors.length - 1];

		if (node.metadata.rule?.metadata.parent_rule) {
			const has_explicit_nesting_selector = selectors.some((selector) =>
				selector.selectors.some((s) => s.type === 'NestingSelector')
			);

			if (!has_explicit_nesting_selector) {
				selectors[0] = {
					...selectors[0],
					combinator: descendant_combinator
				};

				selectors.unshift(nesting_selector);
			}
		}

		if (
			apply_selector(
				selectors,
				/** @type {import('#compiler').Css.Rule} */ (node.metadata.rule),
				context.state.element,
				context.state.stylesheet
			)
		) {
			mark(inner, context.state.element);
			node.metadata.used = true;
		}

		// note: we don't call context.next() here, we only recurse into
		// selectors that don't belong to rules (i.e. inside `:is(...)` etc)
		// when we encounter them below
	}
};

/**
 * Discard trailing `:global(...)` selectors, these are unused for scoping purposes
 * @param {import('#compiler').Css.ComplexSelector} node
 */
function truncate(node) {
	const i = node.children.findLastIndex(({ metadata }) => {
		return !metadata.is_global && !metadata.is_host && !metadata.is_root;
	});

	return node.children.slice(0, i + 1);
}

/**
 * @param {import('#compiler').Css.RelativeSelector[]} relative_selectors
 * @param {import('#compiler').Css.Rule} rule
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @returns {boolean}
 */
function apply_selector(relative_selectors, rule, element, stylesheet) {
	const parent_selectors = relative_selectors.slice();
	const relative_selector = parent_selectors.pop();

	if (!relative_selector) return false;

	const possible_match = relative_selector_might_apply_to_node(
		relative_selector,
		rule,
		element,
		stylesheet
	);

	if (!possible_match) {
		return false;
	}

	if (relative_selector.combinator) {
		const name = relative_selector.combinator.name;

		switch (name) {
			case ' ':
			case '>': {
				let parent = /** @type {import('#compiler').TemplateNode | null} */ (element.parent);

				let parent_matched = false;
				let crossed_component_boundary = false;

				while (parent) {
					if (parent.type === 'Component' || parent.type === 'SvelteComponent') {
						crossed_component_boundary = true;
					}

					if (parent.type === 'RegularElement' || parent.type === 'SvelteElement') {
						if (apply_selector(parent_selectors, rule, parent, stylesheet)) {
							// TODO the `name === ' '` causes false positives, but removing it causes false negatives...
							if (name === ' ' || crossed_component_boundary) {
								mark(parent_selectors[parent_selectors.length - 1], parent);
							}

							parent_matched = true;
						}

						if (name === '>') return parent_matched;
					}

					parent = /** @type {import('#compiler').TemplateNode | null} */ (parent.parent);
				}

				return parent_matched || parent_selectors.every((selector) => is_global(selector, rule));
			}

			case '+':
			case '~': {
				const siblings = get_possible_element_siblings(element, name === '+');

				let sibling_matched = false;

				for (const possible_sibling of siblings.keys()) {
					if (apply_selector(parent_selectors, rule, possible_sibling, stylesheet)) {
						mark(relative_selector, element);
						sibling_matched = true;
					}
				}

				return (
					sibling_matched ||
					(get_element_parent(element) === null &&
						parent_selectors.every((selector) => is_global(selector, rule)))
				);
			}

			default:
				// TODO other combinators
				return true;
		}
	}

	// if this is the left-most non-global selector, mark it — we want
	// `x y z {...}` to become `x.blah y z.blah {...}`
	const parent = parent_selectors[parent_selectors.length - 1];
	if (!parent || is_global(parent, rule)) {
		mark(relative_selector, element);
	}

	return true;
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
}

/**
 * Returns `true` if the relative selector is global, meaning
 * it's a `:global(...)` or `:host` or `:root` selector, or
 * is an `:is(...)` or `:where(...)` selector that contains
 * a global selector
 * @param {import('#compiler').Css.RelativeSelector} selector
 * @param {import('#compiler').Css.Rule} rule
 */
function is_global(selector, rule) {
	if (selector.metadata.is_global || selector.metadata.is_host || selector.metadata.is_root) {
		return true;
	}

	for (const s of selector.selectors) {
		/** @type {import('#compiler').Css.SelectorList | null} */
		let selector_list = null;
		let owner = rule;

		if (s.type === 'PseudoClassSelector') {
			if ((s.name === 'is' || s.name === 'where') && s.args) {
				selector_list = s.args;
			}
		}

		if (s.type === 'NestingSelector') {
			owner = /** @type {import('#compiler').Css.Rule} */ (rule.metadata.parent_rule);
			selector_list = owner.prelude;
		}

		const has_global_selectors = selector_list?.children.some((complex_selector) => {
			return complex_selector.children.every((relative_selector) =>
				is_global(relative_selector, owner)
			);
		});

		if (!has_global_selectors) {
			return false;
		}
	}

	return true;
}

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * Ensure that `element` satisfies each simple selector in `relative_selector`
 *
 * @param {import('#compiler').Css.RelativeSelector} relative_selector
 * @param {import('#compiler').Css.Rule} rule
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @returns {boolean}
 */
function relative_selector_might_apply_to_node(relative_selector, rule, element, stylesheet) {
	for (const selector of relative_selector.selectors) {
		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		switch (selector.type) {
			case 'PseudoClassSelector': {
				if (name === 'host' || name === 'root') {
					return false;
				}

				if (name === 'global' && relative_selector.selectors.length === 1) {
					const args = /** @type {import('#compiler').Css.SelectorList} */ (selector.args);
					const complex_selector = args.children[0];
					return apply_selector(complex_selector.children, rule, element, stylesheet);
				}

				if ((name === 'is' || name === 'where') && selector.args) {
					let matched = false;

					for (const complex_selector of selector.args.children) {
						if (apply_selector(truncate(complex_selector), rule, element, stylesheet)) {
							complex_selector.metadata.used = true;
							matched = true;
						}
					}

					if (!matched) {
						return false;
					}
				}

				break;
			}

			case 'PseudoElementSelector': {
				break;
			}

			case 'AttributeSelector': {
				const whitelisted = whitelist_attribute_selector.get(element.name.toLowerCase());
				if (
					!whitelisted?.includes(selector.name.toLowerCase()) &&
					!attribute_matches(
						element,
						selector.name,
						selector.value && unquote(selector.value),
						selector.matcher,
						selector.flags?.includes('i') ?? false
					)
				) {
					return false;
				}
				break;
			}

			case 'ClassSelector': {
				if (
					!attribute_matches(element, 'class', name, '~=', false) &&
					!element.attributes.some(
						(attribute) => attribute.type === 'ClassDirective' && attribute.name === name
					)
				) {
					return false;
				}

				break;
			}

			case 'IdSelector': {
				if (!attribute_matches(element, 'id', name, '=', false)) {
					return false;
				}

				break;
			}

			case 'TypeSelector': {
				if (
					element.name.toLowerCase() !== name.toLowerCase() &&
					name !== '*' &&
					element.type !== 'SvelteElement'
				) {
					return false;
				}

				break;
			}

			case 'NestingSelector': {
				let matched = false;

				const parent = /** @type {import('#compiler').Css.Rule} */ (rule.metadata.parent_rule);

				for (const complex_selector of parent.prelude.children) {
					if (apply_selector(truncate(complex_selector), parent, element, stylesheet)) {
						complex_selector.metadata.used = true;
						matched = true;
					}
				}

				if (!matched) {
					return false;
				}

				break;
			}
		}
	}

	// possible match
	return true;
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
				result.set(prev, NODE_DEFINITELY_EXISTS);
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
		if (exist === NODE_DEFINITELY_EXISTS) {
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
		result.set(key, NODE_PROBABLY_EXISTS);
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
			result.set(child, NODE_DEFINITELY_EXISTS);
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
