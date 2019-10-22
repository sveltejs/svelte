import { walk } from 'estree-walker';
import { Text, MustacheTag } from '../../interfaces';

export default function optimise(ast) {
	walk(ast, {
		enter(node: any) {
			if (node.type === 'Element') {
				optimise_text_content(node.children);
			}
		},
	});
}

const text_like_node_type = new Set(['MustacheTag', 'Text']);

function optimise_text_content(children) {
	let start = 0;
	let end = 0;

	do {
		while (
			start < children.length &&
			!text_like_node_type.has(children[start].type)
		)
			start++;

		end = start;

		while (end < children.length && text_like_node_type.has(children[end].type))
			end++;

		if (end > start) {
			const merged = merge_text_siblings(children.slice(start, end));
			children.splice(start, end - start, ...merged);
			start = end;
		}
	} while (start < children.length);
}

function merge_text_siblings(children: Array<Text | MustacheTag>) {
	if (children.length < 3) {
		return children;
	}

	const literal = {
		type: 'TemplateLiteral',
		expressions: [],
		quasis: [],
	};
	const state = {
		quasi: {
			type: 'TemplateElement',
			value: { raw: '' },
			start: children[0].start,
			end: children[0].start
		},
	};

	for (const child of children) {
		if (child.type === 'MustacheTag') {
			literal.quasis.push(state.quasi);
			literal.expressions.push(child.expression);
			state.quasi = {
				type: 'TemplateElement',
				value: { raw: '' },
				// @ts-ignore
				start: child.expression.end + 1,
				// @ts-ignore
				end: child.expression.end + 1
			};
		} else if (child.type === 'Text') {
			state.quasi.value.raw += child.data;
			state.quasi.end = child.end;
		}
	}

	literal.quasis.push(state.quasi);

	return [{
		type: 'MustacheTag',
		expression: literal,
		start: children[0].start,
		end: children[children.length - 1].end,
	}];
}
