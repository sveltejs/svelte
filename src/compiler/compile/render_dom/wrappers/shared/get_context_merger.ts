import Let from '../../../nodes/Let';
import { x } from 'code-red';

export function get_context_merger(lets: Let[]) {
	if (lets.length === 0) return null;

	const input = {
		type: 'ObjectPattern',
		properties: lets.map(l => ({
			type: 'Property',
			kind: 'init',
			key: l.name,
			value: l.value || l.name
		}))
	};

	const names = new Set();
	lets.forEach(l => {
		l.names.forEach(name => {
			names.add(name);
		});
	});

	const output = {
		type: 'ObjectExpression',
		properties: Array.from(names).map(name => {
			const id = { type: 'Identifier', name };

			return {
				type: 'Property',
				kind: 'init',
				key: id,
				value: id
			};
		})
	};

	return x`(${input}) => (${output})`;
}