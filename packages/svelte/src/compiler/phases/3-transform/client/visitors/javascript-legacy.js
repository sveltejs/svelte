/** @import { ReactiveStatement } from '#compiler' */
/** @import { ComponentVisitors } from '../types.js' */
/** @import { Expression, Statement } from 'estree' */
import * as b from '../../../../utils/builders.js';
import { serialize_get_binding } from '../utils.js';

/** @type {ComponentVisitors} */
export const javascript_visitors_legacy = {
	LabeledStatement(node, context) {
		if (context.path.length > 1 || node.label.name !== '$') {
			context.next();
			return;
		}

		const state = context.state;
		// To recreate Svelte 4 behaviour, we track the dependencies
		// the compiler can 'see', but we untrack the effect itself
		const reactive_stmt = /** @type {ReactiveStatement} */ (
			state.analysis.reactive_statements.get(node)
		);

		if (!reactive_stmt) return; // not the instance context

		const { dependencies } = reactive_stmt;

		let serialized_body = /** @type {Statement} */ (context.visit(node.body));

		if (serialized_body.type !== 'BlockStatement') {
			serialized_body = b.block([serialized_body]);
		}

		const body = serialized_body.body;

		/** @type {Expression[]} */
		const sequence = [];
		for (const binding of dependencies) {
			if (binding.kind === 'normal') continue;

			const name = binding.node.name;
			let serialized = serialize_get_binding(b.id(name), state);

			// If the binding is a prop, we need to deep read it because it could be fine-grained $state
			// from a runes-component, where mutations don't trigger an update on the prop as a whole.
			if (name === '$$props' || name === '$$restProps' || binding.kind === 'bindable_prop') {
				serialized = b.call('$.deep_read_state', serialized);
			}

			sequence.push(serialized);
		}

		// these statements will be topologically ordered later
		state.legacy_reactive_statements.set(
			node,
			b.stmt(
				b.call(
					'$.legacy_pre_effect',
					sequence.length > 0 ? b.thunk(b.sequence(sequence)) : b.thunk(b.block([])),
					b.thunk(b.block(body))
				)
			)
		);

		return b.empty;
	},
	BreakStatement(node, context) {
		if (!node.label || node.label.name !== '$') return;

		const in_reactive_statement =
			context.path[1].type === 'LabeledStatement' && context.path[1].label.name === '$';
		if (in_reactive_statement) {
			return b.return();
		}
	}
};
