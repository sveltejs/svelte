/** @import { Expression, Property } from 'estree' */
/** @import { ComponentContext } from '../../types' */
import * as b from '../../../../../utils/builders.js';

/**
 * Extract the `onchange` callback from the options passed to `$state`
 * @param {Expression} options
 * @param {ComponentContext} context
 * @returns {Expression | undefined}
 */
export function get_onchange(options, context) {
	if (!options) return;

	if (options.type === 'ObjectExpression') {
		const onchange = /** @type {Property | undefined} */ (
			options.properties.find(
				(property) =>
					property.type === 'Property' &&
					!property.computed &&
					property.key.type === 'Identifier' &&
					property.key.name === 'onchange'
			)
		);

		if (!onchange) return;

		return /** @type {Expression} */ (context.visit(onchange.value));
	}

	return b.member(/** @type {Expression} */ (context.visit(options)), 'onchange');
}
