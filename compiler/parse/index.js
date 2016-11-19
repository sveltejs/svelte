import { locate } from 'locate-character';
import fragment from './state/fragment.js';
import { whitespace } from './patterns.js';
import { trimStart, trimEnd } from './utils/trim.js';

export default function parse ( template ) {
	const parser = {
		index: 0,
		template,
		stack: [],

		current () {
			return this.stack[ this.stack.length - 1 ];
		},

		error ( message, index = this.index ) {
			const { line, column } = locate( this.template, index );
			throw new Error( `${message} (${line}:${column})` );
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
			const match = pattern.exec( this.template.slice( this.index ) );
			return this.template.slice( this.index, match ? ( this.index += match.index ) : this.template.length );
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
		html: parser.html,
		css: parser.css,
		js: parser.js
	};
}
