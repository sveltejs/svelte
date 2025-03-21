/** @import { Expression, Property } from 'estree' */
/** @import { ComponentContext } from '../../types' */
import * as b from '../../../../../utils/builders.js';

/**
 *
 * @param {Expression} options
 * @param {ComponentContext} context
 * @returns {Expression | undefined}
 */
export function get_onchange(options, context) {
	if (!options) {
		return undefined;
	}

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

		if (!onchange) {
			return undefined;
		}

		return /** @type {Expression} */ (context.visit(onchange.value));
	}

	return b.member(/** @type {Expression} */ (context.visit(options)), 'onchange');
}
