import readExpression from '../read/expression.js';
import { whitespace } from '../patterns.js';
import { trimStart, trimEnd } from '../utils/trim.js';

const validIdentifier = /[a-zA-Z_$][a-zA-Z0-9_$]*/;

export default function mustache ( parser ) {
	const start = parser.index;
	parser.index += 2;

	parser.allowWhitespace();

	// {{/if}} or {{/each}}
	if ( parser.eat( '/' ) ) {
		let block = parser.current();
		let expected;

		if ( block.type === 'ElseBlock' ) {
			// TODO need to strip whitespace from else blocks
			block.end = start;
			parser.stack.pop();
			block = parser.current();
		}

		if ( block.type === 'IfBlock' ) {
			expected = 'if';
		} else if ( block.type === 'EachBlock' ) {
			expected = 'each';
		} else {
			parser.error( `Unexpected block closing tag` );
		}

		parser.eat( expected, true );
		parser.allowWhitespace();
		parser.eat( '}}', true );

		// strip leading/trailing whitespace as necessary
		if ( !block.children.length ) parser.error( `Empty block`, block.start );
		const firstChild = block.children[0];
		const lastChild = block.children[ block.children.length - 1 ];

		const charBefore = parser.template[ block.start - 1 ];
		const charAfter = parser.template[ parser.index ];

		if ( firstChild.type === 'Text' && !charBefore || whitespace.test( charBefore ) ) {
			firstChild.data = trimStart( firstChild.data );
			if ( !firstChild.data ) block.children.shift();
		}

		if ( lastChild.type === 'Text' && !charAfter || whitespace.test( charAfter ) ) {
			lastChild.data = trimEnd( lastChild.data );
			if ( !lastChild.data ) block.children.pop();
		}

		block.end = parser.index;
		parser.stack.pop();
	}

	else if ( parser.eat( 'elseif' ) ) {
		throw new Error( 'TODO elseif' );
	}

	else if ( parser.eat( 'else' ) ) {
		const block = parser.current();
		if ( block.type !== 'IfBlock' ) parser.error( 'Cannot have an {{else}} block outside an {{#if ...}} block' );

		parser.allowWhitespace();
		parser.eat( '}}', true );

		block.else = {
			start: parser.index,
			end: null,
			type: 'ElseBlock',
			children: []
		};

		parser.stack.push( block.else );
	}

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

		const block = {
			start,
			end: null,
			type,
			expression,
			children: []
		};

		parser.allowWhitespace();

		// {{#each}} blocks must declare a context – {{#each list as item}}
		if ( type === 'EachBlock' ) {
			parser.eat( 'as', true );
			parser.requireWhitespace();

			block.context = parser.read( validIdentifier ); // TODO check it's not a keyword
			if ( !block.context ) parser.error( `Expected name` );

			parser.allowWhitespace();

			if ( parser.eat( ',' ) ) {
				parser.allowWhitespace();
				block.index = parser.read( validIdentifier );
				if ( !block.index ) parser.error( `Expected name` );
				parser.allowWhitespace();
			}
		}

		parser.eat( '}}', true );

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
