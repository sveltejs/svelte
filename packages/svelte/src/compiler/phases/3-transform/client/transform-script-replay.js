/** @import * as ESTree from 'estree' */
/** @import { ComponentContext } from './types.js' */
import * as b from '#compiler/builders';

/**
 * Each admitted attempt invokes this factory. Only the stable prefix and the
 * runtime's producer sites live outside it; ordinary snapshots are lexical locals.
 * The runtime owns suspension/context validation, before any following stage runs.
 *
 * @param {ComponentContext} context
 * @returns {ESTree.Statement[]}
 */
export function transform_script_replay(context) {
	const replay = /** @type {NonNullable<typeof context.state.analysis.script_replay>} */ (
		context.state.analysis.script_replay
	);
	const bindings = b.id(context.state.scope.generate('$$bindings'));
	const transform = { ...context.state.transform };
	/** @type {ESTree.Identifier[]} */
	const locals = [];
	/** @type {ESTree.Expression[]} */
	const stages = [];
	/** @type {ESTree.Expression[]} */
	const kinds = [];
	/** @type {ESTree.Expression[]} */
	const checkpoints = [];

	for (const [binding, { index, kind }] of replay.bindings) {
		const slot = b.literal(index);
		transform[binding.node.name] = {
			// Even plain locals select this view's published value. A producer retained
			// from an older fork must not keep reading that fork's lexical snapshot
			// after a different attempt establishes the component's permanent state.
			read: () => b.call('$.get', b.member(bindings, slot, true))
		};

		context.state.transform[binding.node.name] = {
			read: () =>
				kind === 'local'
					? b.call('$.script_value', replay.id, slot)
					: b.call('$.get', b.call('$.script_binding', replay.id, slot))
		};
		if (kind === 'local') locals.push(binding.node);
	}

	for (const [binding, { kind, expression, checkpoint }] of replay.bindings) {
		const value = /** @type {ESTree.Expression} */ (
			context.visit(expression, { ...context.state, transform })
		);
		stages.push(b.arrow([], kind === 'local' ? b.assignment('=', binding.node, value) : value));
		kinds.push(b.literal(kind));
		checkpoints.push(b.literal(checkpoint));
	}

	/** @type {ESTree.Statement[]} */
	const body = [b.return(b.array(stages))];
	if (locals.length) {
		body.unshift(
			b.declaration(
				'let',
				locals.map((id) => b.declarator(id))
			)
		);
	}

	return [
		b.const(
			replay.id,
			b.call(
				'$.script_replay',
				b.arrow([bindings], b.block(body)),
				b.array(kinds),
				b.array(checkpoints)
			)
		)
	];
}
