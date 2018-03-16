import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function immutable(validator: Validator, prop: Node) {
	if (prop.value.type !== 'Literal' || typeof prop.value.value !== 'boolean') {
		validator.error(
			`'immutable' must be a boolean literal`,
			{ start: prop.value.start, end: prop.value.end }
		);
	}
}
