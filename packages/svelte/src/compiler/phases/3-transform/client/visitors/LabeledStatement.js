/** @import { Expression, LabeledStatement, Statement } from 'estree' */
/** @import { ReactiveStatement } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_getter } from '../utils.js';

/**
 * @param {LabeledStatement} node
 * @param {ComponentContext} context
 */
export function LabeledStatement(node, context) {
	if (context.state.analysis.runes || context.path.length > 1 || node.label.name !== '$') {
		context.next();
		return;
	}

	// To recreate Svelte 4 behaviour, we track the dependencies
	// the compiler can 'see', but we untrack the effect itself
	const reactive_statement = /** @type {ReactiveStatement} */ (
		context.state.analysis.reactive_statements.get(node)
	);

	if (!reactive_statement) return; // not the instance context

	let serialized_body = /** @type {Statement} */ (context.visit(node.body));

	if (serialized_body.type !== 'BlockStatement') {
		serialized_body = b.block([serialized_body]);
	}

	const body = serialized_body.body;

	/** @type {Expression[]} */
	const sequence = [];

	for (const binding of reactive_statement.dependencies) {
		if (binding.kind === 'normal') continue;

		const name = binding.node.name;
		let serialized = build_getter(b.id(name), context.state);

		// If the binding is a prop, we need to deep read it because it could be fine-grained $state
		// from a runes-component, where mutations don't trigger an update on the prop as a whole.
		if (name === '$$props' || name === '$$restProps' || binding.kind === 'bindable_prop') {
			serialized = b.call('$.deep_read_state', serialized);
		}

		sequence.push(serialized);
	}

	// these statements will be topologically ordered later
	context.state.legacy_reactive_statements.set(
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
}
