import Let from '../../../nodes/Let';
import { x, p } from 'code-red';
import Block from '../../Block';
import TemplateScope from '../../../nodes/shared/TemplateScope';

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
		properties: Array.from(names).map(name => p`${block.renderer.context_lookup.get(name)}: ${name}`)
	};

	const changes = Array.from(names)
		.map(name => {
			const i = block.renderer.context_lookup.get(name);
			return x`${name} ? ${1 << i} : 0`;
		})
		.reduce((lhs, rhs) => x`${lhs} | ${rhs}`);

	return {
		block,
		scope,
		get_context: x`${input} => ${context}`,
		get_changes: x`${input} => ${changes}`
	};
}