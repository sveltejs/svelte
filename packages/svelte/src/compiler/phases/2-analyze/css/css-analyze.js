import { walk } from 'zimmerframe';
import { error } from '../../../errors.js';
import { is_keyframes_node } from '../../css.js';
import { merge } from '../../visitors.js';

/**
 * @typedef {import('zimmerframe').Visitors<
 *   import('#compiler').Css.Node,
 *   {
 *     keyframes: string[];
 *     rule: import('#compiler').Css.Rule | null;
 *   }
 * >} Visitors
 */

/** @param {import('#compiler').Css.RelativeSelector} relative_selector */
function is_global(relative_selector) {
	const first = relative_selector.selectors[0];

	return (
		first.type === 'PseudoClassSelector' &&
		first.name === 'global' &&
		relative_selector.selectors.every(
			(selector) =>
				selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
		)
	);
}

/** @type {Visitors} */
const analysis_visitors = {
	Atrule(node, context) {
		if (is_keyframes_node(node)) {
			if (!node.prelude.startsWith('-global-')) {
				context.state.keyframes.push(node.prelude);
			}
		}
	},
	ComplexSelector(node, context) {
		context.next(); // analyse relevant selectors first

		node.metadata.rule = context.state.rule;

		node.metadata.used = node.children.every(
			({ metadata }) => metadata.is_global || metadata.is_host || metadata.is_root
		);
	},
	RelativeSelector(node, context) {
		node.metadata.is_global =
			node.selectors.length >= 1 &&
			node.selectors[0].type === 'PseudoClassSelector' &&
			node.selectors[0].name === 'global' &&
			node.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			);

		if (node.selectors.length === 1) {
			const first = node.selectors[0];
			node.metadata.is_host = first.type === 'PseudoClassSelector' && first.name === 'host';
		}

		node.metadata.is_root = !!node.selectors.find(
			(child) => child.type === 'PseudoClassSelector' && child.name === 'root'
		);

		context.next();
	},
	Rule(node, context) {
		node.metadata.parent_rule = context.state.rule;

		// `:global {...}` or `div :global {...}`
		node.metadata.is_global_block = node.prelude.children.some((selector) => {
			const last = selector.children[selector.children.length - 1];

			const s = last.selectors[last.selectors.length - 1];

			if (s.type === 'PseudoClassSelector' && s.name === 'global' && s.args === null) {
				return true;
			}
		});

		context.next({
			...context.state,
			rule: node
		});

		node.metadata.has_local_selectors = node.prelude.children.some((selector) => {
			return selector.children.some(
				({ metadata }) => !metadata.is_global && !metadata.is_host && !metadata.is_root
			);
		});
	}
};

/** @type {Visitors} */
const validation_visitors = {
	Rule(node, context) {
		if (node.metadata.is_global_block) {
			if (node.prelude.children.length > 1) {
				error(node.prelude, 'invalid-css-global-block-list');
			}

			const complex_selector = node.prelude.children[0];
			const relative_selector = complex_selector.children[complex_selector.children.length - 1];

			if (relative_selector.selectors.length > 1) {
				error(
					relative_selector.selectors[relative_selector.selectors.length - 1],
					'invalid-css-global-block-modifier'
				);
			}

			if (relative_selector.combinator && relative_selector.combinator.name !== ' ') {
				error(
					relative_selector,
					'invalid-css-global-block-combinator',
					relative_selector.combinator.name
				);
			}

			const declaration = node.block.children.find((child) => child.type === 'Declaration');

			if (declaration) {
				error(declaration, 'invalid-css-global-block-declaration');
			}
		}

		context.next();
	},
	ComplexSelector(node, context) {
		// ensure `:global(...)` is not used in the middle of a selector
		{
			const a = node.children.findIndex((child) => !is_global(child));
			const b = node.children.findLastIndex((child) => !is_global(child));

			if (a !== b) {
				for (let i = a; i <= b; i += 1) {
					if (is_global(node.children[i])) {
						error(node.children[i].selectors[0], 'invalid-css-global-placement');
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
						error(selector, 'invalid-css-global-selector-list');
					}

					// ensure `:global(.class)` is not followed by a type selector, eg: `:global(.class)element`
					if (relative_selector.selectors[i + 1]?.type === 'TypeSelector') {
						error(relative_selector.selectors[i + 1], 'invalid-css-type-selector-placement');
					}

					// ensure `:global(...)`contains a single selector
					// (standalone :global() with multiple selectors is OK)
					if (
						selector.args !== null &&
						selector.args.children.length > 1 &&
						(node.children.length > 1 || relative_selector.selectors.length > 1)
					) {
						error(selector, 'invalid-css-global-selector');
					}
				}
			}
		}
	},
	NestingSelector(node, context) {
		const rule = /** @type {import('#compiler').Css.Rule} */ (context.state.rule);
		if (!rule.metadata.parent_rule) {
			error(node, 'invalid-nesting-selector');
		}
	}
};

const css_visitors = merge(analysis_visitors, validation_visitors);

/**
 * @param {import('#compiler').Css.StyleSheet} stylesheet
 * @param {import('../../types.js').ComponentAnalysis} analysis
 */
export function analyze_css(stylesheet, analysis) {
	walk(stylesheet, { keyframes: analysis.css.keyframes, rule: null }, css_visitors);
}
