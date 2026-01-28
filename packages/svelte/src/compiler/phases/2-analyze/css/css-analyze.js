/** @import { ComponentAnalysis } from '../../types.js' */
/** @import { AST } from '#compiler' */
/** @import { Visitors } from 'zimmerframe' */
import { walk } from 'zimmerframe';
import * as e from '../../../errors.js';
import { is_keyframes_node } from '../../css.js';
import { is_global, is_unscoped_pseudo_class } from './utils.js';

/**
 * @typedef {{
 *   keyframes: string[];
 *   rule: AST.CSS.Rule | null;
 *   analysis: ComponentAnalysis;
 * }} CssState
 */

/**
 * @typedef {Visitors<AST.CSS.Node, CssState>} CssVisitors
 */

/**
 * True if is `:global`
 * @param {AST.CSS.SimpleSelector} simple_selector
 */
function is_global_block_selector(simple_selector) {
	return (
		simple_selector.type === 'PseudoClassSelector' &&
		simple_selector.name === 'global' &&
		simple_selector.args === null
	);
}

/**
 * @param {AST.SvelteNode[]} path
 */
function is_unscoped(path) {
	return path
		.filter((node) => node.type === 'Rule')
		.every((node) => node.metadata.has_global_selectors);
}

/**
 *
 * @param {Array<AST.CSS.Node>} path
 */
function is_in_global_block(path) {
	return path.some((node) => node.type === 'Rule' && node.metadata.is_global_block);
}

