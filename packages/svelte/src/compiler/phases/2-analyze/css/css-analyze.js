/** @import { ComponentAnalysis } from '../../types.js' */
/** @import { Css } from '#compiler' */
/** @import { Visitors } from 'zimmerframe' */
import { walk } from 'zimmerframe';
import * as e from '../../../errors.js';
import { is_keyframes_node } from '../../css.js';

/**
 * @typedef {Visitors<
 *   Css.Node,
 *   {
 *     keyframes: string[];
 *     rule: Css.Rule | null;
 *   }
 * >} CssVisitors
 */

/**
 * True if is `:global(...)` or `:global`
 * @param {Css.RelativeSelector} relative_selector
 * @returns {relative_selector is Css.RelativeSelector & { selectors: [Css.PseudoClassSelector, ...Array<Css.PseudoClassSelector | Css.PseudoElementSelector>] }}
 */
function is_global(relative_selector) {
	const first = relative_selector.selectors[0];

	return (
		first.type === 'PseudoClassSelector' &&
		first.name === 'global' &&
		(first.args === null ||
			// Only these two selector types keep the whole selector global, because e.g.
			// :global(button).x means that the selector is still scoped because of the .x
			relative_selector.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			))
	);
}

/**
 * True if is `:global`
 * @param {Css.SimpleSelector} simple_selector
 */
function is_global_block_selector(simple_selector) {
	return (
		simple_selector.type === 'PseudoClassSelector' &&
		simple_selector.name === 'global' &&
		simple_selector.args === null
	);
}

/** @type {CssVisitors} */
const css_visitors = {
	Atrule(node, context) {
		if (is_keyframes_node(node)) {
			if (!node.prelude.startsWith('-global-')) {
				context.state.keyframes.push(node.prelude);
			}
		}

		context.next();
	},
	ComplexSelector(node, context) {
		context.next(); // analyse relevant selectors first

		{
			const global = node.children.find(is_global);

			if (global) {
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

		node.metadata.used ||= node.children.every(
			({ metadata }) => metadata.is_global || metadata.is_global_like
		);

		if (
			node.metadata.rule?.metadata.parent_rule &&
			node.children[0]?.selectors[0]?.type === 'NestingSelector'
		) {
			const parent_is_global = node.metadata.rule.metadata.parent_rule.prelude.children.some(
				(child) => child.children.length === 1 && child.children[0].metadata.is_global
			);
			// mark `&:hover` in `:global(.foo) { &:hover { color: green }}` as used
			if (parent_is_global) {
				node.metadata.used = true;
			}
		}
	},
	RelativeSelector(node, context) {
		const parent = /** @type {Css.ComplexSelector} */ (context.path.at(-1));

		if (
			node.combinator != null &&
			!context.state.rule?.metadata.parent_rule &&
			parent.children[0] === node &&
			context.path.at(-3)?.type !== 'PseudoClassSelector'
		) {
			e.css_selector_invalid(node.combinator);
		}

		node.metadata.is_global = node.selectors.length >= 1 && is_global(node);

		if (node.selectors.length === 1) {
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

		node.metadata.is_global_like ||= !!node.selectors.find(
			(child) => child.type === 'PseudoClassSelector' && child.name === 'root'
		);

		context.next();
	},
	Rule(node, context) {
		node.metadata.parent_rule = context.state.rule;

		node.metadata.is_global_block = node.prelude.children.some((selector) => {
			let is_global_block = false;

			for (const child of selector.children) {
				const idx = child.selectors.findIndex(is_global_block_selector);

				if (is_global_block) {
					// All selectors after :global are unscoped
					child.metadata.is_global_like = true;
				}

				if (idx !== -1) {
					is_global_block = true;
					for (let i = idx + 1; i < child.selectors.length; i++) {
						walk(/** @type {Css.Node} */ (child.selectors[i]), null, {
							ComplexSelector(node) {
								node.metadata.used = true;
							}
						});
					}
				}
			}

			return is_global_block;
		});

		if (node.metadata.is_global_block) {
			if (node.prelude.children.length > 1) {
				e.css_global_block_invalid_list(node.prelude);
			}

			const complex_selector = node.prelude.children[0];
			const global_selector = complex_selector.children.find((r, selector_idx) => {
				const idx = r.selectors.findIndex(is_global_block_selector);
				if (idx === 0) {
					if (r.selectors.length > 1 && selector_idx === 0 && node.metadata.parent_rule === null) {
						e.css_global_block_invalid_modifier_start(r.selectors[1]);
					}
					return true;
				} else if (idx !== -1) {
					e.css_global_block_invalid_modifier(r.selectors[idx]);
				}
			});

			if (!global_selector) {
				throw new Error('Internal error: global block without :global selector');
			}

			if (global_selector.combinator && global_selector.combinator.name !== ' ') {
				e.css_global_block_invalid_combinator(global_selector, global_selector.combinator.name);
			}

			const declaration = node.block.children.find((child) => child.type === 'Declaration');

			if (
				declaration &&
				// :global { color: red; } is invalid, but foo :global { color: red; } is valid
				node.prelude.children.length === 1 &&
				node.prelude.children[0].children.length === 1 &&
				node.prelude.children[0].children[0].selectors.length === 1
			) {
				e.css_global_block_invalid_declaration(declaration);
			}
		}

		context.next({
			...context.state,
			rule: node
		});

		node.metadata.has_local_selectors = node.prelude.children.some((selector) => {
			return selector.children.some(
				({ metadata }) => !metadata.is_global && !metadata.is_global_like
			);
		});
	},
	NestingSelector(node, context) {
		const rule = /** @type {Css.Rule} */ (context.state.rule);
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
 * @param {Css.StyleSheet} stylesheet
 * @param {ComponentAnalysis} analysis
 */
export function analyze_css(stylesheet, analysis) {
	walk(stylesheet, { keyframes: analysis.css.keyframes, rule: null }, css_visitors);
}
