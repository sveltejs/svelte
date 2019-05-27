import Let from '../../../nodes/Let';

export function get_slot_scope(lets: Let[]) {
	if (lets.length === 0) return '';
	return `{ ${lets.map(l => l.value ? `${l.name}: ${l.value}` : l.name).join(', ')} }`;
}