/** @type {CssVisitors} */
const css_visitors = {
	Atrule(node, context) {
		if (is_keyframes_node(node)) {
			if (!node.prelude.startsWith('-global-') && !is_in_global_block(context.path)) {
				context.state.keyframes.push(node.prelude);
			} else if (node.prelude.startsWith('-global-')) {
				// we don't check if the block.children.length because the keyframe is still added even if empty
				context.state.analysis.css.has_global ||= is_unscoped(context.path);
			}
		}

		context.next();
	},
	ComplexSelector(node, context) {
		context.next(); // analyse relevant selectors first

		{
			const global = node.children.find(is_global);

			if (global) {
				const is_nested = context.path.at(-2)?.type === 'PseudoClassSelector';
				if (is_nested && !global.selectors[0].args) {
					e.css_global_block_invalid_placement(global.selectors[0]);
				}

				const idx = node.children.indexOf(global);
				if (global.selectors[0].args !== null && idx !== 0 && idx !== node.children.length - 1) {
					// ensure `:global(...)` is not used in the middle of a selector (but multiple `global(...)` in sequence are ok)
					for (let i = idx + 1; i < node.children.length; i++) {
						if (!is_global(node.children[i])) {
							e.css_global_invalid_placement(global.selectors[0]);
						}
					}
				}
			}
		}

		// ensure `:global(...)` do not lead to invalid css after `:global()` is removed
		for (const relative_selector of node.children) {
			for (let i = 0; i < relative_selector.selectors.length; i++) {
				const selector = relative_selector.selectors[i];

				if (selector.type === 'PseudoClassSelector' && selector.name === 'global') {
					const child = selector.args?.children[0].children[0];
					// ensure `:global(element)` to be at the first position in a compound selector
					if (child?.selectors[0].type === 'TypeSelector' && i !== 0) {
						e.css_global_invalid_selector_list(selector);
					}

					// ensure `:global(.class)` is not followed by a type selector, eg: `:global(.class)element`
					if (relative_selector.selectors[i + 1]?.type === 'TypeSelector') {
						e.css_type_selector_invalid_placement(relative_selector.selectors[i + 1]);
					}

					// ensure `:global(...)`contains a single selector
					// (standalone :global() with multiple selectors is OK)
					if (
						selector.args !== null &&
						selector.args.children.length > 1 &&
						(node.children.length > 1 || relative_selector.selectors.length > 1)
					) {
						e.css_global_invalid_selector(selector);
					}
				}
			}
		}

		node.metadata.rule = context.state.rule;

		node.metadata.is_global = node.children.every(
			({ metadata }) => metadata.is_global || metadata.is_global_like
		);

		node.metadata.used ||= node.metadata.is_global;

		if (
			node.metadata.rule?.metadata.parent_rule &&
			node.children[0]?.selectors[0]?.type === 'NestingSelector'
		) {
			const first = node.children[0]?.selectors[1];
			const no_nesting_scope =
				first?.type !== 'PseudoClassSelector' || is_unscoped_pseudo_class(first);
			const parent_is_global = node.metadata.rule.metadata.parent_rule.prelude.children.some(
				(child) => child.children.length === 1 && child.children[0].metadata.is_global
			);
			// mark `&:hover` in `:global(.foo) { &:hover { color: green }}` as used
			if (no_nesting_scope && parent_is_global) {
				node.metadata.used = true;
			}
		}
	},
	RelativeSelector(node, context) {
		const parent = /** @type {AST.CSS.ComplexSelector} */ (context.path.at(-1));

		if (
			node.combinator != null &&
			!context.state.rule?.metadata.parent_rule &&
			parent.children[0] === node &&
			context.path.at(-3)?.type !== 'PseudoClassSelector'
		) {
			e.css_selector_invalid(node.combinator);
		}

		node.metadata.is_global = node.selectors.length >= 1 && is_global(node);

		if (
			node.selectors.length >= 1 &&
			node.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			)
		) {
			const first = node.selectors[0];
			node.metadata.is_global_like ||=
				(first.type === 'PseudoClassSelector' && first.name === 'host') ||
				(first.type === 'PseudoElementSelector' &&
					[
						'view-transition',
						'view-transition-group',
						'view-transition-old',
						'view-transition-new',
						'view-transition-image-pair'
					].includes(first.name));
		}

		node.metadata.is_global_like ||=
			node.selectors.some(
				(child) => child.type === 'PseudoClassSelector' && child.name === 'root'
			) &&
			// :root.y:has(.x) is not a global selector because while .y is unscoped, .x inside `:has(...)` should be scoped
			!node.selectors.some((child) => child.type === 'PseudoClassSelector' && child.name === 'has');

		if (node.metadata.is_global_like || node.metadata.is_global) {
			// So that nested selectors like `:root:not(.x)` are not marked as unused
			for (const child of node.selectors) {
				walk(/** @type {AST.CSS.Node} */ (child), null, {
					ComplexSelector(node, context) {
						node.metadata.used = true;
						context.next();
					}
				});
			}
		}

		context.next();
	},
	Rule(node, context) {
		node.metadata.parent_rule = context.state.rule;

		// We gotta allow :global x, :global y because CSS preprocessors might generate that from :global { x, y {...} }
		for (const complex_selector of node.prelude.children) {
			let is_global_block = false;

			for (let selector_idx = 0; selector_idx < complex_selector.children.length; selector_idx++) {
				const child = complex_selector.children[selector_idx];
				const idx = child.selectors.findIndex(is_global_block_selector);

				if (is_global_block) {
					// All selectors after :global are unscoped
					child.metadata.is_global_like = true;
				}

				if (idx === 0) {
					if (
						child.selectors.length > 1 &&
						selector_idx === 0 &&
						node.metadata.parent_rule === null
					) {
						e.css_global_block_invalid_modifier_start(child.selectors[1]);
					} else {
						// `child` starts with `:global`
						node.metadata.is_global_block = is_global_block = true;

						for (let i = 1; i < child.selectors.length; i++) {
							walk(/** @type {AST.CSS.Node} */ (child.selectors[i]), null, {
								ComplexSelector(node) {
									node.metadata.used = true;
								}
							});
						}

						if (child.combinator && child.combinator.name !== ' ') {
							e.css_global_block_invalid_combinator(child, child.combinator.name);
						}

						const declaration = node.block.children.find((child) => child.type === 'Declaration');
						const is_lone_global =
							complex_selector.children.length === 1 &&
							complex_selector.children[0].selectors.length === 1; // just `:global`, not e.g. `:global x`

						if (is_lone_global && node.prelude.children.length > 1) {
							// `:global, :global x { z { ... } }` would become `x { z { ... } }` which means `z` is always
							// constrained by `x`, which is not what the user intended
							e.css_global_block_invalid_list(node.prelude);
						}

						if (
							declaration &&
							// :global { color: red; } is invalid, but foo :global { color: red; } is valid
							node.prelude.children.length === 1 &&
							is_lone_global
						) {
							e.css_global_block_invalid_declaration(declaration);
						}
					}
				} else if (idx !== -1) {
					e.css_global_block_invalid_modifier(child.selectors[idx]);
				}
			}

			if (node.metadata.is_global_block && !is_global_block) {
				e.css_global_block_invalid_list(node.prelude);
			}
		}

		const state = { ...context.state, rule: node };

		// visit selector list first, to populate child selector metadata
		context.visit(node.prelude, state);

		for (const selector of node.prelude.children) {
			node.metadata.has_global_selectors ||= selector.metadata.is_global;
			node.metadata.has_local_selectors ||= !selector.metadata.is_global;
		}

		// if this rule has a ComplexSelector whose RelativeSelector children are all
		// `:global(...)`, and the rule contains declarations (rather than just
		// nested rules) then the component as a whole includes global CSS
		context.state.analysis.css.has_global ||=
			node.metadata.has_global_selectors &&
			node.block.children.filter((child) => child.type === 'Declaration').length > 0 &&
			is_unscoped(context.path);

		// visit block list, so parent rule metadata is populated
		context.visit(node.block, state);
	},
	NestingSelector(node, context) {
		const rule = /** @type {AST.CSS.Rule} */ (context.state.rule);
		const parent_rule = rule.metadata.parent_rule;

		if (!parent_rule) {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector#using_outside_nested_rule
			const children = rule.prelude.children;
			const selectors = children[0].children[0].selectors;
			if (
				children.length > 1 ||
				selectors.length > 1 ||
				selectors[0].type !== 'PseudoClassSelector' ||
				selectors[0].name !== 'global' ||
				selectors[0].args?.children[0]?.children[0].selectors[0] !== node
			) {
				e.css_nesting_selector_invalid_placement(node);
			}
		} else if (
			// :global { &.foo { ... } } is invalid
			parent_rule.metadata.is_global_block &&
			!parent_rule.metadata.parent_rule &&
			parent_rule.prelude.children[0].children.length === 1 &&
			parent_rule.prelude.children[0].children[0].selectors.length === 1
		) {
			e.css_global_block_invalid_modifier_start(node);
		}

		context.next();
	}
};

/**
 * @param {AST.CSS.StyleSheet} stylesheet
 * @param {ComponentAnalysis} analysis
 */
export function analyze_css(stylesheet, analysis) {
	/** @type {CssState} */
	const css_state = {
		keyframes: analysis.css.keyframes,
		rule: null,
		analysis
	};

	walk(stylesheet, css_state, css_visitors);
}
