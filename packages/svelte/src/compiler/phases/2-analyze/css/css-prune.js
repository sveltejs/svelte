/** @import { Visitors } from 'zimmerframe' */
/** @import * as Compiler from '#compiler' */
import { walk } from 'zimmerframe';
import { get_possible_values } from './utils.js';
import { regex_ends_with_whitespace, regex_starts_with_whitespace } from '../../patterns.js';
import { get_attribute_chunks, is_text_attribute } from '../../../utils/ast.js';

/**
 * @typedef {{
 *   stylesheet: Compiler.Css.StyleSheet;
 *   element: Compiler.AST.RegularElement | Compiler.AST.SvelteElement;
 *   from_render_tag: boolean;
 * }} State
 */
/** @typedef {NODE_PROBABLY_EXISTS | NODE_DEFINITELY_EXISTS} NodeExistsValue */

const NODE_PROBABLY_EXISTS = 0;
const NODE_DEFINITELY_EXISTS = 1;

const whitelist_attribute_selector = new Map([
	['details', ['open']],
	['dialog', ['open']]
]);

/** @type {Compiler.Css.Combinator} */
const descendant_combinator = {
	type: 'Combinator',
	name: ' ',
	start: -1,
	end: -1
};

/** @type {Compiler.Css.RelativeSelector} */
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

/**
 *
 * @param {Compiler.Css.StyleSheet} stylesheet
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag} element
 */
export function prune(stylesheet, element) {
	if (element.type === 'RenderTag') {
		const parent = get_element_parent(element);
		if (!parent) return;

		walk(stylesheet, { stylesheet, element: parent, from_render_tag: true }, visitors);
	} else {
		walk(stylesheet, { stylesheet, element, from_render_tag: false }, visitors);
	}
}

