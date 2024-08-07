/** @import { Program, Expression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { is_prop_source } from '../utils.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {Program} node
 * @param {ComponentContext} context
 */
export function Program(node, context) {
	if (context.state.is_instance) {
		for (const [name, binding] of context.state.scope.declarations) {
			if (binding.kind === 'store_sub') {
				context.state.getters[name] = (node) => b.call(node);
			}

			if (binding.kind === 'prop' || binding.kind === 'bindable_prop') {
				if (is_prop_source(binding, context.state)) {
					context.state.getters[name] = (node) => b.call(node);
				} else if (binding.prop_alias) {
					const key = b.key(binding.prop_alias);
					context.state.getters[name] = (node) =>
						b.member(b.id('$$props'), key, key.type === 'Literal');
				} else {
					context.state.getters[name] = (node) => b.member(b.id('$$props'), node);
				}
			}
		}
	}

	context.next();
}
