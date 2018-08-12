import flattenReference from '../../utils/flattenReference';
import list from '../../utils/list';
import validate, { Validator } from '../index';
import validCalleeObjects from '../../utils/validCalleeObjects';
import { Node } from '../../interfaces';

const validBuiltins = new Set(['set', 'fire', 'destroy']);

const validModifiers = new Set(['stopPropagation', 'preventDefault', 'capture', 'once', 'passive']);

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

	const modifiers = attribute.name.split('|').slice(1);
	if (
		modifiers.length > 0 &&
		modifiers.filter(m => !validModifiers.has(m)).length > 0
	) {
		validator.error(attribute, {
			code: 'invalid-event-modifiers',
			message: `Valid event modifiers are ${[...validModifiers].join(', ')}.`
		});
	}

	const { name } = flattenReference(callee);

	if (validCalleeObjects.has(name) || name === 'options') return;

	if (name === 'refs') {
		refCallees.push(callee);
		return;
	}

	if (
		(callee.type === 'Identifier' && validBuiltins.has(callee.name)) ||
		validator.methods.has(callee.name)
	) {
		return;
	}

	if (name[0] === '$') {
		// assume it's a store method
		return;
	}

	const validCallees = ['this.*', 'refs.*', 'event.*', 'options.*', 'console.*'].concat(
		Array.from(validBuiltins),
		Array.from(validator.methods.keys())
	);

	let message = `'${validator.source.slice(callee.start, callee.end)}' is an invalid callee ` ;

	if (name === 'store') {
		message += `(did you mean '$${validator.source.slice(callee.start + 6, callee.end)}(...)'?)`;
	} else {
		message += `(should be one of ${list(validCallees)})`;

		if (callee.type === 'Identifier' && validator.helpers.has(callee.name)) {
			message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
		}
	}

	validator.warn(attribute.expression, {
		code: `invalid-callee`,
		message
	});
}
