/** @import * as Compiler from '#compiler' */
import { walk } from 'zimmerframe';
import {
	get_parent_rules,
	get_possible_values,
	is_outer_global,
	is_unscoped_pseudo_class
} from './utils.js';
import { regex_ends_with_whitespace, regex_starts_with_whitespace } from '../../patterns.js';
import { get_attribute_chunks, is_text_attribute } from '../../../utils/ast.js';

/** @typedef {NODE_PROBABLY_EXISTS | NODE_DEFINITELY_EXISTS} NodeExistsValue */
/** @typedef {FORWARD | BACKWARD} Direction */

const NODE_PROBABLY_EXISTS = 0;
const NODE_DEFINITELY_EXISTS = 1;
const FORWARD = 0;
const BACKWARD = 1;

const whitelist_attribute_selector = new Map([
	['details', ['open']],
	['dialog', ['open']]
]);

/** @type {Compiler.AST.CSS.Combinator} */
const descendant_combinator = {
	type: 'Combinator',
	name: ' ',
	start: -1,
	end: -1
};

/** @type {Compiler.AST.CSS.RelativeSelector} */
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
		is_global_like: false,
		scoped: false
	}
};

/** @type {Compiler.AST.CSS.RelativeSelector} */
const any_selector = {
	type: 'RelativeSelector',
	start: -1,
	end: -1,
	combinator: null,
	selectors: [
		{
			type: 'TypeSelector',
			name: '*',
			start: -1,
			end: -1
		}
	],
	metadata: {
		is_global: false,
		is_global_like: false,
		scoped: false
	}
};

/**
 * Snippets encountered already (avoids infinite loops)
 * @type {Set<Compiler.AST.SnippetBlock>}
 */
const seen = new Set();

/**
 *
 * @param {Compiler.AST.CSS.StyleSheet} stylesheet
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 */
export function prune(stylesheet, element) {
	walk(/** @type {Compiler.AST.CSS.Node} */ (stylesheet), null, {
		Rule(node, context) {
			if (node.metadata.is_global_block) {
				context.visit(node.prelude);
			} else {
				context.next();
			}
		},
		ComplexSelector(node) {
			const selectors = get_relative_selectors(node);

			seen.clear();

			if (
				apply_selector(
					selectors,
					/** @type {Compiler.AST.CSS.Rule} */ (node.metadata.rule),
					element,
					BACKWARD
				)
			) {
				node.metadata.used = true;
			}

			// note: we don't call context.next() here, we only recurse into
			// selectors that don't belong to rules (i.e. inside `:is(...)` etc)
			// when we encounter them below
		}
	});
}

/**
 * Retrieves the relative selectors (minus the trailing globals) from a complex selector.
 * Also searches them for any existing `&` selectors and adds one if none are found.
 * This ensures we traverse up to the parent rule when the inner selectors match and we're
 * trying to see if the parent rule also matches.
 * @param {Compiler.AST.CSS.ComplexSelector} node
 */
function get_relative_selectors(node) {
	const selectors = truncate(node);

	if (node.metadata.rule?.metadata.parent_rule && selectors.length > 0) {
		let has_explicit_nesting_selector = false;

		// nesting could be inside pseudo classes like :is, :has or :where
		for (let selector of selectors) {
			walk(selector, null, {
				// @ts-ignore
				NestingSelector() {
					has_explicit_nesting_selector = true;
				}
			});

			// if we found one we can break from the others
			if (has_explicit_nesting_selector) break;
		}

		if (!has_explicit_nesting_selector) {
			if (selectors[0].combinator === null) {
				selectors[0] = {
					...selectors[0],
					combinator: descendant_combinator
				};
			}

			selectors.unshift(nesting_selector);
		}
	}

	return selectors;
}

/**
 * Discard trailing `:global(...)` selectors, these are unused for scoping purposes
 * @param {Compiler.AST.CSS.ComplexSelector} node
 */
