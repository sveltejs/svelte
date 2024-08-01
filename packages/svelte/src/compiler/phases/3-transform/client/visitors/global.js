/** @import { Visitors } from '../types' */
import { ArrowFunctionExpression } from './ArrowFunctionExpression.js';
import { AssignmentExpression } from './AssignmentExpression.js';
import { Comment } from './Comment.js';
import { ConstTag } from './ConstTag.js';
import { DebugTag } from './DebugTag.js';
import { Fragment } from './Fragment.js';
import { FunctionDeclaration } from './FunctionDeclaration.js';
import { FunctionExpression } from './FunctionExpression.js';
import { HtmlTag } from './HtmlTag.js';
import { Identifier } from './Identifier.js';
import { MemberExpression } from './MemberExpression.js';
import { RenderTag } from './RenderTag.js';
import { UpdateExpression } from './UpdateExpression.js';

/** @type {Visitors} */
export const global_visitors = {
	ArrowFunctionExpression,
	AssignmentExpression,
	Comment,
	ConstTag,
	DebugTag,
	Fragment,
	FunctionDeclaration,
	FunctionExpression,
	HtmlTag,
	Identifier,
	MemberExpression,
	RenderTag,
	UpdateExpression
};
