/** @import { Expression, Property } from 'estree' */
/** @import { ComponentContext, Context } from '../../types' */
import * as b from '#compiler/builders';

/**
 * The `onchange` callback from a `$state` rune's options argument, if any
 * @param {Expression | undefined} options the rune's second argument
 * @param {ComponentContext | Context} context
 * @returns {Expression | undefined}
 */
export function get_onchange(options, context) {
	if (options === undefined) return;

	if (
		options.type === 'ObjectExpression' &&
		options.properties.every(
			(property) => property.type === 'Property' && property.kind === 'init' && !property.computed
		)
	) {
		/** @type {Property | undefined} */
		let onchange;

		for (const property of /** @type {Property[]} */ (options.properties)) {
			const key = property.key;

			if (
				(key.type === 'Identifier' && key.name === 'onchange') ||
				(key.type === 'Literal' && key.value === 'onchange')
			) {
				onchange = property;
			}
		}

		return onchange && /** @type {Expression} */ (context.visit(onchange.value));
	}

	// spreads, accessors, computed keys and options held in a variable are only known at runtime
	return b.member(/** @type {Expression} */ (context.visit(options)), 'onchange', false, true);
}

/**
 * Wraps a `$.state(...)` call so `onchange` is registered on the source
 * @param {Expression} call
 * @param {Expression | undefined} onchange
 */
export function with_onchange(call, onchange) {
	return onchange === undefined ? call : b.call('$.onchange', call, onchange);
}
