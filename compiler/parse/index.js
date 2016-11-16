import { locate } from 'locate-character';

const validNameChar = /[a-zA-Z0-9_$]/;

export default function parse ( template ) {
	let i = 0;

	const root = {
		start: 0,
		end: template.length,
		type: 'Fragment',
		children: []
	};

	const stack = [ root ];
	let current = root;

	function error ( message ) {
		const { line, column } = locate( template, i );
		throw new Error( `${message} (${line}:${column})` );
	}

	function match ( str ) {
		return template.slice( i, i + str.length ) === str;
	}

	function fragment () {
		const char = template[i];

		while ( char === ' ' ) {
			i += 1;
		}

		if ( char === '<' ) {
			return tag;
		}

		if ( match( '{{' ) ) {
			return mustache;
		}

		return text;
	}

	function tag () {
		const start = i++;
		let char = template[ i ];

		const isClosingTag = char === '/';

		if ( isClosingTag ) {
			// this is a closing tag
			i += 1;
			char = template[ i ];
		}

		// TODO handle cases like <li>one<li>two

		let name = '';

		while ( validNameChar.test( char ) ) {
			name += char;
			i += 1;
			char = template[i];
		}

		if ( isClosingTag ) {
			if ( char !== '>' ) error( `Expected '>'` );

			i += 1;
			current.end = i;
			stack.pop();
			current = stack[ stack.length - 1 ];

			return fragment;
		}

		const element = {
			start,
			end: null, // filled in later
			type: 'Element',
			name,
			attributes: {},
			children: []
		};

		current.children.push( element );
		stack.push( element );

		current = element;

		if ( char === '>' ) {
			i += 1;
			return fragment;
		}

		return attributes;
	}

	function text () {
		const start = i;

		let data = '';

		while ( i < template.length && template[i] !== '<' && !match( '{{' ) ) {
			data += template[ i++ ];
		}

		current.children.push({
			start,
			end: i,
			type: 'Text',
			data
		});

		return fragment;
	}

	function attributes () {
		const char = template[i];
		if ( char === '>' ) {
			i += 1;
			return fragment;
		}
	}

	let state = fragment;

	while ( i < template.length ) {
		state = state();
	}

	return root;
}
