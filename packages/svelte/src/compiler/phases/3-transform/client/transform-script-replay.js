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
	const thunks = [];
	/** @type {ESTree.Expression[]} */
	const kinds = [];
	/** @type {ESTree.Expression[]} */
	const checkpoints = [];
	/** @type {ESTree.Expression[]} */
	const groups = [];

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
				kind === 'local' || kind === 'await'
					? b.call('$.script_value', replay.id, slot)
					: b.call('$.get', b.call('$.script_binding', replay.id, slot))
		};
		if (kind === 'local') locals.push(binding.node);
	}

	for (const { kind, expression, checkpoint } of replay.stages) {
		// Initialization-only synchronous code runs in its original group below,
		// never in independently scheduled callbacks with microtasks between them.
		const value =
			kind === 'local' || kind === 'statement'
				? b.void0
				: /** @type {ESTree.Expression} */ (
						context.visit(expression, { ...context.state, transform })
					);
		thunks.push(b.arrow([], value));
		kinds.push(b.literal(kind));
		checkpoints.push(b.literal(checkpoint));
	}

	for (const { start, end } of replay.groups) {
		const group_transform = { ...transform };
		const stages = replay.stages.slice(start, end);
		for (const { binding, kind } of stages) {
			if (binding && kind === 'local')
				group_transform[binding.node.name] = { read: (node) => node };
		}

		/** @type {ESTree.Statement[]} */
		const statements = [];
		/** @type {ESTree.Expression[]} */
		const values = [];
		for (const { binding, kind, expression } of stages) {
			if (kind === 'derived') {
				// Derived creation is lazy and retains the stable per-site reader above.
				values.push(b.void0);
				continue;
			}
			const value = /** @type {ESTree.Expression} */ (
				context.visit(expression, { ...context.state, transform: group_transform })
			);
			if (binding) {
				statements.push(b.stmt(b.assignment('=', binding.node, value)));
				values.push(binding.node);
			} else {
				statements.push(b.stmt(b.call('$.untrack', b.arrow([], b.unary('void', value)))));
				values.push(b.void0);
			}
		}
		statements.push(b.return(b.array(values)));
		// Runtime ABI: [startSite, endSiteExclusive, thunkIndex].
		groups.push(b.array([b.literal(start), b.literal(end), b.literal(thunks.length)]));
		thunks.push(b.arrow([], b.block(statements)));
	}

	/** @type {ESTree.Statement[]} */
	const body = [b.return(b.array(thunks))];
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
				b.array(checkpoints),
				b.array(groups)
			)
		)
	];
}