function truncate(node) {
	const i = node.children.findLastIndex(({ metadata, selectors }) => {
		const first = selectors[0];
		return (
			// not after a :global selector
			!metadata.is_global_like &&
			!(first.type === 'PseudoClassSelector' && first.name === 'global' && first.args === null) &&
			// not a :global(...) without a :has/is/where(...) modifier that is scoped
			!metadata.is_global
		);
	});

	return node.children.slice(0, i + 1).map((child) => {
		// In case of `:root.y:has(...)`, `y` is unscoped, but everything in `:has(...)` should be scoped (if not global).
		// To properly accomplish that, we gotta filter out all selector types except `:has`.
		const root = child.selectors.find((s) => s.type === 'PseudoClassSelector' && s.name === 'root');
		if (!root || child.metadata.is_global_like) return child;

		return {
			...child,
			selectors: child.selectors.filter((s) => s.type === 'PseudoClassSelector' && s.name === 'has')
		};
	});
}

/**
 * @param {Compiler.AST.CSS.RelativeSelector[]} relative_selectors
 * @param {Compiler.AST.CSS.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 * @param {Direction} direction
 * @returns {boolean}
 */
function apply_selector(relative_selectors, rule, element, direction) {
	const rest_selectors = relative_selectors.slice();
	const relative_selector = direction === FORWARD ? rest_selectors.shift() : rest_selectors.pop();

	const matched =
		!!relative_selector &&
		relative_selector_might_apply_to_node(relative_selector, rule, element, direction) &&
		apply_combinator(relative_selector, rest_selectors, rule, element, direction);

	if (matched) {
		if (!is_outer_global(relative_selector)) {
			relative_selector.metadata.scoped = true;
		}

		element.metadata.scoped = true;
	}

	return matched;
}

/**
 * @param {Compiler.AST.CSS.RelativeSelector} relative_selector
 * @param {Compiler.AST.CSS.RelativeSelector[]} rest_selectors
 * @param {Compiler.AST.CSS.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag | Compiler.AST.Component | Compiler.AST.SvelteComponent | Compiler.AST.SvelteSelf} node
 * @param {Direction} direction
 * @returns {boolean}
 */
function apply_combinator(relative_selector, rest_selectors, rule, node, direction) {
	const combinator =
		direction == FORWARD ? rest_selectors[0]?.combinator : relative_selector.combinator;
	if (!combinator) return true;

	switch (combinator.name) {
		case ' ':
		case '>': {
			const is_adjacent = combinator.name === '>';
			const parents =
				direction === FORWARD
					? get_descendant_elements(node, is_adjacent)
					: get_ancestor_elements(node, is_adjacent);
			let parent_matched = false;

			for (const parent of parents) {
				if (apply_selector(rest_selectors, rule, parent, direction)) {
					parent_matched = true;
				}
			}

			return (
				parent_matched ||
				(direction === BACKWARD &&
					(!is_adjacent || parents.length === 0) &&
					rest_selectors.every((selector) => is_global(selector, rule)))
			);
		}

		case '+':
		case '~': {
			const siblings = get_possible_element_siblings(node, direction, combinator.name === '+');

			let sibling_matched = false;

			for (const possible_sibling of siblings.keys()) {
				if (
					possible_sibling.type === 'RenderTag' ||
					possible_sibling.type === 'SlotElement' ||
					possible_sibling.type === 'Component'
				) {
					// `{@render foo()}<p>foo</p>` with `:global(.x) + p` is a match
					if (rest_selectors.length === 1 && rest_selectors[0].metadata.is_global) {
						sibling_matched = true;
					}
				} else if (apply_selector(rest_selectors, rule, possible_sibling, direction)) {
					sibling_matched = true;
				}
			}

			return (
				sibling_matched ||
				(direction === BACKWARD &&
					get_element_parent(node) === null &&
					rest_selectors.every((selector) => is_global(selector, rule)))
			);
		}

		default:
			// TODO other combinators
			return true;
	}
}

/**
 * Returns `true` if the relative selector is global, meaning
 * it's a `:global(...)` or unscopeable selector, or
 * is an `:is(...)` or `:where(...)` selector that contains
 * a global selector
 * @param {Compiler.AST.CSS.RelativeSelector} selector
 * @param {Compiler.AST.CSS.Rule} rule
 * @returns {boolean}
 */
