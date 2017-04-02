import { parse, parseExpressionAt } from 'acorn';
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
	let value;

	if ( parser.eat( '=' ) ) {
		const quoteMark = (
			parser.eat( `'` ) ? `'` :
			parser.eat( `"` ) ? `"` :
			null
		);

		const a = parser.index;

		if ( parser.eat( '{{' ) ) {
			let message = 'bound values should not be wrapped';
			const b = parser.template.indexOf( '}}', a );
			if ( b !== -1 ) {
				const value = parser.template.slice( parser.index, b );
				message += ` — use '${value}', not '{{${value}}}'`;
			}

			parser.error( message, a );
		}

		// this is a bit of a hack so that we can give Acorn something parseable
		let b;
		if ( quoteMark ) {
			b = parser.index = parser.template.indexOf( quoteMark, parser.index );
		} else {
			parser.readUntil( /[\s\r\n\/>]/ );
			b = parser.index;
		}

		const source = spaces( a ) + parser.template.slice( a, b );
		value = parseExpressionAt( source, a );

		if ( value.type !== 'Identifier' && value.type !== 'MemberExpression' ) {
			parser.error( `Expected valid property name` );
		}

		parser.allowWhitespace();

		if ( quoteMark ) {
			parser.eat( quoteMark, true );
		}
	} else {
		// shorthand – bind:foo equivalent to bind:foo='foo'
		value = {
			type: 'Identifier',
			start: start + 5,
			end: parser.index,
			name
		};
	}

	return {
		start,
		end: parser.index,
		type: 'Binding',
		name,
		value
	};
}
