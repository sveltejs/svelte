import { error } from '../../../errors.js';

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

/**
 * @type {import('zimmerframe').Visitors<import('#compiler').SvelteNode, {}>}
 */
export const validation_css = {
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
	}
};
