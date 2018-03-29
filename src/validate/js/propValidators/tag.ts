import { Validator } from '../../';
import { Node } from '../../../interfaces';
import nodeToString from '../../../utils/nodeToString';

export default function tag(validator: Validator, prop: Node) {
	const tag = nodeToString(prop.value);
	if (typeof tag !== 'string') {
		validator.error(
			`'tag' must be a string literal`,
			prop.value
		);
	}

	if (!/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(tag)) {
		validator.error(
			`tag name must be two or more words joined by the '-' character`,
			prop.value
		);
	}
}
