/** @import { Expression, Identifier } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import * as e from '../../../errors.js';
import { Runes } from '../../constants.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	if (context.state.analysis.runes) {
		let i = context.path.length;
		let parent = /** @type {Expression} */ (context.path[--i]);

		if (
			Runes.includes(/** @type {Runes[number]} */ (node.name)) &&
			is_reference(node, parent) &&
			context.state.scope.get(node.name) === null &&
			context.state.scope.get(node.name.slice(1)) === null
		) {
			/** @type {Expression} */
			let current = node;
			let name = node.name;

			while (parent.type === 'MemberExpression') {
				if (parent.computed) e.rune_invalid_computed_property(parent);
				name += `.${/** @type {Identifier} */ (parent.property).name}`;

				current = parent;
				parent = /** @type {Expression} */ (context.path[--i]);

				if (!Runes.includes(/** @type {Runes[number]} */ (name))) {
					if (name === '$effect.active') {
						e.rune_renamed(parent, '$effect.active', '$effect.tracking');
					}

					e.rune_invalid_name(parent, name);
				}
			}

			if (parent.type !== 'CallExpression') {
				e.rune_missing_parentheses(current);
			}
		}
	}
}
