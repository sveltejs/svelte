import parse from 'css-tree/lib/parser/index.js';
import { walk } from 'estree-walker';
import { Parser } from '../index';
import { Node } from 'estree';
import { Style } from '../../interfaces';

export default function read_style(parser: Parser, start: number, attributes: Node[]): Style {
	const content_start = parser.index;
	const styles = parser.read_until(/<\/style>/);
	const content_end = parser.index;

	let ast;

	try {
		ast = parse(styles, {
			positions: true,
			offset: content_start,
		});
	} catch (err) {
		if (err.name === 'CssSyntaxError') {
			parser.error({
				code: `css-syntax-error`,
				message: err.message
			}, err.offset);
		} else {
			throw err;
		}
	}

	ast = JSON.parse(JSON.stringify(ast));

	// tidy up AST
	walk(ast, {
		enter: (node: any) => { // `any` because this isn't an ESTree node
			// replace `ref:a` nodes
			if (node.type === 'Selector') {
				for (let i = 0; i < node.children.length; i += 1) {
					const a = node.children[i];
					const b = node.children[i + 1];

					if (is_ref_selector(a, b)) {
						parser.error({
							code: `invalid-ref-selector`,
							message: 'ref selectors are no longer supported'
						}, a.loc.start.offset);
					}
				}
			}

			if (node.type === 'Declaration' && node.value.type === 'Value' && node.value.children.length === 0) {
				parser.error({
					code: `invalid-declaration`,
					message: `Declaration cannot be empty`
				}, node.start);
			}

			if (node.loc) {
				node.start = node.loc.start.offset;
				node.end = node.loc.end.offset;
				delete node.loc;
			}
		}
	});

	parser.eat('</style>', true);
	const end = parser.index;

	return {
		type: 'Style',
		start,
		end,
		attributes,
		children: ast.children,
		content: {
			start: content_start,
			end: content_end,
			styles
		}
	};
}

function is_ref_selector(a: any, b: any) { // TODO add CSS node types
	if (!b) return false;

	return (
		a.type === 'TypeSelector' &&
		a.name === 'ref' &&
		b.type === 'PseudoClassSelector'
	);
}