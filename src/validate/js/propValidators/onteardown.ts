import ondestroy from './ondestroy';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function onteardown(validator: Validator, prop: Node) {
	validator.warn(prop, {
		code: `deprecated-onteardown`,
		message: `'onteardown' has been deprecated in favour of 'ondestroy', and will cause an error in Svelte 2.x`
	});

	ondestroy(validator, prop);
}
