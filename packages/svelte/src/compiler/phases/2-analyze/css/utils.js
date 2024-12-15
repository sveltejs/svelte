/** @import { AST } from '#compiler' */
/** @import { Node } from 'estree' */
const UNKNOWN = {};

/**
 * @param {Node} node
 * @param {Set<any>} set
 */
function gather_possible_values(node, set) {
	if (node.type === 'Literal') {
		set.add(String(node.value));
	} else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, set);
		gather_possible_values(node.alternate, set);
	} else {
		set.add(UNKNOWN);
	}
}

/**
 * @param {AST.Text | AST.ExpressionTag} chunk
 * @returns {Set<string> | null}
 */
export function get_possible_values(chunk) {
	const values = new Set();

	if (chunk.type === 'Text') {
		values.add(chunk.data);
	} else {
		gather_possible_values(chunk.expression, values);
	}

	if (values.has(UNKNOWN)) return null;
	return values;
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
