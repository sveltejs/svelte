import { x, p } from 'code-red';

/**
 * @param {import('../../Block.js').default} block
 * @param {import('../../../nodes/shared/TemplateScope.js').default} scope
 * @param {import('../../../nodes/Let.js').default[]} lets
 */
export function get_slot_definition(block, scope, lets) {
	if (lets.length === 0) return { block, scope };
	const context_input = {
		type: 'ObjectPattern',
		properties: lets.map((l) => ({
			type: 'Property',
			kind: 'init',
			key: l.name,
			value: l.value || l.name
		}))
	};
	const properties = [];
	const value_map = new Map();
	lets.forEach((l) => {
		/** @type {import('estree').Identifier} */
		let value;
		if (l.names.length > 1) {
			// more than one, probably destructuring
			const unique_name = block.get_unique_name(l.names.join('_')).name;
			value_map.set(l.value, unique_name);
			value = { type: 'Identifier', name: unique_name };
		} else {
			value = l.value || l.name;
		}
		properties.push({
			type: 'Property',
			kind: 'init',
			key: l.name,
			value
		});
	});
	const changes_input = {
		type: 'ObjectPattern',
		properties
	};

	/** @type {Set<string>} */
	const names = new Set();

	/** @type {Map<string, string>} */
	const names_lookup = new Map();
	lets.forEach((l) => {
		l.names.forEach((name) => {
			names.add(name);
			if (value_map.has(l.value)) {
				names_lookup.set(name, value_map.get(l.value));
			}
		});
	});
	const context = {
		type: 'ObjectExpression',
		properties: Array.from(names).map(
			(name) => p`${block.renderer.context_lookup.get(name).index}: ${name}`
		)
	};
	const { context_lookup } = block.renderer;
	// i am well aware that this code is gross
	// TODO: context-overflow make it less gross
	const changes = {
		type: 'ParenthesizedExpression',
		get expression() {
			if (block.renderer.context_overflow) {
				const grouped = [];
				Array.from(names).forEach((name) => {
					const i = /** @type {number} */ (context_lookup.get(name).index.value);
					const g = Math.floor(i / 31);
					const lookup_name = names_lookup.has(name) ? names_lookup.get(name) : name;
					if (!grouped[g]) grouped[g] = [];
					grouped[g].push({ name: lookup_name, n: i % 31 });
				});
				const elements = [];
				for (let g = 0; g < grouped.length; g += 1) {
					elements[g] = grouped[g]
						? grouped[g]
								.map(({ name, n }) => x`${name} ? ${1 << n} : 0`)
								.reduce((lhs, rhs) => x`${lhs} | ${rhs}`)
						: x`0`;
				}
				return {
					type: 'ArrayExpression',
					elements
				};
			}
			return /** @type {import('estree').BinaryExpression} */ (
				Array.from(names)
					.map((name) => {
						const lookup_name = names_lookup.has(name) ? names_lookup.get(name) : name;
						const i = /** @type {number} */ (context_lookup.get(name).index.value);
						return x`${lookup_name} ? ${1 << i} : 0`;
					})
					.reduce((lhs, rhs) => x`${lhs} | ${rhs}`)
			);
		}
	};
	return {
		block,
		scope,
		get_context: x`${context_input} => ${context}`,
		get_changes: x`${changes_input} => ${changes}`
	};
}
