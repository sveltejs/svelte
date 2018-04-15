import oncreate from './oncreate';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function onrender(validator: Validator, prop: Node) {
	validator.warn(prop, {
		code: `deprecated-onrender`,
		message: `'onrender' has been deprecated in favour of 'oncreate', and will cause an error in Svelte 2.x`
	});

	oncreate(validator, prop);
}
