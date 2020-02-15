import Let from '../../../nodes/Let';
import { ObjectPattern } from 'estree';

export function get_slot_scope(lets: Let[]): ObjectPattern {
	if (lets.length === 0) return null;

	return {
		type: 'ObjectPattern',
		properties: lets.map(l => {
			return {
				type: 'Property',
				kind: 'init',
				method: false,
				shorthand: false,
				computed: false,
				key: l.name,
				value: l.value || l.name
			};
		})
	};
}