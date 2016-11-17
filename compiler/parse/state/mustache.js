import readExpression from '../read/expression.js';

export default function mustache ( parser ) {
	const start = parser.index;
	parser.index += 2;

	parser.allowWhitespace();

	// {{/if}} or {{/each}}
	if ( parser.eat( '/' ) ) {
		const current = parser.current();
		let expected;

		if ( current.type === 'IfBlock' ) {
			expected = 'if';
		} else if ( current.type === 'EachBlock' ) {
			expected = 'each';
		} else {
			parser.error( `Unexpected block closing tag` );
		}

		parser.eat( expected, true );
		parser.allowWhitespace();
		parser.eat( '}}', true );

		current.end = parser.index;
		parser.stack.pop();
	}

	// TODO {{else}} and {{elseif expression}}

	// {{#if foo}} or {{#each foo}}
	else if ( parser.eat( '#' ) ) {
		let type;

		if ( parser.eat( 'if' ) ) {
			type = 'IfBlock';
		} else if ( parser.eat( 'each' ) ) {
			type = 'EachBlock';
		} else {
			parser.error( `Expected if or each` );
		}

		parser.requireWhitespace();

		const expression = readExpression( parser );

		parser.allowWhitespace();
		parser.eat( '}}', true );

		const block = {
			start,
			end: null,
			type,
			expression,
			children: []
		};

		parser.current().children.push( block );
		parser.stack.push( block );
	}

	else {
		const expression = readExpression( parser );

		parser.allowWhitespace();
		parser.eat( '}}', true );

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'MustacheTag',
			expression
		});
	}

	return null;
}