function is_global(selector, rule) {
	if (selector.metadata.is_global || selector.metadata.is_global_like) {
		return true;
	}

	let explicitly_global = false;

	for (const s of selector.selectors) {
		/** @type {Compiler.AST.CSS.SelectorList | null} */
		let selector_list = null;
		let can_be_global = false;
		let owner = rule;

		if (s.type === 'PseudoClassSelector') {
			if ((s.name === 'is' || s.name === 'where') && s.args) {
				selector_list = s.args;
			} else {
				can_be_global = is_unscoped_pseudo_class(s);
			}
		}

		if (s.type === 'NestingSelector') {
			owner = /** @type {Compiler.AST.CSS.Rule} */ (rule.metadata.parent_rule);
			selector_list = owner.prelude;
		}

		const has_global_selectors = !!selector_list?.children.some((complex_selector) => {
			return complex_selector.children.every((relative_selector) =>
				is_global(relative_selector, owner)
			);
		});
		explicitly_global ||= has_global_selectors;

		if (!has_global_selectors && !can_be_global) {
			return false;
		}
	}

	return explicitly_global || selector.selectors.length === 0;
}

const regex_backslash_and_following_character = /\\(.)/g;

/**
 * Ensure that `element` satisfies each simple selector in `relative_selector`
 *
 * @param {Compiler.AST.CSS.RelativeSelector} relative_selector
 * @param {Compiler.AST.CSS.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 * @param {Direction} direction
 * @returns {boolean}
 */
