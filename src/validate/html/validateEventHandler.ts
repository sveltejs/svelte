import flattenReference from '../../utils/flattenReference';
import list from '../../utils/list';
import validate, { Validator } from '../index';
import validCalleeObjects from '../../utils/validCalleeObjects';
import { Node } from '../../interfaces';

const validBuiltins = new Set(['set', 'fire', 'destroy']);

export default function validateEventHandlerCallee(
	validator: Validator,
	attribute: Node,
	refCallees: Node[]
) {
	if (!attribute.expression) return;

	const { callee, type } = attribute.expression;

	if (type !== 'CallExpression') {
		validator.error(attribute.expression, {
			code: `invalid-event-handler`,
			message: `Expected a call expression`
		});
	}

	const { name } = flattenReference(callee);

	if (validCalleeObjects.has(name) || name === 'options') return;

	if (name === 'refs') {
		refCallees.push(callee);
		return;
	}

	if (name === 'store' && attribute.expression.callee.type === 'MemberExpression') {
		if (!validator.options.store) {
			validator.warn(attribute.expression, {
				code: `options-missing-store`,
				message: 'compile with `store: true` in order to call store methods'
			});
		}
		return;
	}

	if (
		(callee.type === 'Identifier' && validBuiltins.has(callee.name)) ||
		validator.methods.has(callee.name)
	)
		return;

	const validCallees = ['this.*', 'event.*', 'options.*', 'console.*'].concat(
		validator.options.store ? 'store.*' : [],
		Array.from(validBuiltins),
		Array.from(validator.methods.keys())
	);

	let message = `'${validator.source.slice(
		callee.start,
		callee.end
	)}' is an invalid callee (should be one of ${list(validCallees)})`;

	if (callee.type === 'Identifier' && validator.helpers.has(callee.name)) {
		message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
	}

	validator.warn(attribute.expression, {
		code: `invalid-callee`,
		message
	});
}
