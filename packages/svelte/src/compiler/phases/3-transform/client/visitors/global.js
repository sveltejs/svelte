/** @import { Visitors } from '../types' */
import { ArrowFunctionExpression } from './ArrowFunctionExpression.js';
import { AssignmentExpression } from './AssignmentExpression.js';
import { Fragment } from './Fragment.js';
import { FunctionDeclaration } from './FunctionDeclaration.js';
import { FunctionExpression } from './FunctionExpression.js';
import { Identifier } from './Identifier.js';
import { MemberExpression } from './MemberExpression.js';
import { UpdateExpression } from './UpdateExpression.js';

/** @type {Visitors} */
export const global_visitors = {
	ArrowFunctionExpression,
	AssignmentExpression,
	Fragment,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	MemberExpression,
	UpdateExpression
};
