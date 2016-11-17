import { locate } from 'locate-character';
import fragment from './state/fragment.js';

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

	let state = fragment;

	while ( parser.index < parser.template.length ) {
		state = state( parser ) || fragment;
	}

	return { html, css, js };
}
