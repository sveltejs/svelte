import { parseExpressionAt } from 'acorn';
import spaces from '../../utils/spaces';
import { Parser } from '../index';

function readExpression(parser: Parser, start: number, quoteMark: string|null) {
	let str = '';
	let escaped = false;

	for (let i = start; i < parser.template.length; i += 1) {
		const char = parser.template[i];

		if (quoteMark) {
			if (char === quoteMark) {
				if (escaped) {
					str += quoteMark;
				} else {
					break;
				}
			} else if (escaped) {
				str += '\\' + char;
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else {
				str += char;
			}
		} else if (/\s/.test(char)) {
			break;
		} else {
			str += char;
		}
	}

	const expression = parseExpressionAt(spaces(start) + str, start);
	parser.index = expression.end;

	parser.allowWhitespace();
	if (quoteMark) parser.eat(quoteMark, true);

	return expression;
}

export function readEventHandlerDirective(
	parser: Parser,
	start: number,
	name: string,
	hasValue: boolean
) {
	let expression;

	if (hasValue) {
		const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

		const expressionStart = parser.index;

		expression = readExpression(parser, expressionStart, quoteMark);

		if (expression.type !== 'CallExpression') {
			parser.error(`Expected call expression`, expressionStart);
		}
	}

	return {
		start,
		end: parser.index,
		type: 'EventHandler',
		name,
		expression,
	};
}

export function readBindingDirective(
	parser: Parser,
	start: number,
	name: string
) {
	let value;

	if (parser.eat('=')) {
		const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

		const a = parser.index;

		if (parser.eat('{{')) {
			let message = 'bound values should not be wrapped';
			const b = parser.template.indexOf('}}', a);
			if (b !== -1) {
				const value = parser.template.slice(parser.index, b);
				message += ` — use '${value}', not '{{${value}}}'`;
			}

			parser.error(message, a);
		}

		// this is a bit of a hack so that we can give Acorn something parseable
		let b;
		if (quoteMark) {
			b = parser.index = parser.template.indexOf(quoteMark, parser.index);
		} else {
			parser.readUntil(/[\s\r\n\/>]/);
			b = parser.index;
		}

		const source = spaces(a) + parser.template.slice(a, b);
		value = parseExpressionAt(source, a);

		if (value.type !== 'Identifier' && value.type !== 'MemberExpression') {
			parser.error(`Cannot bind to rvalue`, value.start);
		}

		parser.allowWhitespace();

		if (quoteMark) {
			parser.eat(quoteMark, true);
		}
	} else {
		// shorthand – bind:foo equivalent to bind:foo='foo'
		value = {
			type: 'Identifier',
			start: start + 5,
			end: parser.index,
			name,
		};
	}

	return {
		start,
		end: parser.index,
		type: 'Binding',
		name,
		value,
	};
}

export function readTransitionDirective(
	parser: Parser,
	start: number,
	name: string,
	type: string
) {
	let expression = null;

	if (parser.eat('=')) {
		const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

		const expressionStart = parser.index;

		expression = readExpression(parser, expressionStart, quoteMark);

		if (expression.type !== 'ObjectExpression') {
			parser.error(`Expected object expression`, expressionStart);
		}
	}

	return {
		start,
		end: parser.index,
		type: 'Transition',
		name,
		intro: type === 'in' || type === 'transition',
		outro: type === 'out' || type === 'transition',
		expression,
	};
}
