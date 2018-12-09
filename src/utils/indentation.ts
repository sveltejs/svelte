import MagicString from 'magic-string';
import { Node } from '../interfaces';
import { walk } from 'estree-walker';
import repeat from './repeat';

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

	const str = code.original.slice(node.start, node.end);

	let match;
	while (match = pattern.exec(str)) {
		const index = node.start + match.index;
		while (excluded[0] && excluded[0].end < index) excluded.shift();
		if (excluded[0] && excluded[0].start < index) continue;

		code.remove(index, index + indent.length);
	}
}

export function add_indentation(code: MagicString, node: Node, levels = 1) {
	const base_indent = code.getIndentString();
	const indent = repeat(base_indent, levels);
	const pattern = /\n/gm;

	const excluded = [];

	walk(node, {
		enter(node) {
			if (node.type === 'TemplateElement') {
				excluded.push(node);
			}
		}
	});

	const str = code.original.slice(node.start, node.end);

	let match;
	while (match = pattern.exec(str)) {
		const index = node.start + match.index;
		while (excluded[0] && excluded[0].end < index) excluded.shift();
		if (excluded[0] && excluded[0].start < index) continue;

		code.appendLeft(index + 1, indent);
	}
}