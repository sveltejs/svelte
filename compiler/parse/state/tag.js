import readExpression from '../read/expression.js';
import readScript from '../read/script.js';
import readStyle from '../read/style.js';
import { readEventHandlerDirective } from '../read/directives.js';
import { trimStart, trimEnd } from '../utils/trim.js';

const validTagName = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

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

	let attribute;
	while ( attribute = readAttribute( parser ) ) {
		attributes.push( attribute );
	}

	parser.allowWhitespace();

	// special cases – <script> and <style>
	if ( name in specials ) {
		const special = specials[ name ];

		if ( parser[ special.id ] ) {
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

function readAttribute ( parser ) {
	const name = parser.readUntil( /(\s|=|\/|>)/ );
	if ( !name ) return null;

	parser.allowWhitespace();

	if ( /^on:/.test( name ) ) {
		parser.eat( '=', true );
		return readEventHandlerDirective( parser, name.slice( 3 ) );
	}

	const value = parser.eat( '=' ) ? readAttributeValue( parser ) : true;

	return {
		type: 'Attribute',
		name,
		value
	};
}

function readAttributeValue ( parser ) {
	if ( parser.eat( `'` ) ) return readQuotedAttributeValue( parser, `'` );
	if ( parser.eat( `"` ) ) return readQuotedAttributeValue( parser, `"` );

	parser.error( `TODO unquoted attribute values` );
}

function readQuotedAttributeValue ( parser, quoteMark ) {
	let currentChunk = {
		start: parser.index,
		end: null,
		type: 'AttributeText',
		data: ''
	};

	let escaped = false;

	const chunks = [];

	while ( parser.index < parser.template.length ) {
		if ( escaped ) {
			currentChunk.data += parser.template[ parser.index++ ];
		}

		else {
			if ( parser.match( '{{' ) ) {
				const index = parser.index;
				currentChunk.end = index;

				if ( currentChunk.data ) {
					chunks.push( currentChunk );
				}

				const expression = readExpression();
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
					type: 'AttributeText',
					data: ''
				};
			}

			else if ( parser.match( '\\' ) ) {
				escaped = true;
			}

			else if ( parser.match( quoteMark ) ) {
				if ( currentChunk.data ) {
					chunks.push( currentChunk );
					return chunks;
				}
			}
		}
	}

	parser.error( `Unexpected end of input` );
}
