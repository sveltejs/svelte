/** @import { Expression, Node, Pattern, Statement } from 'estree' */
/** @import { Visitors } from '../types' */
import is_reference from 'is-reference';
import { serialize_get_binding, serialize_set_binding } from '../utils.js';
import * as b from '../../../../utils/builders.js';
import { is_ignored } from '../../../../state.js';

/** @type {Visitors} */
export const global_visitors = {
	Identifier(node, { path, state }) {
		if (is_reference(node, /** @type {Node} */ (path.at(-1)))) {
			if (node.name === '$$props') {
				return b.id('$$sanitized_props');
			}

			// Optimize prop access: If it's a member read access, we can use the $$props object directly
			const binding = state.scope.get(node.name);
			if (
				state.analysis.runes && // can't do this in legacy mode because the proxy does more than just read/write
				binding !== null &&
				node !== binding.node &&
				binding.kind === 'rest_prop'
			) {
				const parent = path.at(-1);
				const grand_parent = path.at(-2);
				if (
					parent?.type === 'MemberExpression' &&
					!parent.computed &&
					grand_parent?.type !== 'AssignmentExpression' &&
					grand_parent?.type !== 'UpdateExpression'
				) {
					return b.id('$$props');
				}
			}

			return serialize_get_binding(node, state);
		}
	},
	MemberExpression(node, { state, next }) {
		// rewrite `this.#foo` as `this.#foo.v` inside a constructor
		if (node.property.type === 'PrivateIdentifier') {
			const field = state.private_state.get(node.property.name);
			if (field) {
				return state.in_constructor ? b.member(node, b.id('v')) : b.call('$.get', node);
			}
		} else if (node.object.type === 'ThisExpression') {
			// rewrite `this.foo` as `this.#foo.v` inside a constructor
			if (node.property.type === 'Identifier' && !node.computed) {
				const field = state.public_state.get(node.property.name);

				if (field && state.in_constructor) {
					return b.member(b.member(b.this, field.id), b.id('v'));
				}
			}
		}
		next();
	},
	AssignmentExpression(node, context) {
		return serialize_set_binding(node, context, context.next);
	},
	UpdateExpression(node, context) {
		const { state, next, visit } = context;
		const argument = node.argument;

		if (argument.type === 'Identifier') {
			const binding = state.scope.get(argument.name);
			const is_store = binding?.kind === 'store_sub';
			const name = is_store ? argument.name.slice(1) : argument.name;

			// use runtime functions for smaller output
			if (
				binding?.kind === 'state' ||
				binding?.kind === 'frozen_state' ||
				binding?.kind === 'each' ||
				binding?.kind === 'legacy_reactive' ||
				binding?.kind === 'prop' ||
				binding?.kind === 'bindable_prop' ||
				is_store
			) {
				/** @type {Expression[]} */
				const args = [];

				let fn = '$.update';
				if (node.prefix) fn += '_pre';

				if (is_store) {
					fn += '_store';
					args.push(serialize_get_binding(b.id(name), state), b.call('$' + name));
				} else {
					if (binding.kind === 'prop' || binding.kind === 'bindable_prop') fn += '_prop';
					args.push(b.id(name));
				}

				if (node.operator === '--') {
					args.push(b.literal(-1));
				}

				return b.call(fn, ...args);
			}

			return next();
		} else if (
			argument.type === 'MemberExpression' &&
			argument.object.type === 'ThisExpression' &&
			argument.property.type === 'PrivateIdentifier' &&
			context.state.private_state.has(argument.property.name)
		) {
			let fn = '$.update';
			if (node.prefix) fn += '_pre';

			/** @type {Expression[]} */
			const args = [argument];
			if (node.operator === '--') {
				args.push(b.literal(-1));
			}

			return b.call(fn, ...args);
		} else {
			/** @param {any} serialized */
			function maybe_skip_ownership_validation(serialized) {
				if (is_ignored(node, 'ownership_invalid_mutation')) {
					return b.call('$.skip_ownership_validation', b.thunk(serialized));
				}

				return serialized;
			}

			// turn it into an IIFEE assignment expression: i++ -> (() => { const $$value = i; i+=1; return $$value; })
			const assignment = b.assignment(
				node.operator === '++' ? '+=' : '-=',
				/** @type {Pattern} */ (argument),
				b.literal(1)
			);
			const serialized_assignment = serialize_set_binding(
				assignment,
				context,
				() => assignment,
				node.prefix
			);
			const value = /** @type {Expression} */ (visit(argument));
			if (serialized_assignment === assignment) {
				// No change to output -> nothing to transform -> we can keep the original update expression
				return maybe_skip_ownership_validation(next());
			} else if (context.state.analysis.runes) {
				return maybe_skip_ownership_validation(serialized_assignment);
			} else {
				/** @type {Statement[]} */
				let statements;
				if (node.prefix) {
					statements = [b.stmt(serialized_assignment), b.return(value)];
				} else {
					const tmp_id = state.scope.generate('$$value');
					statements = [
						b.const(tmp_id, value),
						b.stmt(serialized_assignment),
						b.return(b.id(tmp_id))
					];
				}
				return maybe_skip_ownership_validation(b.call(b.thunk(b.block(statements))));
			}
		}
	}
};