function relative_selector_might_apply_to_node(relative_selector, rule, element, direction) {
	// Sort :has(...) selectors in one bucket and everything else into another
	const has_selectors = [];
	const other_selectors = [];

	for (const selector of relative_selector.selectors) {
		if (selector.type === 'PseudoClassSelector' && selector.name === 'has' && selector.args) {
			has_selectors.push(selector);
		} else {
			other_selectors.push(selector);
		}
	}

	// If we're called recursively from a :has(...) selector, we're on the way of checking if the other selectors match.
	// In that case ignore this check (because we just came from this) to avoid an infinite loop.
	if (has_selectors.length > 0) {
		// If this is a :has inside a global selector, we gotta include the element itself, too,
		// because the global selector might be for an element that's outside the component,
		// e.g. :root:has(.scoped), :global(.foo):has(.scoped), or :root { &:has(.scoped) {} }
		const rules = get_parent_rules(rule);
		const include_self =
			rules.some((r) => r.prelude.children.some((c) => c.children.some((s) => is_global(s, r)))) ||
			rules[rules.length - 1].prelude.children.some((c) =>
				c.children.some((r) =>
					r.selectors.some(
						(s) =>
							s.type === 'PseudoClassSelector' &&
							(s.name === 'root' || (s.name === 'global' && s.args))
					)
				)
			);

		// :has(...) is special in that it means "look downwards in the CSS tree". Since our matching algorithm goes
		// upwards and back-to-front, we need to first check the selectors inside :has(...), then check the rest of the
		// selector in a way that is similar to ancestor matching. In a sense, we're treating `.x:has(.y)` as `.x .y`.
		for (const has_selector of has_selectors) {
			const complex_selectors = /** @type {Compiler.AST.CSS.SelectorList} */ (has_selector.args)
				.children;
			let matched = false;

			for (const complex_selector of complex_selectors) {
				const [first, ...rest] = truncate(complex_selector);
				// if it was just a :global(...)
				if (!first) {
					complex_selector.metadata.used = true;
					matched = true;
					continue;
				}

				if (include_self) {
					const selector_including_self = [
						first.combinator ? { ...first, combinator: null } : first,
						...rest
					];
					if (apply_selector(selector_including_self, rule, element, FORWARD)) {
						complex_selector.metadata.used = true;
						matched = true;
					}
				}

				const selector_excluding_self = [
					any_selector,
					first.combinator ? first : { ...first, combinator: descendant_combinator },
					...rest
				];
				if (apply_selector(selector_excluding_self, rule, element, FORWARD)) {
					complex_selector.metadata.used = true;
					matched = true;
				}
			}

			if (!matched) {
				return false;
			}
		}
	}

	for (const selector of other_selectors) {
		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		switch (selector.type) {
			case 'PseudoClassSelector': {
				if (name === 'host' || name === 'root') return false;

				if (
					name === 'global' &&
					selector.args !== null &&
					relative_selector.selectors.length === 1
				) {
					const args = selector.args;
					const complex_selector = args.children[0];
					return apply_selector(complex_selector.children, rule, element, BACKWARD);
				}

				// We came across a :global, everything beyond it is global and therefore a potential match
				if (name === 'global' && selector.args === null) return true;

				// :not(...) contents should stay unscoped. Scoping them would achieve the opposite of what we want,
				// because they are then _more_ likely to bleed out of the component. The exception is complex selectors
				// with descendants, in which case we scope them all.
				if (name === 'not' && selector.args) {
					for (const complex_selector of selector.args.children) {
						walk(complex_selector, null, {
							ComplexSelector(node, context) {
								node.metadata.used = true;
								context.next();
							}
						});
						const relative = truncate(complex_selector);

						if (complex_selector.children.length > 1) {
							// foo:not(bar foo) means that bar is an ancestor of foo (side note: ending with foo is the only way the selector make sense).
							// We can't fully check if that actually matches with our current algorithm, so we just assume it does.
							// The result may not match a real element, so the only drawback is the missing prune.
							for (const selector of relative) {
								selector.metadata.scoped = true;
							}

							/** @type {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | null} */
							let el = element;
							while (el) {
								el.metadata.scoped = true;
								el = get_element_parent(el);
							}
						}
					}

					break;
				}

				if ((name === 'is' || name === 'where') && selector.args) {
					let matched = false;

					for (const complex_selector of selector.args.children) {
						const relative = truncate(complex_selector);
						const is_global = relative.length === 0;

						if (is_global) {
							complex_selector.metadata.used = true;
							matched = true;
						} else if (apply_selector(relative, rule, element, BACKWARD)) {
							complex_selector.metadata.used = true;
							matched = true;
						} else if (complex_selector.children.length > 1 && (name == 'is' || name == 'where')) {
							// foo :is(bar baz) can also mean that bar is an ancestor of foo, and baz a descendant.
							// We can't fully check if that actually matches with our current algorithm, so we just assume it does.
							// The result may not match a real element, so the only drawback is the missing prune.
							complex_selector.metadata.used = true;
							matched = true;
							for (const selector of relative) {
								selector.metadata.scoped = true;
							}
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

				const parent = /** @type {Compiler.AST.CSS.Rule} */ (rule.metadata.parent_rule);

				for (const complex_selector of parent.prelude.children) {
					if (
						apply_selector(get_relative_selectors(complex_selector), parent, element, direction) ||
						complex_selector.children.every((s) => is_global(s, parent))
					) {
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
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} node
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

		if (is_text_attribute(attribute)) {
			return test_attribute(operator, expected_value, case_insensitive, attribute.value[0].data);
		}

		const chunks = get_attribute_chunks(attribute.value);
		const possible_values = new Set();

		/** @type {string[]} */
		let prev_values = [];
		for (const chunk of chunks) {
			const current_possible_values = get_possible_values(chunk, name === 'class');

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
			if (prev_values.length < current_possible_values.length) {
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
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag | Compiler.AST.Component | Compiler.AST.SvelteComponent | Compiler.AST.SvelteSelf} node
 * @param {boolean} adjacent_only
 * @param {Set<Compiler.AST.SnippetBlock>} seen
 */
function get_ancestor_elements(node, adjacent_only, seen = new Set()) {
	/** @type {Array<Compiler.AST.RegularElement | Compiler.AST.SvelteElement>} */
	const ancestors = [];

	const path = node.metadata.path;
	let i = path.length;

	while (i--) {
		const parent = path[i];

		if (parent.type === 'SnippetBlock') {
			if (!seen.has(parent)) {
				seen.add(parent);

				for (const site of parent.metadata.sites) {
					ancestors.push(...get_ancestor_elements(site, adjacent_only, seen));
				}
			}

			break;
		}

		if (parent.type === 'RegularElement' || parent.type === 'SvelteElement') {
			ancestors.push(parent);
			if (adjacent_only) {
				break;
			}
		}
	}

	return ancestors;
}

/**
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag | Compiler.AST.Component | Compiler.AST.SvelteComponent | Compiler.AST.SvelteSelf} node
 * @param {boolean} adjacent_only
 * @param {Set<Compiler.AST.SnippetBlock>} seen
 */
function get_descendant_elements(node, adjacent_only, seen = new Set()) {
	/** @type {Array<Compiler.AST.RegularElement | Compiler.AST.SvelteElement>} */
	const descendants = [];

	/**
	 * @param {Compiler.AST.SvelteNode} node
	 */
	function walk_children(node) {
		walk(node, null, {
			_(node, context) {
				if (node.type === 'RegularElement' || node.type === 'SvelteElement') {
					descendants.push(node);

					if (!adjacent_only) {
						context.next();
					}
				} else if (node.type === 'RenderTag') {
					for (const snippet of node.metadata.snippets) {
						if (seen.has(snippet)) continue;

						seen.add(snippet);
						walk_children(snippet.body);
					}
				} else {
					context.next();
				}
			}
		});
	}

	walk_children(node.type === 'RenderTag' ? node : node.fragment);

	return descendants;
}

/**
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag | Compiler.AST.Component | Compiler.AST.SvelteComponent | Compiler.AST.SvelteSelf} node
 * @returns {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | null}
 */
function get_element_parent(node) {
	let path = node.metadata.path;
	let i = path.length;

	while (i--) {
		const parent = path[i];

		if (parent.type === 'RegularElement' || parent.type === 'SvelteElement') {
			return parent;
		}
	}

	return null;
}

/**
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag | Compiler.AST.Component | Compiler.AST.SvelteComponent | Compiler.AST.SvelteSelf} node
 * @param {Direction} direction
 * @param {boolean} adjacent_only
 * @param {Set<Compiler.AST.SnippetBlock>} seen
 * @returns {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.SlotElement | Compiler.AST.RenderTag | Compiler.AST.Component, NodeExistsValue>}
 */
function get_possible_element_siblings(node, direction, adjacent_only, seen = new Set()) {
	/** @type {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.SlotElement | Compiler.AST.RenderTag | Compiler.AST.Component, NodeExistsValue>} */
	const result = new Map();
	const path = node.metadata.path;

	/** @type {Compiler.AST.SvelteNode} */
	let current = node;

	let i = path.length;

	while (i--) {
		const fragment = /** @type {Compiler.AST.Fragment} */ (path[i--]);
		let j = fragment.nodes.indexOf(current) + (direction === FORWARD ? 1 : -1);

		while (j >= 0 && j < fragment.nodes.length) {
			const node = fragment.nodes[j];

			if (node.type === 'RegularElement') {
				const has_slot_attribute = node.attributes.some(
					(attr) => attr.type === 'Attribute' && attr.name.toLowerCase() === 'slot'
				);

				if (!has_slot_attribute) {
					result.set(node, NODE_DEFINITELY_EXISTS);

					if (adjacent_only) {
						return result;
					}
				}
				// Special case: slots, render tags and svelte:element tags could resolve to no siblings,
				// so we want to continue until we find a definite sibling even with the adjacent-only combinator
			} else if (is_block(node) || node.type === 'Component') {
				if (node.type === 'SlotElement' || node.type === 'Component') {
					result.set(node, NODE_PROBABLY_EXISTS);
				}

				const possible_last_child = get_possible_nested_siblings(node, direction, adjacent_only);
				add_to_map(possible_last_child, result);
				if (
					adjacent_only &&
					node.type !== 'Component' &&
					has_definite_elements(possible_last_child)
				) {
					return result;
				}
			} else if (node.type === 'SvelteElement') {
				result.set(node, NODE_PROBABLY_EXISTS);
			} else if (node.type === 'RenderTag') {
				result.set(node, NODE_PROBABLY_EXISTS);
				for (const snippet of node.metadata.snippets) {
					add_to_map(get_possible_nested_siblings(snippet, direction, adjacent_only), result);
				}
			}

			j = direction === FORWARD ? j + 1 : j - 1;
		}

		current = path[i];

		if (!current) break;

		if (
			current.type === 'Component' ||
			current.type === 'SvelteComponent' ||
			current.type === 'SvelteSelf'
		) {
			continue;
		}

		if (current.type === 'SnippetBlock') {
			if (seen.has(current)) break;
			seen.add(current);

			for (const site of current.metadata.sites) {
				const siblings = get_possible_element_siblings(site, direction, adjacent_only, seen);
				add_to_map(siblings, result);

				if (adjacent_only && current.metadata.sites.size === 1 && has_definite_elements(siblings)) {
					return result;
				}
			}
		}

		if (!is_block(current)) break;

		if (current.type === 'EachBlock' && fragment === current.body) {
			// `{#each ...}<a /><b />{/each}` — `<b>` can be previous sibling of `<a />`
			add_to_map(get_possible_nested_siblings(current, direction, adjacent_only), result);
		}
	}

	return result;
}

/**
 * @param {Compiler.AST.EachBlock | Compiler.AST.IfBlock | Compiler.AST.AwaitBlock | Compiler.AST.KeyBlock | Compiler.AST.SlotElement | Compiler.AST.SnippetBlock | Compiler.AST.Component} node
 * @param {Direction} direction
 * @param {boolean} adjacent_only
 * @param {Set<Compiler.AST.SnippetBlock>} seen
 * @returns {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement, NodeExistsValue>}
 */
function get_possible_nested_siblings(node, direction, adjacent_only, seen = new Set()) {
	/** @type {Array<Compiler.AST.Fragment | undefined | null>} */
	let fragments = [];

	switch (node.type) {
		case 'EachBlock':
			fragments.push(node.body, node.fallback);
			break;

		case 'IfBlock':
			fragments.push(node.consequent, node.alternate);
			break;

		case 'AwaitBlock':
			fragments.push(node.pending, node.then, node.catch);
			break;

		case 'KeyBlock':
		case 'SlotElement':
			fragments.push(node.fragment);
			break;

		case 'SnippetBlock':
			if (seen.has(node)) {
				return new Map();
			}
			seen.add(node);
			fragments.push(node.body);
			break;

		case 'Component':
			fragments.push(node.fragment, ...[...node.metadata.snippets].map((s) => s.body));
			break;
	}

	/** @type {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement, NodeExistsValue>} NodeMap */
	const result = new Map();

	let exhaustive = node.type !== 'SlotElement' && node.type !== 'SnippetBlock';

	for (const fragment of fragments) {
		if (fragment == null) {
			exhaustive = false;
			continue;
		}

		const map = loop_child(fragment.nodes, direction, adjacent_only, seen);
		exhaustive &&= has_definite_elements(map);

		add_to_map(map, result);
	}

	if (!exhaustive) {
		for (const key of result.keys()) {
			result.set(key, NODE_PROBABLY_EXISTS);
		}
	}

	return result;
}

/**
 * @param {Map<unknown, NodeExistsValue>} result
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
 * @template T2
 * @template {T2} T1
 * @param {Map<T1, NodeExistsValue>} from
 * @param {Map<T2, NodeExistsValue>} to
 * @returns {void}
 */
function add_to_map(from, to) {
	from.forEach((exist, element) => {
		to.set(element, higher_existence(exist, to.get(element)));
	});
}

/**
 * @param {NodeExistsValue} exist1
 * @param {NodeExistsValue | undefined} exist2
 * @returns {NodeExistsValue}
 */
function higher_existence(exist1, exist2) {
	if (exist2 === undefined) return exist1;
	return exist1 > exist2 ? exist1 : exist2;
}

/**
 * @param {Compiler.AST.SvelteNode[]} children
 * @param {Direction} direction
 * @param {boolean} adjacent_only
 * @param {Set<Compiler.AST.SnippetBlock>} seen
 */
function loop_child(children, direction, adjacent_only, seen) {
	/** @type {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement, NodeExistsValue>} */
	const result = new Map();

	let i = direction === FORWARD ? 0 : children.length - 1;

	while (i >= 0 && i < children.length) {
		const child = children[i];

		if (child.type === 'RegularElement') {
			result.set(child, NODE_DEFINITELY_EXISTS);
			if (adjacent_only) {
				break;
			}
		} else if (child.type === 'SvelteElement') {
			result.set(child, NODE_PROBABLY_EXISTS);
		} else if (child.type === 'RenderTag') {
			for (const snippet of child.metadata.snippets) {
				add_to_map(get_possible_nested_siblings(snippet, direction, adjacent_only, seen), result);
			}
		} else if (is_block(child)) {
			const child_result = get_possible_nested_siblings(child, direction, adjacent_only, seen);
			add_to_map(child_result, result);
			if (adjacent_only && has_definite_elements(child_result)) {
				break;
			}
		}

		i = direction === FORWARD ? i + 1 : i - 1;
	}

	return result;
}

/**
 * @param {Compiler.AST.SvelteNode} node
 * @returns {node is Compiler.AST.IfBlock | Compiler.AST.EachBlock | Compiler.AST.AwaitBlock | Compiler.AST.KeyBlock | Compiler.AST.SlotElement}
 */
function is_block(node) {
	return (
		node.type === 'IfBlock' ||
		node.type === 'EachBlock' ||
		node.type === 'AwaitBlock' ||
		node.type === 'KeyBlock' ||
		node.type === 'SlotElement'
	);
}
