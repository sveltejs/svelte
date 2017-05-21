import { Validator } from '../../';
import { Node } from '../../../interfaces';

const disallowed = new Set([ 'Literal', 'ObjectExpression', 'ArrayExpression' ]);

export default function data ( validator: Validator, prop: Node ) {
	while ( prop.type === 'ParenthesizedExpression' ) prop = prop.expression;

	// TODO should we disallow references and expressions as well?

	if ( disallowed.has( prop.value.type ) ) {
		validator.error( `'data' must be a function`, prop.value.start );
	}
}
