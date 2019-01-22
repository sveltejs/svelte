import Let from '../../../nodes/Let';

export function get_slot_context(lets: Let[]) {
	if (lets.length === 0) return '';
	return `{ ${lets.map(l => `${l.name}: ${l.name}`)} }`; // TODO support aliased/destructured lets
}