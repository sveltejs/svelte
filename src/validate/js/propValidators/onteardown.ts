import ondestroy from './ondestroy';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function onteardown(validator: Validator, prop: Node) {
	validator.warn(
		`'onteardown' has been deprecated in favour of 'ondestroy', and will cause an error in Svelte 2.x`,
		{ start: prop.start, end: prop.end }
	);
	ondestroy(validator, prop);
}
