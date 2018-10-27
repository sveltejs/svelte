import { Node } from '../../../../interfaces';
import nodeToString from '../../../../utils/nodeToString';
import Component from '../../../Component';

export default function tag(component: Component, prop: Node) {
	const tag = nodeToString(prop.value);
	if (typeof tag !== 'string') {
		component.error(prop.value, {
			code: `invalid-tag-property`,
			message: `'tag' must be a string literal`
		});
	}

	if (!/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(tag)) {
		component.error(prop.value, {
			code: `invalid-tag-property`,
			message: `tag name must be two or more words joined by the '-' character`
		});
	}
}
