import { Validator } from '../index';
import { Node } from '../../interfaces';
import unpackDestructuring from '../../utils/unpackDestructuring';

function isEmptyBlock(node: Node) {
	if (!/Block$/.test(node.type) || !node.children) return false;
	if (node.children.length > 1) return false;
	const child = node.children[0];
	return !child || (child.type === 'Text' && !/[^ \r\n\f\v\t]/.test(child.data));
}

export default function validateHtml(validator: Validator, html: Node) {
	function visit(node: Node) {
		if (node.type === 'EachBlock') {
			const contexts = [];
			unpackDestructuring(contexts, node.context, '');

			contexts.forEach(prop => {
				if (validator.helpers.has(prop.key.name)) {
					validator.warn(prop.key, {
						code: `each-context-clash`,
						message: `Context clashes with a helper. Rename one or the other to eliminate any ambiguity`
					});
				}
			});
		}
	}

	html.children.forEach(visit);
}
