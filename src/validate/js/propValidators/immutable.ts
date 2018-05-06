import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function immutable(validator: Validator, prop: Node) {
	if (prop.value.type !== 'Literal' || typeof prop.value.value !== 'boolean') {
		validator.error(prop.value, {
			code: `invalid-immutable-property`,
			message: `'immutable' must be a boolean literal`
		});
	}
}
