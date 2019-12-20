import Let from '../../../nodes/Let';
import { x, p } from 'code-red';
import Block from '../../Block';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import { BinaryExpression } from 'estree';

export function get_slot_definition(block: Block, scope: TemplateScope, lets: Let[]) {
	if (lets.length === 0) return { block, scope };

	const input = {
		type: 'ObjectPattern',
		properties: lets.map(l => ({
			type: 'Property',
			kind: 'init',
			key: l.name,
			value: l.value || l.name
		}))
	};

	const names: Set<string> = new Set();
	lets.forEach(l => {
		l.names.forEach(name => {
			names.add(name);
		});
	});

	const context = {
		type: 'ObjectExpression',
		properties: Array.from(names).map(name => p`${block.renderer.context_lookup.get(name).index}: ${name}`)
	};

	const { context_lookup } = block.renderer;

	// i am well aware that this code is gross
	// TODO make it less gross
	const changes = {
		type: 'ParenthesizedExpression',
		get expression() {
			if (block.renderer.context_overflow) {
				const grouped = [];

				Array.from(names).forEach(name => {
					const i = context_lookup.get(name).index.value as number;
					const g = Math.floor(i / 31);

					if (!grouped[g]) grouped[g] = [];
					grouped[g].push({ name, n: i % 31 });
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

			return Array.from(names)
				.map(name => {
					const i = context_lookup.get(name).index.value as number;
					return x`${name} ? ${1 << i} : 0`;
				})
				.reduce((lhs, rhs) => x`${lhs} | ${rhs}`) as BinaryExpression;
		}
	};

	return {
		block,
		scope,
		get_context: x`${input} => ${context}`,
		get_changes: x`${input} => ${changes}`
	};
}