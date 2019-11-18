import Let from '../../../nodes/Let';
import { x, p } from 'code-red';
import Renderer from '../../Renderer';

export function get_context_merger(renderer: Renderer, lets: Let[]) {
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

	const names: Set<string> = new Set();
	lets.forEach(l => {
		l.names.forEach(name => {
			names.add(name);
		});
	});

	const output = {
		type: 'ObjectExpression',
		properties: Array.from(names).map(name => p`${renderer.context_lookup.get(name)}: ${name}`)
	};

	return x`(${input}) => (${output})`;
}