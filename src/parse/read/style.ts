import parse from 'css-tree/lib/parser/index.js';
import { walk } from 'estree-walker';
import { Parser } from '../index';
import { Node } from '../../interfaces';

export default function readStyle(parser: Parser, start: number, attributes: Node[]) {
	const contentStart = parser.index;
	const styles = parser.readUntil(/<\/style>/);
	const contentEnd = parser.index;

	let ast;

	try {
		ast = parse(styles, {
			positions: true,
			offset: contentStart,
		});
	} catch (err) {
		if (err.name === 'CssSyntaxError') {
			parser.error(err.message, err.offset);
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

					if (isRefSelector(a, b)) {
						node.children.splice(i, 2, {
							type: 'RefSelector',
							start: a.loc.start.offset,
							end: b.loc.end.offset,
							name: b.name
						});
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
			start: contentStart,
			end: contentEnd,
			styles,
		},
	};
}

function isRefSelector(a: Node, b: Node) {
	if (!b) return false;

	return (
		a.type === 'TypeSelector' &&
		a.name === 'ref' &&
		b.type === 'PseudoClassSelector'
	);
}