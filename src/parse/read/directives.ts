import { parseExpressionAt } from 'acorn';
import repeat from '../../utils/repeat';
import { Parser } from '../index';

const DIRECTIVES: Record<string, {
	names: string[];
	attribute: (
		start: number,
		end: number,
		type: string,
		name: string,
		expression?: any,
		directiveName?: string
	) => { start: number, end: number, type: string, name: string, value?: any, expression?: any };
	allowedExpressionTypes: string[];
	error: string;
}> = {
	Ref: {
		names: ['ref'],
		attribute(start, end, type, name) {
			return { start, end, type, name };
		},
		allowedExpressionTypes: [],
		error: 'ref directives cannot have a value'
	},

	EventHandler: {
		names: ['on'],
		attribute(start, end, type, name, expression) {
			return { start, end, type, name, expression };
		},
		allowedExpressionTypes: ['CallExpression'],
		error: 'Expected a method call'
	},

	Binding: {
		names: ['bind'],
		attribute(start, end, type, name, expression) {
			return {
				start, end, type, name,
				value: expression || {
					type: 'Identifier',
					start: start + 5,
					end,
					name,
				}
			};
		},
		allowedExpressionTypes: ['Identifier', 'MemberExpression'],
		error: 'Can only bind to an identifier (e.g. `foo`) or a member expression (e.g. `foo.bar` or `foo[baz]`)'
	},

	Transition: {
		names: ['in', 'out', 'transition'],
		attribute(start, end, type, name, expression, directiveName) {
			return {
				start, end, type, name, expression,
				intro: directiveName === 'in' || directiveName === 'transition',
				outro: directiveName === 'out' || directiveName === 'transition',
			};
		},
		allowedExpressionTypes: ['ObjectExpression'],
		error: 'Transition argument must be an object literal, e.g. `{ duration: 400 }`'
	},

	Animation: {
		names: ['animate'],
		attribute(start, end, type, name, expression) {
			return { start, end, type, name, expression };
		},
		allowedExpressionTypes: ['ObjectExpression'],
		error: 'Animation argument must be an object literal, e.g. `{ duration: 400 }`'
	},

	Action: {
		names: ['use'],
		attribute(start, end, type, name, expression) {
			return { start, end, type, name, expression };
		},
		allowedExpressionTypes: [ 'Identifier', 'MemberExpression', 'ObjectExpression', 'Literal', 'CallExpression' ],
		error: 'Data passed to actions must be an identifier (e.g. `foo`), a member expression ' +
			'(e.g. `foo.bar` or `foo[baz]`), a method call (e.g. `foo()`), or a literal (e.g. `true` or `\'a string\'`'
	},
};


const lookupByName = {};

Object.keys(DIRECTIVES).forEach(name => {
	const directive = DIRECTIVES[name];
	directive.names.forEach(type => lookupByName[type] = name);
});

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
		} else if (/[\s\/>]/.test(char)) {
			break;
		} else {
			str += char;
		}
	}

	const expression = parseExpressionAt(repeat(' ', start) + str, start, {
		ecmaVersion: 9,
	});
	parser.index = expression.end;

	parser.allowWhitespace();
	if (quoteMark) parser.eat(quoteMark, true);

	return expression;
}

export function readDirective(
	parser: Parser,
	start: number,
	attrName: string
) {
	const [directiveName, name] = attrName.split(':');
	if (name === undefined) return; // No colon in the name

	if (directiveName === '') {
		// not a directive — :foo is short for foo={{foo}}
		return {
			start: start,
			end: start + name.length + 1,
			type: 'Attribute',
			name,
			value: getShorthandValue(start + 1, name)
		};
	}

	const type = lookupByName[directiveName];
	if (!type) return; // not a registered directive

	const directive = DIRECTIVES[type];
	let expression = null;

	if (parser.eat('=')) {
		const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

		const expressionStart = parser.index;

		try {
			expression = readExpression(parser, expressionStart, quoteMark);
			if (directive.allowedExpressionTypes.indexOf(expression.type) === -1) {
				parser.error({
					code: `invalid-directive-value`,
					message: directive.error
				}, expressionStart);
			}
		} catch (err) {
			if (parser.template[expressionStart] === '{') {
				// assume the mistake was wrapping the directive arguments.
				// this could yield false positives! but hopefully not too many
				let message = 'directive values should not be wrapped';
				const expressionEnd = parser.template.indexOf('}', expressionStart);
				if (expressionEnd !== -1) {
					const value = parser.template.slice(expressionStart + 1, expressionEnd);
					message += ` — use '${value}', not '{${value}}'`;
				}
				parser.error({
					code: `invalid-directive-value`,
					message
				}, expressionStart);
			}

			throw err;
		}
	}

	return directive.attribute(start, parser.index, type, name, expression, directiveName);
}


function getShorthandValue(start: number, name: string) {
	const end = start + name.length;

	return [
		{
			type: 'AttributeShorthand',
			start,
			end,
			expression: {
				type: 'Identifier',
				start,
				end,
				name,
			},
		},
	];
}
