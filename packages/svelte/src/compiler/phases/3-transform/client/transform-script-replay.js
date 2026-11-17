/** @import * as ESTree from 'estree' */
/** @import { ComponentContext, ClientTransformState } from './types.js' */
import * as b from '#compiler/builders';

/**
 * The factory owns every user binding and statement before the first suspension,
 * as well as the continuation environment. Only compiler scaffolding stays outside.
 * Native lexical transforms run inside the factory; its continuations and the
 * presentation deliberately select bindings through the runtime's live facade.
 *
 * @param {ComponentContext} context
 * @returns {ESTree.Statement[]}
 */
export function transform_script_replay(context) {
	const replay = /** @type {NonNullable<typeof context.state.analysis.script_replay>} */ (
		context.state.analysis.script_replay
	);
	const bindings = b.id(context.state.scope.generate('$$bindings'));
	const facade = b.id(context.state.scope.generate('$$access'));
	const lexical = { ...context.state.transform };

	const prefix = context.state.analysis.instance_body.sync.map(
		(node) =>
			/** @type {ESTree.Statement} */ (
				context.visit(node, {
					...context.state,
					transform: lexical,
					script_replay_factory: facade
				})
			)
	);
	const transform = { ...lexical };
	/** @type {ESTree.Expression[]} */
	const environment = [];
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

	for (const [binding, { index, reactive }] of replay.environment) {
		const id = b.id(binding.node.name);
		const native = lexical[id.name];
		const slot = b.literal(index);
		const value = b.id(context.state.scope.generate('$$value'));
		const proxy = b.id(context.state.scope.generate('$$proxy'));
		const delta = b.id(context.state.scope.generate('$$delta'));
		const pre = b.id(context.state.scope.generate('$$pre'));

		const properties = [
			b.init('reactive', b.literal(reactive)),
			b.init('read', b.arrow([], native ? native.read(id) : id))
		];

		if (binding.reassigned) {
			const assign = native?.assign
				? binding.kind === 'state'
					? b.conditional(proxy, native.assign(id, value, true), native.assign(id, value, false))
					: native.assign(id, value, false)
				: b.assignment('=', id, value);
			properties.push(b.init('assign', b.arrow([value, proxy], assign)));

			/** @param {'++' | '--'} operator @param {boolean} prefix */
			const update = (operator, prefix) => {
				const node = b.update(operator, id, prefix);
				return native?.update ? native.update(node) : node;
			};
			properties.push(
				b.init(
					'update',
					b.arrow(
						[delta, pre],
						b.conditional(
							b.binary('===', delta, b.literal(-1)),
							b.conditional(pre, update('--', true), update('--', false)),
							b.conditional(pre, update('++', true), update('++', false))
						)
					)
				)
			);
		}
		environment.push(b.object(properties));

		/**
		 * Select the accessor before RHS evaluation, preserving assignment reference
		 * semantics even if the RHS reenters the runtime and selects another view.
		 * @param {() => ESTree.Expression} read
		 * @param {() => ESTree.Expression} accessor
		 * @returns {ClientTransformState['transform'][string]}
		 */
		const indirect = (read, accessor) => ({
			read,
			...(binding.reassigned
				? {
						assign: (_, value, proxy = false) =>
							b.call(b.member(accessor(), 'assign'), value, proxy && b.true),
						update: (node) =>
							b.call(
								b.member(accessor(), 'update'),
								b.literal(node.operator === '--' ? -1 : 1),
								b.literal(node.prefix)
							)
					}
				: {}),
			// Native runes state/proxy mutation is already an expression rooted at the
			// selected value. Bindable-prop notification hooks are rejected by analysis
			// until they can preserve that same selected reference through the RHS.
			...(native?.mutate ? { mutate: (_, mutation) => mutation } : {})
		});
		transform[id.name] = indirect(
			() => b.call(b.member(facade, 'read'), slot),
			() => b.call(b.member(facade, 'get'), slot)
		);
		context.state.transform[id.name] = indirect(
			() => b.call('$.script_read', replay.id, slot),
			() => b.call('$.script_accessor', replay.id, slot)
		);
	}

	for (const [binding, { index, kind }] of replay.bindings) {
		const slot = b.literal(index);
		transform[binding.node.name] = {
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
				statements.push(b.stmt(b.unary('void', value)));
				values.push(b.void0);
			}
		}
		statements.push(b.return(b.array(values)));
		// Runtime ABI: [startSite, endSiteExclusive, thunkIndex].
		groups.push(b.array([b.literal(start), b.literal(end), b.literal(thunks.length)]));
		thunks.push(b.arrow([], b.block(statements)));
	}

	const body = [...prefix];
	if (locals.length)
		body.push(
			b.declaration(
				'let',
				locals.map((id) => b.declarator(id))
			)
		);
	body.push(
		b.return(
			b.object([b.init('thunks', b.array(thunks)), b.init('environment', b.array(environment))])
		)
	);
	return [
		b.const(
			replay.id,
			b.call(
				'$.script_replay',
				b.arrow([bindings, facade], b.block(body)),
				b.array(kinds),
				b.array(checkpoints),
				b.array(groups)
			)
		)
	];
}
