import MagicString from 'magic-string';
import { Node } from '../interfaces';
import { walk } from 'estree-walker';

export function remove_indentation(code: MagicString, node: Node) {
	const indent = code.getIndentString();
	const pattern = new RegExp(`^${indent}`, 'gm');

	const excluded = [];

	walk(node, {
		enter(node) {
			if (node.type === 'TemplateElement') {
				excluded.push(node);
			}
		}
	});

	let dirty = false;

	const str = code.original
		.slice(node.start, node.end)
		.replace(pattern, (match, i) => {
			const index = node.start + i;
			while (excluded[0] && excluded[0].end < index) excluded.shift();
			if (excluded[0] && excluded[0].start < index) return match;

			dirty = true;
			return '';
		});

	if (dirty) code.overwrite(node.start, node.end, str);
}