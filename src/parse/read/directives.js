import { parse } from 'acorn';
import spaces from '../../utils/spaces.js';

export function readEventHandlerDirective ( parser, start, name ) {
	const quoteMark = (
		parser.eat( `'` ) ? `'` :
		parser.eat( `"` ) ? `"` :
		null
	);

	const expressionStart = parser.index;

	let str = '';
	let escaped = false;

	for ( let i = expressionStart; i < parser.template.length; i += 1 ) {
		const char = parser.template[i];

		if ( quoteMark ) {
			if ( char === quoteMark ) {
				if ( escaped ) {
					str += quoteMark;
				} else {
					parser.index = i + 1;
					break;
				}
			} else if ( escaped ) {
				str += '\\' + char;
				escaped = false;
			} else if ( char === '\\' ) {
				escaped = true;
			} else {
				str += char;
			}
		}

		else if ( /\s/.test( char ) ) {
			parser.index = i;
			break;
		}

		else {
			str += char;
		}
	}

	const ast = parse( spaces( expressionStart ) + str );

	if ( ast.body.length > 1 ) {
		parser.error( `Event handler should be a single call expression`, ast.body[1].start );
	}

	const expression = ast.body[0].expression;

	if ( expression.type !== 'CallExpression' ) {
		parser.error( `Expected call expression`, expressionStart );
	}

	return {
		start,
		end: parser.index,
		type: 'EventHandler',
		name,
		expression
	};
}

export function readBindingDirective ( parser, start, name ) {
	let value = name; // shorthand – bind:foo equivalent to bind:foo='foo'

	if ( parser.eat( '=' ) ) {
		const quoteMark = (
			parser.eat( `'` ) ? `'` :
			parser.eat( `"` ) ? `"` :
			null
		);

		value = parser.read( /([a-zA-Z_$][a-zA-Z0-9_$]*)(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*/ );
		if ( !value ) parser.error( `Expected valid property name` );

		if ( quoteMark ) {
			parser.eat( quoteMark, true );
		}
	}

	return {
		start,
		end: parser.index,
		type: 'Binding',
		name,
		value
	};
}
