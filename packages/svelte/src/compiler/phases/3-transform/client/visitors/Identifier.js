/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import * as b from '../../../../utils/builders.js';
import { build_getter } from '../utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	let parent = context.path.at(-1);

	if (is_reference(node, /** @type {Node} */ (parent))) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		// Optimize prop access: If it's a member read access, we can use the $$props object directly
		const binding = context.state.scope.get(node.name);
		if (
			context.state.analysis.runes && // can't do this in legacy mode because the proxy does more than just read/write
			binding !== null &&
			node !== binding.node &&
			binding.kind === 'rest_prop'
		) {
			const grand_parent = context.path.at(-2);

			if (
				parent?.type === 'MemberExpression' &&
				!parent.computed &&
				grand_parent?.type !== 'AssignmentExpression' &&
				grand_parent?.type !== 'UpdateExpression'
			) {
				return b.id('$$props');
			}
		}

		const getter = build_getter(node, context.state);

		if (
			// this means we are inside an if or as an attribute of a dynamic component
			// and we want to access `$$safe_props` to allow for the component to access them
			// after destructuring
			context.state.safe_props_name != null &&
			context.state.safe_props_ids != null &&
			// the parent can either be a component/svelte component in that case we
			// check if this identifier is one of the attributes
			(((parent?.type === 'Component' || parent?.type === 'SvelteComponent') &&
				parent.attributes.some(
					(el) =>
						(el.type === 'Attribute' &&
							typeof el.value !== 'boolean' &&
							!Array.isArray(el.value) &&
							el.value.expression === node) ||
						(el.type === 'BindDirective' && el.expression === node)
				)) ||
				// or a spread and we check the expression
				(parent?.type === 'SpreadAttribute' && parent.expression === node)) &&
			// we also don't want to transform bindings that are defined withing the if block
			// itself (for example an each local variable)
			!binding?.references[0].path.some((node) => node.type === 'IfBlock')
		) {
			// we store the getter in the safe props id and return an access to `$$safe_props.name`
			context.state.safe_props_ids.set(node.name, getter);
			return b.member(b.id(context.state.safe_props_name), b.id(node.name));
		}

		return getter;
	}
}
