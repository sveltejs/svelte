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
	if (options?.type !== 'ObjectExpression') return;

	const property = options.properties.find(
		(property) =>
			property.type === 'Property' &&
			!property.computed &&
			property.key.type === 'Identifier' &&
			property.key.name === 'onchange'
	);

	if (property === undefined) return;

	return /** @type {Expression} */ (context.visit(/** @type {Property} */ (property).value));
}

/**
 * Wraps a `$.state(...)` call so `onchange` is registered on the source
 * @param {Expression} call
 * @param {Expression | undefined} onchange
 */
export function with_onchange(call, onchange) {
	return onchange === undefined ? call : b.call('$.onchange', call, onchange);
}
