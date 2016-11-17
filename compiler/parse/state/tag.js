import readExpression from '../read/expression.js';

const validTagName = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

export default function tag ( parser ) {
	const start = parser.index++;

	const isClosingTag = parser.eat( '/' );

	// TODO handle cases like <li>one<li>two

	const name = readTagName( parser );

	if ( isClosingTag ) {
		if ( !parser.eat( '>' ) ) parser.error( `Expected '>'` );

		parser.current().end = parser.index;
		parser.stack.pop();

		return null;
	}

	const attributes = [];

	let attribute;
	while ( attribute = readAttribute( parser ) ) {
		attributes.push( attribute );
	}

	parser.allowWhitespace();

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

	if ( !parser.eat( '>' ) ) {
		parser.error( `Expected >` );
	}

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

	const value = parser.eat( '=' ) ? readAttributeValue( parser ) : true;

	return { name, value };
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
