import Let from '../../../nodes/Let';

export function get_context_merger(lets: Let[]) {
	if (lets.length === 0) return null;

	const input = lets.map(l => l.value ? `${l.name}: ${l.value}` : l.name).join(', ');
	const output = lets.map(l => l.names.join(', ')).join(', ');

	return `({ ${input} }) => ({ ${output} })`;
}