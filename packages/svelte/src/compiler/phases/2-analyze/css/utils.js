/** @import { AST } from '#compiler' */
/** @import { Node } from 'estree' */
const UNKNOWN = {};

/**
 * @param {Node} node
 * @param {boolean} is_class
 * @param {Set<any>} set
 * @param {boolean} is_nested
 */
function gather_possible_values(node, is_class, set, is_nested = false) {
	if (set.has(UNKNOWN)) {
		// no point traversing any further
		return;
	}

	if (node.type === 'Literal') {
		set.add(String(node.value));
	} else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, is_class, set, is_nested);
		gather_possible_values(node.alternate, is_class, set, is_nested);
	} else if (node.type === 'LogicalExpression') {
		if (node.operator === '&&') {
			// && is a special case, because the only way the left
			// hand value can be included is if it's falsy. this is
			// a bit of extra work but it's worth it because
			// `class={[condition && 'blah']}` is common,
			// and we don't want to deopt on `condition`
			const left = new Set();
			gather_possible_values(node.left, is_class, left, is_nested);

			if (left.has(UNKNOWN)) {
				// add all non-nullish falsy values, unless this is a `class` attribute that
				// will be processed by cslx, in which case falsy values are removed, unless
				// they're not inside an array/object (TODO 6.0 remove that last part)
				if (!is_class || !is_nested) {
					set.add('');
					set.add(false);
					set.add(NaN);
					set.add(0); // -0 and 0n are also falsy, but stringify to '0'
				}
			} else {
				for (const value of left) {
					if (!value && value != undefined && (!is_class || !is_nested)) {
						set.add(value);
					}
				}
			}

			gather_possible_values(node.right, is_class, set, is_nested);
		} else {
			gather_possible_values(node.left, is_class, set, is_nested);
			gather_possible_values(node.right, is_class, set, is_nested);
		}
	} else if (is_class && node.type === 'ArrayExpression') {
		for (const entry of node.elements) {
			if (entry) {
				gather_possible_values(entry, is_class, set, true);
			}
		}
	} else if (is_class && node.type === 'ObjectExpression') {
		for (const property of node.properties) {
			if (
				property.type === 'Property' &&
				!property.computed &&
				(property.key.type === 'Identifier' || property.key.type === 'Literal')
			) {
				set.add(
					property.key.type === 'Identifier' ? property.key.name : String(property.key.value)
				);
			} else {
				set.add(UNKNOWN);
			}
		}
	} else {
		set.add(UNKNOWN);
	}
}

/**
 * @param {AST.Text | AST.ExpressionTag} chunk
 * @param {boolean} is_class
 * @returns {string[] | null}
 */
export function get_possible_values(chunk, is_class) {
	const values = new Set();

	if (chunk.type === 'Text') {
		values.add(chunk.data);
	} else {
		gather_possible_values(chunk.expression, is_class, values);
	}

	if (values.has(UNKNOWN)) return null;
	return [...values].map((value) => String(value));
}

/**
 * Returns all parent rules; root is last
 * @param {AST.CSS.Rule | null} rule
 */
export function get_parent_rules(rule) {
	const rules = [];

	while (rule) {
		rules.push(rule);
		rule = rule.metadata.parent_rule;
	}

	return rules;
}

/**
 * True if is `:global(...)` or `:global` and no pseudo class that is scoped.
 * @param {AST.CSS.RelativeSelector} relative_selector
 * @returns {relative_selector is AST.CSS.RelativeSelector & { selectors: [AST.CSS.PseudoClassSelector, ...Array<AST.CSS.PseudoClassSelector | AST.CSS.PseudoElementSelector>] }}
 */
export function is_global(relative_selector) {
	const first = relative_selector.selectors[0];

	return (
		first.type === 'PseudoClassSelector' &&
		first.name === 'global' &&
		(first.args === null ||
			// Only these two selector types keep the whole selector global, because e.g.
			// :global(button).x means that the selector is still scoped because of the .x
			relative_selector.selectors.every(
				(selector) =>
					is_unscoped_pseudo_class(selector) || selector.type === 'PseudoElementSelector'
			))
	);
}

/**
 * `true` if is a pseudo class that cannot be or is not scoped
 * @param {AST.CSS.SimpleSelector} selector
 */
export function is_unscoped_pseudo_class(selector) {
	return (
		selector.type === 'PseudoClassSelector' &&
		// These make the selector scoped
		((selector.name !== 'has' &&
			selector.name !== 'is' &&
			selector.name !== 'where' &&
			// Not is special because we want to scope as specific as possible, but because :not
			// inverses the result, we want to leave the unscoped, too. The exception is more than
			// one selector in the :not (.e.g :not(.x .y)), then .x and .y should be scoped
			(selector.name !== 'not' ||
				selector.args === null ||
				selector.args.children.every((c) => c.children.length === 1))) ||
			// selectors with has/is/where/not can also be global if all their children are global
			selector.args === null ||
			selector.args.children.every((c) => c.children.every((r) => is_global(r))))
	);
}

/**
 * True if is `:global(...)` or `:global`, irrespective of whether or not there are any pseudo classes that are scoped.
 * Difference to `is_global`: `:global(x):has(y)` is `true` for `is_outer_global` but `false` for `is_global`.
 * @param {AST.CSS.RelativeSelector} relative_selector
 * @returns {relative_selector is AST.CSS.RelativeSelector & { selectors: [AST.CSS.PseudoClassSelector, ...Array<AST.CSS.PseudoClassSelector | AST.CSS.PseudoElementSelector>] }}
 */
export function is_outer_global(relative_selector) {
	const first = relative_selector.selectors[0];

	return (
		first.type === 'PseudoClassSelector' &&
		first.name === 'global' &&
		(first.args === null ||
			// Only these two selector types can keep the whole selector global, because e.g.
			// :global(button).x means that the selector is still scoped because of the .x
			relative_selector.selectors.every(
				(selector) =>
					selector.type === 'PseudoClassSelector' || selector.type === 'PseudoElementSelector'
			))
	);
}
