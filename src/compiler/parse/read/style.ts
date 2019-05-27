import parse from 'css-tree/lib/parser/index.js';
import { walk } from 'estree-walker';
import { Parser } from '../index';
import { Node } from '../../interfaces';

export default function read_style(parser: Parser, start: number, attributes: Node[]) {
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
		enter: (node: Node) => {
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
		start,
		end,
		attributes,
		children: ast.children,
		content: {
			start: content_start,
			end: content_end,
			styles,
		},
	};
}

function is_ref_selector(a: Node, b: Node) {
	if (!b) return false;

	return (
		a.type === 'TypeSelector' &&
		a.name === 'ref' &&
		b.type === 'PseudoClassSelector'
	);
}