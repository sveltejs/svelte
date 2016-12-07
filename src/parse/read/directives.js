import { tokenizer, tokTypes, parseExpressionAt } from 'acorn';

export function readEventHandlerDirective ( parser, start, name ) {
	const quoteMark = (
		parser.eat( `'` ) ? `'` :
		parser.eat( `"` ) ? `"` :
		null
	);

	const expressionStart = parser.index;
	let end = null;

	let depth = 0;
	for ( const token of tokenizer( parser.remaining() ) ) {
		if ( token.type === tokTypes.parenL ) depth += 1;
		if ( token.type === tokTypes.parenR ) {
			depth -= 1;
			if ( depth === 0 ) {
				end = expressionStart + token.end;
				break;
			}
		}
	}

	const expression = parseExpressionAt( parser.template.slice( 0, end ), expressionStart );
	parser.index = expression.end;

	if ( expression.type !== 'CallExpression' ) {
		parser.error( `Expected call expression`, expressionStart );
	}

	if ( quoteMark ) {
		parser.eat( quoteMark, true );
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
