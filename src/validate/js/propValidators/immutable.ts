import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function tag(validator: Validator, prop: Node) {
	if (prop.value.type !== 'Literal' || typeof prop.value.value !== 'boolean') {
		validator.error(
			`'immutable' must be a boolean literal`,
			prop.value.start
		);
	}
}