/** @type {Visitors<Compiler.Css.Node, State>} */
const visitors = {
	Rule(node, context) {
		if (node.metadata.is_global_block) {
			context.visit(node.prelude);
		} else {
			context.next();
		}
	},
	ComplexSelector(node, context) {
		const selectors = truncate(node);
		const inner = selectors[selectors.length - 1];

		if (node.metadata.rule?.metadata.parent_rule && selectors.length > 0) {
			let has_explicit_nesting_selector = false;

			// nesting could be inside pseudo classes like :is, :has or :where
			for (let selector of selectors) {
				walk(
					selector,
					{},
					{
						// @ts-ignore
						NestingSelector() {
							has_explicit_nesting_selector = true;
						}
					}
				);
				// if we found one we can break from the others
				if (has_explicit_nesting_selector) break;
			}

			if (!has_explicit_nesting_selector) {
				selectors[0] = {
					...selectors[0],
					combinator: descendant_combinator
				};

				selectors.unshift(nesting_selector);
			}
		}

		if (context.state.from_render_tag) {
			// We're searching for a match that crosses a render tag boundary. That means we have to both traverse up
			// the element tree (to see if we find an entry point) but also remove selectors from the end (assuming
			// they are part of the render tag we don't see). We do all possible combinations of both until we find a match.
			/** @type {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | null} */
			let element = context.state.element;

			while (element) {
				const selectors_to_check = selectors.slice();

				while (selectors_to_check.length > 0) {
					selectors_to_check.pop();

					if (
						apply_selector(
							selectors_to_check,
							/** @type {Compiler.Css.Rule} */ (node.metadata.rule),
							element,
							context.state.stylesheet
						)
					) {
						mark(inner, element);
						node.metadata.used = true;
						return;
					}
				}

				element = get_element_parent(element);
			}
		} else if (
			apply_selector(
				selectors,
				/** @type {Compiler.Css.Rule} */ (node.metadata.rule),
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
 * Discard trailing `:global(...)` selectors without a `:has/is/where/not(...)` modifier, these are unused for scoping purposes
 * @param {Compiler.Css.ComplexSelector} node
 */
function truncate(node) {
	const i = node.children.findLastIndex(({ metadata, selectors }) => {
		const first = selectors[0];
		return (
			// not after a :global selector
			!metadata.is_global_like &&
			!(first.type === 'PseudoClassSelector' && first.name === 'global' && first.args === null) &&
			// not a :global(...) without a :has/is/where/not(...) modifier
			(!metadata.is_global ||
				selectors.some(
					(selector) =>
						selector.type === 'PseudoClassSelector' &&
						selector.args !== null &&
						(selector.name === 'has' ||
							selector.name === 'not' ||
							selector.name === 'is' ||
							selector.name === 'where')
				))
		);
	});

	return node.children.slice(0, i + 1);
}

/**
 * @param {Compiler.Css.RelativeSelector[]} relative_selectors
 * @param {Compiler.Css.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 * @param {Compiler.Css.StyleSheet} stylesheet
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
		return apply_combinator(
			relative_selector.combinator,
			relative_selector,
			parent_selectors,
			rule,
			element,
			stylesheet
		);
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
 * @param {Compiler.Css.Combinator} combinator
 * @param {Compiler.Css.RelativeSelector} relative_selector
 * @param {Compiler.Css.RelativeSelector[]} parent_selectors
 * @param {Compiler.Css.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 * @param {Compiler.Css.StyleSheet} stylesheet
 * @returns {boolean}
 */
function apply_combinator(
	combinator,
	relative_selector,
	parent_selectors,
	rule,
	element,
	stylesheet
) {
	const name = combinator.name;

	switch (name) {
		case ' ':
		case '>': {
			let parent = /** @type {Compiler.TemplateNode | null} */ (element.parent);

			let parent_matched = false;
			let crossed_component_boundary = false;

			while (parent) {
				if (parent.type === 'Component' || parent.type === 'SvelteComponent') {
					crossed_component_boundary = true;
				}

				if (parent.type === 'SnippetBlock') {
					// We assume the snippet might be rendered in a place where the parent selectors match.
					// (We could do more static analysis and check the render tag reference to see if this snippet block continues
					// with elements that actually match the selector, but that would be a lot of work for little gain)
					return true;
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

				parent = /** @type {Compiler.TemplateNode | null} */ (parent.parent);
			}

			return parent_matched || parent_selectors.every((selector) => is_global(selector, rule));
		}

		case '+':
		case '~': {
			const siblings = get_possible_element_siblings(element, name === '+');

			let sibling_matched = false;

			for (const possible_sibling of siblings.keys()) {
				if (possible_sibling.type === 'RenderTag' || possible_sibling.type === 'SlotElement') {
					// `{@render foo()}<p>foo</p>` with `:global(.x) + p` is a match
					if (parent_selectors.length === 1 && parent_selectors[0].metadata.is_global) {
						mark(relative_selector, element);
						sibling_matched = true;
					}
				} else if (apply_selector(parent_selectors, rule, possible_sibling, stylesheet)) {
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

/**
 * Mark both the compound selector and the node it selects as encapsulated,
 * for transformation in a later step
 * @param {Compiler.Css.RelativeSelector} relative_selector
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 */
function mark(relative_selector, element) {
	relative_selector.metadata.scoped = true;
	element.metadata.scoped = true;
}

/**
 * Returns `true` if the relative selector is global, meaning
 * it's a `:global(...)` or unscopeable selector, or
 * is an `:is(...)` or `:where(...)` selector that contains
 * a global selector
 * @param {Compiler.Css.RelativeSelector} selector
 * @param {Compiler.Css.Rule} rule
 */
function is_global(selector, rule) {
	if (selector.metadata.is_global || selector.metadata.is_global_like) {
		return true;
	}

	for (const s of selector.selectors) {
		/** @type {Compiler.Css.SelectorList | null} */
		let selector_list = null;
		let owner = rule;

		if (s.type === 'PseudoClassSelector') {
			if ((s.name === 'is' || s.name === 'where') && s.args) {
				selector_list = s.args;
			}
		}

		if (s.type === 'NestingSelector') {
			owner = /** @type {Compiler.Css.Rule} */ (rule.metadata.parent_rule);
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
 * @param {Compiler.Css.RelativeSelector} relative_selector
 * @param {Compiler.Css.Rule} rule
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement} element
 * @param {Compiler.Css.StyleSheet} stylesheet
 * @returns {boolean  }
 */
function relative_selector_might_apply_to_node(relative_selector, rule, element, stylesheet) {
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
		/** @type {Array<Compiler.AST.RegularElement | Compiler.AST.SvelteElement>} */
		const child_elements = [];
		/** @type {Array<Compiler.AST.RegularElement | Compiler.AST.SvelteElement>} */
		const descendant_elements = [];

		walk(
			/** @type {Compiler.SvelteNode} */ (element.fragment),
			{ is_child: true },
			{
				_(node, context) {
					if (node.type === 'RegularElement' || node.type === 'SvelteElement') {
						descendant_elements.push(node);

						if (context.state.is_child) {
							child_elements.push(node);
							context.state.is_child = false;
							context.next();
							context.state.is_child = true;
						} else {
							context.next();
						}
					} else {
						context.next();
					}
				}
			}
		);

		// :has(...) is special in that it means "look downwards in the CSS tree". Since our matching algorithm goes
		// upwards and back-to-front, we need to first check the selectors inside :has(...), then check the rest of the
		// selector in a way that is similar to ancestor matching. In a sense, we're treating `.x:has(.y)` as `.x .y`.
		for (const has_selector of has_selectors) {
			const complex_selectors = /** @type {Compiler.Css.SelectorList} */ (has_selector.args)
				.children;
			let matched = false;

			for (const complex_selector of complex_selectors) {
				const selectors = truncate(complex_selector);
				const left_most_combinator = selectors[0]?.combinator ?? descendant_combinator;
				// In .x:has(> y), we want to search for y, ignoring the left-most combinator
				// (else it would try to walk further up and fail because there are no selectors left)
				if (selectors.length > 0) {
					selectors[0] = {
						...selectors[0],
						combinator: null
					};
				}

				const descendants =
					left_most_combinator.name === '>' ? child_elements : descendant_elements;

				let selector_matched = false;

				// Iterate over all descendant elements and check if the selector inside :has matches
				for (const element of descendants) {
					if (
						selectors.length === 0 /* is :global(...) */ ||
						(element.metadata.scoped && selector_matched) ||
						apply_selector(selectors, rule, element, stylesheet)
					) {
						complex_selector.metadata.used = true;
						selector_matched = matched = true;
					}
				}
			}

			if (!matched) {
				if (relative_selector.metadata.is_global && !relative_selector.metadata.is_global_like) {
					// Edge case: `:global(.x):has(.y)` where `.x` is global but `.y` doesn't match.
					// Since `used` is set to `true` for `:global(.x)` in css-analyze beforehand, and
					// we have no way of knowing if it's safe to set it back to `false`, we'll mark
					// the inner selector as used and scoped to prevent it from being pruned, which could
					// result in a invalid CSS output (e.g. `.x:has(/* unused .y */)`). The result
					// can't match a real element, so the only drawback is the missing prune.
					// TODO clean this up some day
					complex_selectors[0].metadata.used = true;
					complex_selectors[0].children.forEach((selector) => {
						selector.metadata.scoped = true;
					});
				}

				return false;
			}
		}
	}

	for (const selector of other_selectors) {
		if (selector.type === 'Percentage' || selector.type === 'Nth') continue;

		const name = selector.name.replace(regex_backslash_and_following_character, '$1');

		switch (selector.type) {
			case 'PseudoClassSelector': {
				if (name === 'host' || name === 'root') {
					return false;
				}

				if (
					name === 'global' &&
					selector.args !== null &&
					relative_selector.selectors.length === 1
				) {
					const args = selector.args;
					const complex_selector = args.children[0];
					return apply_selector(complex_selector.children, rule, element, stylesheet);
				}

				// We came across a :global, everything beyond it is global and therefore a potential match
				if (name === 'global' && selector.args === null) return true;

				if ((name === 'is' || name === 'where' || name === 'not') && selector.args) {
					let matched = false;

					for (const complex_selector of selector.args.children) {
						const relative = truncate(complex_selector);
						if (
							relative.length === 0 /* is :global(...) */ ||
							apply_selector(relative, rule, element, stylesheet)
						) {
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
						if (
							relative_selector.metadata.is_global &&
							!relative_selector.metadata.is_global_like
						) {
							// Edge case: `:global(.x):is(.y)` where `.x` is global but `.y` doesn't match.
							// Since `used` is set to `true` for `:global(.x)` in css-analyze beforehand, and
							// we have no way of knowing if it's safe to set it back to `false`, we'll mark
							// the inner selector as used and scoped to prevent it from being pruned, which could
							// result in a invalid CSS output (e.g. `.x:is(/* unused .y */)`). The result
							// can't match a real element, so the only drawback is the missing prune.
							// TODO clean this up some day
							selector.args.children[0].metadata.used = true;
							selector.args.children[0].children.forEach((selector) => {
								selector.metadata.scoped = true;
							});
						}

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

				const parent = /** @type {Compiler.Css.Rule} */ (rule.metadata.parent_rule);

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
 * @param {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.RenderTag} node
 * @returns {Compiler.AST.RegularElement | Compiler.AST.SvelteElement | null}
 */
function get_element_parent(node) {
	/** @type {Compiler.SvelteNode | null} */
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
 * @param {Compiler.SvelteNode} node
 * @returns {Compiler.SvelteNode}
 */
function find_previous_sibling(node) {
	/** @type {Compiler.SvelteNode} */
	let current_node = node;

	while (
		// @ts-expect-error TODO
		!current_node.prev &&
		// @ts-expect-error TODO
		current_node.parent?.type === 'SlotElement'
	) {
		// @ts-expect-error TODO
		current_node = current_node.parent;
	}

	// @ts-expect-error
	current_node = current_node.prev;

	while (current_node?.type === 'SlotElement') {
		const slot_children = current_node.fragment.nodes;
		if (slot_children.length > 0) {
			current_node = slot_children.slice(-1)[0];
		} else {
			break;
		}
	}

	return current_node;
}

/**
 * @param {Compiler.SvelteNode} node
 * @param {boolean} adjacent_only
 * @returns {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.SlotElement | Compiler.AST.RenderTag, NodeExistsValue>}
 */
function get_possible_element_siblings(node, adjacent_only) {
	/** @type {Map<Compiler.AST.RegularElement | Compiler.AST.SvelteElement | Compiler.AST.SlotElement | Compiler.AST.RenderTag, NodeExistsValue>} */
	const result = new Map();

	/** @type {Compiler.SvelteNode} */
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
		} else if (
			prev.type === 'SlotElement' ||
			prev.type === 'RenderTag' ||
			prev.type === 'SvelteElement'
		) {
			result.set(prev, NODE_PROBABLY_EXISTS);
			// Special case: slots, render tags and svelte:element tags could resolve to no siblings,
			// so we want to continue until we find a definite sibling even with the adjacent-only combinator
		}
	}

	if (!prev || !adjacent_only) {
		/** @type {Compiler.SvelteNode | null} */
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
 * @param {Compiler.AST.EachBlock | Compiler.AST.IfBlock | Compiler.AST.AwaitBlock} relative_selector
 * @param {boolean} adjacent_only
 * @returns {Map<Compiler.AST.RegularElement, NodeExistsValue>}
 */
function get_possible_last_child(relative_selector, adjacent_only) {
	/** @typedef {Map<Compiler.AST.RegularElement, NodeExistsValue>} NodeMap */

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
 * @template T
 * @param {Map<T, NodeExistsValue>} from
 * @param {Map<T, NodeExistsValue>} to
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

/** @param {Map<Compiler.AST.RegularElement, NodeExistsValue>} result */
function mark_as_probably(result) {
	for (const key of result.keys()) {
		result.set(key, NODE_PROBABLY_EXISTS);
	}
}

/**
 * @param {Compiler.SvelteNode[]} children
 * @param {boolean} adjacent_only
 */
function loop_child(children, adjacent_only) {
	/** @type {Map<Compiler.AST.RegularElement, NodeExistsValue>} */
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
