import flattenReference from '../../utils/flattenReference';
import list from '../../utils/list';
import validate, { Validator } from '../index';
import validCalleeObjects from '../../utils/validCalleeObjects';
import { Node } from '../../interfaces';
import Component from '../../compile/Component';

const validBuiltins = new Set(['set', 'fire', 'destroy']);

export default function validateEventHandlerCallee(
	component: Component,
	attribute: Node
) {
	if (!attribute.expression) return;

	const { callee, type } = attribute.expression;

	if (type !== 'CallExpression') {
		component.error(attribute.expression, {
			code: `invalid-event-handler`,
			message: `Expected a call expression`
		});
	}

	const { name } = flattenReference(callee);

	if (validCalleeObjects.has(name) || name === 'options') return;

	if (name === 'refs') {
		component.refCallees.push(callee);
		return;
	}

	if (
		(callee.type === 'Identifier' && validBuiltins.has(callee.name)) ||
		component.methods.has(callee.name)
	) {
		return;
	}

	if (name[0] === '$') {
		// assume it's a store method
		return;
	}

	const validCallees = ['this.*', 'refs.*', 'event.*', 'options.*', 'console.*'].concat(
		Array.from(validBuiltins),
		Array.from(component.methods.keys())
	);

	let message = `'${component.source.slice(callee.start, callee.end)}' is an invalid callee ` ;

	if (name === 'store') {
		message += `(did you mean '$${component.source.slice(callee.start + 6, callee.end)}(...)'?)`;
	} else {
		message += `(should be one of ${list(validCallees)})`;

		if (callee.type === 'Identifier' && component.helpers.has(callee.name)) {
			message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
		}
	}

	component.warn(attribute.expression, {
		code: `invalid-callee`,
		message
	});
}
