import { parseExpressionAt } from 'acorn';
import { locate } from 'locate-character';

const validTagName = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const whitespace = /\s/;

export default function parse ( template ) {
	const parser = {
		index: 0,
		template,
		stack: [],

		current () {
			return this.stack[ this.stack.length - 1 ];
		},

		error ( message ) {
			const { line, column } = locate( this.template, this.index );
			throw new Error( `${message} (${line}:${column})` );
		},

		eat ( str ) {
			if ( this.match( str ) ) {
				this.index += str.length;
				return true;
			}
		},

		match ( str ) {
			return this.template.slice( this.index, this.index + str.length ) === str;
		},

		allowWhitespace () {
			while ( this.index < this.template.length && whitespace.test( this.template[ this.index ] ) ) {
				this.index++;
			}
		},

		readUntil ( pattern ) {
			const match = pattern.exec( this.template.slice( this.index ) );
			return this.template.slice( this.index, match ? ( this.index += match.index ) : this.template.length );
		},

		remaining () {
			return this.template.slice( this.index );
		}
	};

	const html = {
		start: 0,
		end: template.length,
		type: 'Fragment',
		children: []
	};

	let css = null;
	let js = null;

	parser.stack.push( html );

	function fragment () {
		parser.allowWhitespace();

		if ( parser.match( '<' ) ) {
			return tag;
		}

		if ( parser.match( '{{' ) ) {
			return mustache;
		}

		return text;
	}

	function tag () {
		const start = parser.index++;

		const isClosingTag = parser.eat( '/' );

		// TODO handle cases like <li>one<li>two

		const name = readTagName();

		if ( isClosingTag ) {
			if ( !parser.eat( '>' ) ) parser.error( `Expected '>'` );

			parser.current().end = parser.index;
			parser.stack.pop();

			return fragment;
		}

		const attributes = [];

		let attribute;
		while ( attribute = readAttribute() ) {
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

		return fragment;
	}

	function readTagName () {
		const start = parser.index;

		const name = parser.readUntil( /(\s|\/|>)/ );
		if ( !validTagName.test( name ) ) {
			parser.error( `Expected valid tag name`, start );
		}

		return name;
	}

	function readAttribute () {
		const name = parser.readUntil( /(\s|=|\/|>)/ );
		if ( !name ) return null;

		parser.allowWhitespace();

		const value = parser.eat( '=' ) ? readAttributeValue() : true;

		return { name, value };
	}

	function readAttributeValue () {
		if ( parser.eat( `'` ) ) return readQuotedAttributeValue( `'` );
		if ( parser.eat( `"` ) ) return readQuotedAttributeValue( `"` );

		parser.error( `TODO unquoted attribute values` );
	}

	function readQuotedAttributeValue ( quoteMark ) {
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

	function mustache () {
		const start = parser.index;
		parser.index += 2;

		parser.allowWhitespace();

		if ( parser.match( '#if' ) ) {
			return ifBlock;
		}

		if ( parser.match( '#each' ) ) {
			return eachBlock;
		}

		const expression = readExpression( template, parser.index );

		parser.allowWhitespace();
		if ( !parser.eat( '}}' ) ) parser.error( `Expected }}` );

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'MustacheTag',
			expression
		});

		return fragment;
	}

	function ifBlock () {
		throw new Error( 'TODO' );
	}

	function eachBlock () {
		throw new Error( 'TODO' );
	}

	function readExpression () {
		const node = parseExpressionAt( parser.template, parser.index );
		parser.index = node.end;

		// TODO check it's a valid expression. probably shouldn't have
		// [arrow] function expressions, etc

		return node;
	}

	function text () {
		const start = parser.index;

		let data = '';

		while ( !parser.match( '<' ) && !parser.match( '{{' ) ) {
			data += template[ parser.index++ ];
		}

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'Text',
			data
		});

		return fragment;
	}

	let state = fragment;

	while ( parser.index < parser.template.length ) {
		state = state();
	}

	return { html, css, js };
}
