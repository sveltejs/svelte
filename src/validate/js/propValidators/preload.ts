import { Validator } from '../../';
import { Node } from '../../../interfaces';

const validTypes = new Set([
	'FunctionExpression',
	'ArrowFunctionExpression',
	'Identifier',
	'MemberExpression'
]);

export default function preload(validator: Validator, prop: Node) {
	// not sure there's anything we need to check here...
}
