import readExpression from '../read/expression.js';
import readScript from '../read/script.js';
import readStyle from '../read/style.js';
import { readEventHandlerDirective, readBindingDirective } from '../read/directives.js';
import { trimStart, trimEnd } from '../utils/trim.js';
import { decodeCharacterReferences } from '../utils/html.js';
import voidElementNames from '../../utils/voidElementNames.js';

const validTagName = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const invalidUnquotedAttributeCharacters = /[\s"'=<>\/`]/;

const specials = {
	script: {
		read: readScript,
		property: 'js'
	},

	style: {
		read: readStyle,
		property: 'css'
	}
};

export default function tag ( parser ) {
	const start = parser.index++;

	if ( parser.eat( '!--' ) ) {
		const data = parser.readUntil( /-->/ );
		parser.eat( '-->' );

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'Comment',
			data
		});

		return null;
	}

	const isClosingTag = parser.eat( '/' );

	// TODO handle cases like <li>one<li>two

	const name = readTagName( parser );

	parser.allowWhitespace();

	if ( isClosingTag ) {
		if ( !parser.eat( '>' ) ) parser.error( `Expected '>'` );

		const element = parser.current();

		// strip leading/trailing whitespace as necessary
		if ( element.children.length ) {
			const firstChild = element.children[0];
			const lastChild = element.children[ element.children.length - 1 ];

			if ( firstChild.type === 'Text' ) {
				firstChild.data = trimStart( firstChild.data );
				if ( !firstChild.data ) element.children.shift();
			}

			if ( lastChild.type === 'Text' ) {
				lastChild.data = trimEnd( lastChild.data );
				if ( !lastChild.data ) element.children.pop();
			}
		}

		element.end = parser.index;
		parser.stack.pop();

		return null;
	}

	const attributes = [];
	const uniqueNames = new Set();

	let attribute;
	while ( attribute = readAttribute( parser, uniqueNames ) ) {
		attributes.push( attribute );
		parser.allowWhitespace();
	}

	parser.allowWhitespace();

	// special cases – <script> and <style>
	if ( name in specials ) {
		const special = specials[ name ];

		if ( parser[ special.property ] ) {
			parser.index = start;
			parser.error( `You can only have one <${name}> tag per component` );
		}

		parser.eat( '>', true );
		parser[ special.property ] = special.read( parser, start, attributes );
		return;
	}

	const element = {
		start,
		end: null, // filled in later
		type: 'Element',
		name,
		attributes,
		children: []
	};

	parser.current().children.push( element );

	const selfClosing = parser.eat( '/' ) || voidElementNames.test( name );

	parser.eat( '>', true );

	if ( selfClosing ) {
		element.end = parser.index;
	} else {
		// don't push self-closing elements onto the stack
		parser.stack.push( element );
	}

	return null;
}

function readTagName ( parser ) {
	const start = parser.index;

	const name = parser.readUntil( /(\s|\/|>)/ );
	if ( !validTagName.test( name ) ) {
		parser.error( `Expected valid tag name`, start );
	}

	return name;
}

function readAttribute ( parser, uniqueNames ) {
	const start = parser.index;

	const name = parser.readUntil( /(\s|=|\/|>)/ );
	if ( !name ) return null;
	if ( uniqueNames.has( name ) ) {
		parser.error( 'Attributes need to be unique', start );
	}

	uniqueNames.add( name );

	parser.allowWhitespace();

	if ( /^on:/.test( name ) ) {
		parser.eat( '=', true );
		return readEventHandlerDirective( parser, start, name.slice( 3 ) );
	}

	if ( /^bind:/.test( name ) ) {
		return readBindingDirective( parser, start, name.slice( 5 ) );
	}

	if ( /^ref:/.test( name ) ) {
		return {
			start,
			end: parser.index,
			type: 'Ref',
			name: name.slice( 4 )
		};
	}

	const value = parser.eat( '=' ) ? readAttributeValue( parser ) : true;

	return {
		start,
		end: parser.index,
		type: 'Attribute',
		name,
		value
	};
}

function readAttributeValue ( parser ) {
	let quoteMark;

	if ( parser.eat( `'` ) ) quoteMark = `'`;
	if ( parser.eat( `"` ) ) quoteMark = `"`;

	let currentChunk = {
		start: parser.index,
		end: null,
		type: 'Text',
		data: ''
	};

	const done = quoteMark ?
		char => char === quoteMark :
		char => invalidUnquotedAttributeCharacters.test( char );

	const chunks = [];

	while ( parser.index < parser.template.length ) {
		const index = parser.index;

		if ( parser.eat( '{{' ) ) {
			if ( currentChunk.data ) {
				currentChunk.end = index;
				chunks.push( currentChunk );
			}

			const expression = readExpression( parser );
			parser.allowWhitespace();
			if ( !parser.eat( '}}' ) ) {
				parser.error( `Expected }}` );
			}

			chunks.push({
				start: index,
				end: parser.index,
				type: 'MustacheTag',
				expression
			});

			currentChunk = {
				start: parser.index,
				end: null,
				type: 'Text',
				data: ''
			};
		}

		else if ( done( parser.template[ parser.index ] ) ) {
			currentChunk.end = parser.index;
			if ( quoteMark ) parser.index += 1;

			if ( currentChunk.data ) chunks.push( currentChunk );

			chunks.forEach( chunk => {
				if ( chunk.type === 'Text' ) chunk.data = decodeCharacterReferences( chunk.data );
			});

			return chunks;
		}

		else {
			currentChunk.data += parser.template[ parser.index++ ];
		}
	}

	parser.error( `Unexpected end of input` );
}
