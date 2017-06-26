import { Node } from '../interfaces';

export default function clone(node: Node) {
	const cloned = {};

	for (const key in node) {
		const value = node[key];
		if (Array.isArray(value)) {
			cloned[key] = value.map(clone);
		} else if (value && typeof value === 'object') {
			cloned[key] = clone(value);
		} else {
			cloned[key] = value;
		}
	}

	return cloned;
}
