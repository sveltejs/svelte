import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function tag(validator: Validator, prop: Node) {
	if (prop.value.type !== 'Literal' || typeof prop.value.value !== 'string') {
		validator.error(
			`'tag' must be a string literal`,
			{ start: prop.value.start, end: prop.value.end }
		);
	}

	const tag = prop.value.value;
	if (!/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(tag)) {
		validator.error(
			`tag name must be two or more words joined by the '-' character`,
			{ start: prop.value.start, end: prop.value.end }
		);
	}
}
