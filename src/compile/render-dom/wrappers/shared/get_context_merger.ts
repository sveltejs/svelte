import Let from '../../../nodes/Let';

export function get_context_merger(lets: Let[]) {
	if (lets.length === 0) return null;

	return `({ ${lets.map(l => l.name).join(', ')} }) => ({ ${lets.map(l => l.name).join(', ')} })`;
}