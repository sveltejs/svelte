import parse from 'css-tree/lib/parser/index.js';
import walk from 'css-tree/lib/utils/walk.js';

export default function readStyle ( parser, start: number, attributes ) {
	const contentStart = parser.index;
	const styles = parser.readUntil( /<\/style>/ );
	const contentEnd = parser.index;

	let ast;

	try {
		ast = parse( styles, {
			positions: true,
			offset: contentStart
		});
	} catch ( err ) {
		if ( err.name === 'CssSyntaxError' ) {
			parser.error( err.message, err.offset );
		} else {
			throw err;
		}
	}

	// tidy up AST
	walk.all( ast, node => {
		if ( node.loc ) {
			node.start = node.loc.start.offset;
			node.end = node.loc.end.offset;
			delete node.loc;
		}
	});

	parser.eat( '</style>', true );
	const end = parser.index;

	return {
		start,
		end,
		attributes,
		children: JSON.parse( JSON.stringify( ast.children ) ),
		content: {
			start: contentStart,
			end: contentEnd,
			styles
		}
	};
}
