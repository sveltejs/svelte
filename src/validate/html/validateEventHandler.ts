import flattenReference from '../../utils/flattenReference';
import list from '../utils/list';

const validBuiltins = new Set([
	'set',
	'fire',
	'destroy'
]);

export default function validateEventHandlerCallee ( validator, attribute ) {
	const { callee, start, type } = attribute.expression;

	if ( type !== 'CallExpression' ) {
		validator.error( `Expected a call expression`, start );
	}

	const { name } = flattenReference( callee );

	if ( name === 'this' || name === 'event' ) return;
	if ( callee.type === 'Identifier' && validBuiltins.has( callee.name ) || validator.methods.has( callee.name ) ) return;

	const validCallees = [ 'this.*', 'event.*' ]
		.concat(
			Array.from( validBuiltins ),
			Array.from( validator.methods.keys() )
		);

	let message = `'${validator.source.slice( callee.start, callee.end )}' is an invalid callee (should be one of ${list( validCallees )})`;

	if ( callee.type === 'Identifier' && validator.helpers.has( callee.name ) ) {
		message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
	}

	validator.warn( message, start );
}
