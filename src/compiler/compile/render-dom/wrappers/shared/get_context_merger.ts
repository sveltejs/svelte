import Let from '../../../nodes/Let';

export function get_context_merger(lets: Let[]) {
	if (lets.length === 0) return null;

	const input = lets.map(l => l.value ? `${l.name}: ${l.value}` : l.name).join(', ');

	const names = new Set();
	lets.forEach(l => {
		l.names.forEach(name => {
			names.add(name);
		});
	});

	const output = Array.from(names).join(', ');

	return `({ ${input} }) => ({ ${output} })`;
}