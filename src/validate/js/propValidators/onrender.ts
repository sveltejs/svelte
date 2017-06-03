import oncreate from './oncreate';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function onrender(validator: Validator, prop: Node) {
	validator.warn(
		`'onrender' has been deprecated in favour of 'oncreate', and will cause an error in Svelte 2.x`,
		prop.start
	);
	oncreate(validator, prop);
}
