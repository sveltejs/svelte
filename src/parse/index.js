import { locate } from 'locate-character';
import fragment from './state/fragment.js';
import { whitespace } from './patterns.js';
import { trimStart, trimEnd } from './utils/trim.js';
import getCodeFrame from '../utils/getCodeFrame.js';
import hash from './utils/hash.js';

function ParseError ( message, template, index, filename ) {
	const { line, column } = locate( template, index );

	this.name = 'ParseError';
	this.message = message;
	this.frame = getCodeFrame( template, line, column );

	this.loc = { line: line + 1, column };
	this.pos = index;
	this.filename = filename;
}

ParseError.prototype.toString = function () {
	return `${this.message} (${this.loc.line}:${this.loc.column})\n${this.frame}`;
};

export default function parse ( template, options = {} ) {
	if ( typeof template !== 'string' ) {
		throw new TypeError( 'Template must be a string' );
	}

	template = template.replace( /\s+$/, '' );

	const parser = {
		index: 0,
		template,
		stack: [],
		metaTags: {},

		current () {
			return this.stack[ this.stack.length - 1 ];
		},

		acornError ( err ) {
			parser.error( err.message.replace( / \(\d+:\d+\)$/, '' ), err.pos );
		},

		error ( message, index = this.index ) {
			throw new ParseError( message, this.template, index, options.filename );
		},

		eat ( str, required ) {
			if ( this.match( str ) ) {
				this.index += str.length;
				return true;
			}

			if ( required ) {
				this.error( `Expected ${str}` );
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

		read ( pattern ) {
			const match = pattern.exec( this.template.slice( this.index ) );
			if ( !match || match.index !== 0 ) return null;

			parser.index += match[0].length;

			return match[0];
		},

		readUntil ( pattern ) {
			if ( this.index >= this.template.length ) parser.error( 'Unexpected end of input' );

			const start = this.index;
			const match = pattern.exec( this.template.slice( start ) );

			if ( match ) {
				const start = this.index;
				this.index = start + match.index;
				return this.template.slice( start, this.index );
			}

			this.index = this.template.length;
			return this.template.slice( start );
		},

		remaining () {
			return this.template.slice( this.index );
		},

		requireWhitespace () {
			if ( !whitespace.test( this.template[ this.index ] ) ) {
				this.error( `Expected whitespace` );
			}

			this.allowWhitespace();
		},

		html: {
			start: null,
			end: null,
			type: 'Fragment',
			children: []
		},

		css: null,

		js: null
	};

	parser.stack.push( parser.html );

	let state = fragment;

	while ( parser.index < parser.template.length ) {
		state = state( parser ) || fragment;
	}

	if ( parser.stack.length > 1 ) {
		const current = parser.current();

		const type = current.type === 'Element' ? `<${current.name}>` : 'Block';
		parser.error( `${type} was left open`, current.start );
	}

	if ( state !== fragment ) {
		parser.error( 'Unexpected end of input' );
	}

	// trim unnecessary whitespace
	while ( parser.html.children.length ) {
		const firstChild = parser.html.children[0];
		parser.html.start = firstChild.start;

		if ( firstChild.type !== 'Text' ) break;

		const length = firstChild.data.length;
		firstChild.data = trimStart( firstChild.data );

		if ( firstChild.data === '' ) {
			parser.html.children.shift();
		} else {
			parser.html.start += length - firstChild.data.length;
			break;
		}
	}

	while ( parser.html.children.length ) {
		const lastChild = parser.html.children[ parser.html.children.length - 1 ];
		parser.html.end = lastChild.end;

		if ( lastChild.type !== 'Text' ) break;

		const length = lastChild.data.length;
		lastChild.data = trimEnd( lastChild.data );

		if ( lastChild.data === '' ) {
			parser.html.children.pop();
		} else {
			parser.html.end -= length - lastChild.data.length;
			break;
		}
	}

	return {
		hash: hash( template ),
		html: parser.html,
		css: parser.css,
		js: parser.js
	};
}
