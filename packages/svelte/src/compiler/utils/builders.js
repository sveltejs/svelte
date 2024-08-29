/** @import * as ESTree from 'estree' */
import { regex_is_valid_identifier } from '../phases/patterns.js';
import { sanitize_template_string } from './sanitize_template_string.js';

/**
 * @param {Array<ESTree.Expression | ESTree.SpreadElement | null>} elements
 * @returns {ESTree.ArrayExpression}
 */
export function array(elements = []) {
	return { type: 'ArrayExpression', elements };
}

/**
 * @param {Array<ESTree.Pattern | null>} elements
 * @returns {ESTree.ArrayPattern}
 */
export function array_pattern(elements) {
	return { type: 'ArrayPattern', elements };
}

/**
 * @param {ESTree.Pattern} left
 * @param {ESTree.Expression} right
 * @returns {ESTree.AssignmentPattern}
 */
export function assignment_pattern(left, right) {
	return { type: 'AssignmentPattern', left, right };
}

/**
 * @param {Array<ESTree.Pattern>} params
 * @param {ESTree.BlockStatement | ESTree.Expression} body
 * @returns {ESTree.ArrowFunctionExpression}
 */
export function arrow(params, body) {
	return {
		type: 'ArrowFunctionExpression',
		params,
		body,
		expression: body.type !== 'BlockStatement',
		generator: false,
		async: false,
		metadata: /** @type {any} */ (null) // should not be used by codegen
	};
}

/**
 * @param {ESTree.AssignmentOperator} operator
 * @param {ESTree.Pattern} left
 * @param {ESTree.Expression} right
 * @returns {ESTree.AssignmentExpression}
 */
export function assignment(operator, left, right) {
	return { type: 'AssignmentExpression', operator, left, right };
}

/**
 * @template T
 * @param {T & ESTree.BaseFunction} func
 * @returns {T & ESTree.BaseFunction}
 */
export function async(func) {
	return { ...func, async: true };
}

/**
 * @param {ESTree.Expression} argument
 * @returns {ESTree.AwaitExpression}
 */
function await_builder(argument) {
	return { type: 'AwaitExpression', argument };
}

/**
 * @param {ESTree.BinaryOperator} operator
 * @param {ESTree.Expression} left
 * @param {ESTree.Expression} right
 * @returns {ESTree.BinaryExpression}
 */
export function binary(operator, left, right) {
	return { type: 'BinaryExpression', operator, left, right };
}

/**
 * @param {ESTree.Statement[]} body
 * @returns {ESTree.BlockStatement}
 */
export function block(body) {
	return { type: 'BlockStatement', body };
}

/**
 * @param {string} name
 * @param {ESTree.Statement} body
 * @returns {ESTree.LabeledStatement}
 */
export function labeled(name, body) {
	return { type: 'LabeledStatement', label: id(name), body };
}

/**
 * @param {string | ESTree.Expression} callee
 * @param {...(ESTree.Expression | ESTree.SpreadElement | false | undefined)} args
 * @returns {ESTree.CallExpression}
 */
export function call(callee, ...args) {
	if (typeof callee === 'string') callee = id(callee);
	args = args.slice();

	// replacing missing arguments with `undefined`, unless they're at the end in which case remove them
	let i = args.length;
	let popping = true;
	while (i--) {
		if (!args[i]) {
			if (popping) {
				args.pop();
			} else {
				args[i] = id('undefined');
			}
		} else {
			popping = false;
		}
	}

	return {
		type: 'CallExpression',
		callee,
		arguments: /** @type {Array<ESTree.Expression | ESTree.SpreadElement>} */ (args),
		optional: false
	};
}

/**
 * @param {string | ESTree.Expression} callee
 * @param {...ESTree.Expression} args
 * @returns {ESTree.ChainExpression}
 */
export function maybe_call(callee, ...args) {
	const expression = /** @type {ESTree.SimpleCallExpression} */ (call(callee, ...args));
	expression.optional = true;

	return {
		type: 'ChainExpression',
		expression
	};
}

/**
 * @param {ESTree.UnaryOperator} operator
 * @param {ESTree.Expression} argument
 * @returns {ESTree.UnaryExpression}
 */
export function unary(operator, argument) {
	return { type: 'UnaryExpression', argument, operator, prefix: true };
}

/**
 * @param {ESTree.Expression} test
 * @param {ESTree.Expression} consequent
 * @param {ESTree.Expression} alternate
 * @returns {ESTree.ConditionalExpression}
 */
export function conditional(test, consequent, alternate) {
	return { type: 'ConditionalExpression', test, consequent, alternate };
}

/**
 * @param {ESTree.LogicalOperator} operator
 * @param {ESTree.Expression} left
 * @param {ESTree.Expression} right
 * @returns {ESTree.LogicalExpression}
 */
export function logical(operator, left, right) {
	return { type: 'LogicalExpression', operator, left, right };
}

/**
 * @param {'const' | 'let' | 'var'} kind
 * @param {ESTree.VariableDeclarator[]} declarations
 * @returns {ESTree.VariableDeclaration}
 */
export function declaration(kind, declarations) {
	return {
		type: 'VariableDeclaration',
		kind,
		declarations
	};
}

/**
 * @param {ESTree.Pattern | string} pattern
 * @param {ESTree.Expression} [init]
 * @returns {ESTree.VariableDeclarator}
 */
export function declarator(pattern, init) {
	if (typeof pattern === 'string') pattern = id(pattern);
	return { type: 'VariableDeclarator', id: pattern, init };
}

/** @type {ESTree.EmptyStatement} */
export const empty = {
	type: 'EmptyStatement'
};

/**
 * @param {ESTree.Expression | ESTree.MaybeNamedClassDeclaration | ESTree.MaybeNamedFunctionDeclaration} declaration
 * @returns {ESTree.ExportDefaultDeclaration}
 */
export function export_default(declaration) {
	return { type: 'ExportDefaultDeclaration', declaration };
}

/**
 * @param {ESTree.Identifier} id
 * @param {ESTree.Pattern[]} params
 * @param {ESTree.BlockStatement} body
 * @returns {ESTree.FunctionDeclaration}
 */
export function function_declaration(id, params, body) {
	return {
		type: 'FunctionDeclaration',
		id,
		params,
		body,
		generator: false,
		async: false,
		metadata: /** @type {any} */ (null) // should not be used by codegen
	};
}

/**
 * @param {string} name
 * @param {ESTree.Statement[]} body
 * @returns {ESTree.Property & { value: ESTree.FunctionExpression}}}
 */
export function get(name, body) {
	return prop('get', key(name), function_builder(null, [], block(body)));
}

/**
 * @param {string} name
 * @returns {ESTree.Identifier}
 */
export function id(name) {
	return { type: 'Identifier', name };
}

/**
 * @param {string} name
 * @returns {ESTree.PrivateIdentifier}
 */
export function private_id(name) {
	return { type: 'PrivateIdentifier', name };
}

/**
 * @param {string} local
 * @returns {ESTree.ImportNamespaceSpecifier}
 */
function import_namespace(local) {
	return {
		type: 'ImportNamespaceSpecifier',
		local: id(local)
	};
}

/**
 * @param {string} name
 * @param {ESTree.Expression} value
 * @returns {ESTree.Property}
 */
export function init(name, value) {
	return prop('init', key(name), value);
}

/**
 * @param {string | boolean | null | number | RegExp} value
 * @returns {ESTree.Literal}
 */
export function literal(value) {
	// @ts-expect-error we don't want to muck around with bigint here
	return { type: 'Literal', value };
}

/**
 * @param {ESTree.Expression | ESTree.Super} object
 * @param {string | ESTree.Expression | ESTree.PrivateIdentifier} property
 * @param {boolean} computed
 * @param {boolean} optional
 * @returns {ESTree.MemberExpression}
 */
export function member(object, property, computed = false, optional = false) {
	if (typeof property === 'string') {
		property = id(property);
	}

	return { type: 'MemberExpression', object, property, computed, optional };
}

/**
 * @param {string} path
 * @returns {ESTree.Identifier | ESTree.MemberExpression}
 */
export function member_id(path) {
	const parts = path.split('.');

	/** @type {ESTree.Identifier | ESTree.MemberExpression} */
	let expression = id(parts[0]);

	for (let i = 1; i < parts.length; i += 1) {
		expression = member(expression, id(parts[i]));
	}
	return expression;
}

/**
 * @param {Array<ESTree.Property | ESTree.SpreadElement>} properties
 * @returns {ESTree.ObjectExpression}
 */
export function object(properties) {
	return { type: 'ObjectExpression', properties };
}

/**
 * @param {Array<ESTree.RestElement | ESTree.AssignmentProperty | ESTree.Property>} properties
 * @returns {ESTree.ObjectPattern}
 */
export function object_pattern(properties) {
	// @ts-expect-error the types appear to be wrong
	return { type: 'ObjectPattern', properties };
}

/**
 * @template {ESTree.Expression} Value
 * @param {'init' | 'get' | 'set'} kind
 * @param {ESTree.Expression} key
 * @param {Value} value
 * @param {boolean} computed
 * @returns {ESTree.Property & { value: Value }}
 */
export function prop(kind, key, value, computed = false) {
	return { type: 'Property', kind, key, value, method: false, shorthand: false, computed };
}

/**
 * @param {ESTree.Expression | ESTree.PrivateIdentifier} key
 * @param {ESTree.Expression | null | undefined} value
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {ESTree.PropertyDefinition}
 */
export function prop_def(key, value, computed = false, is_static = false) {
	return { type: 'PropertyDefinition', key, value, computed, static: is_static, decorators: [] };
}

/**
 * @param {string} cooked
 * @param {boolean} tail
 * @returns {ESTree.TemplateElement}
 */
export function quasi(cooked, tail = false) {
	const raw = sanitize_template_string(cooked);
	return { type: 'TemplateElement', value: { raw, cooked }, tail };
}

/**
 * @param {ESTree.Pattern} argument
 * @returns {ESTree.RestElement}
 */
export function rest(argument) {
	return { type: 'RestElement', argument };
}

/**
 * @param {ESTree.Expression[]} expressions
 * @returns {ESTree.SequenceExpression}
 */
export function sequence(expressions) {
	return { type: 'SequenceExpression', expressions };
}

/**
 * @param {string} name
 * @param {ESTree.Statement[]} body
 * @returns {ESTree.Property & { value: ESTree.FunctionExpression}}
 */
export function set(name, body) {
	return prop('set', key(name), function_builder(null, [id('$$value')], block(body)));
}

/**
 * @param {ESTree.Expression} argument
 * @returns {ESTree.SpreadElement}
 */
export function spread(argument) {
	return { type: 'SpreadElement', argument };
}

/**
 * @param {ESTree.Expression} expression
 * @returns {ESTree.ExpressionStatement}
 */
export function stmt(expression) {
	return { type: 'ExpressionStatement', expression };
}

/**
 * @param {ESTree.TemplateElement[]} elements
 * @param {ESTree.Expression[]} expressions
 * @returns {ESTree.TemplateLiteral}
 */
export function template(elements, expressions) {
	return { type: 'TemplateLiteral', quasis: elements, expressions };
}

/**
 * @param {ESTree.Expression | ESTree.BlockStatement} expression
 * @param {boolean} [async]
 * @returns {ESTree.Expression}
 */
export function thunk(expression, async = false) {
	if (
		expression.type === 'CallExpression' &&
		expression.callee.type !== 'Super' &&
		expression.callee.type !== 'MemberExpression' &&
		expression.callee.type !== 'CallExpression' &&
		expression.arguments.length === 0
	) {
		return expression.callee;
	}

	const fn = arrow([], expression);
	if (async) fn.async = true;
	return fn;
}

/**
 *
 * @param {string | ESTree.Expression} expression
 * @param  {...ESTree.Expression} args
 * @returns {ESTree.NewExpression}
 */
function new_builder(expression, ...args) {
	if (typeof expression === 'string') expression = id(expression);

	return {
		callee: expression,
		arguments: args,
		type: 'NewExpression'
	};
}

/**
 * @param {ESTree.UpdateOperator} operator
 * @param {ESTree.Expression} argument
 * @param {boolean} prefix
 * @returns {ESTree.UpdateExpression}
 */
export function update(operator, argument, prefix = false) {
	return { type: 'UpdateExpression', operator, argument, prefix };
}

/**
 * @param {ESTree.Expression} test
 * @param {ESTree.Statement} body
 * @returns {ESTree.DoWhileStatement}
 */
export function do_while(test, body) {
	return { type: 'DoWhileStatement', test, body };
}

const true_instance = literal(true);
const false_instance = literal(false);
const null_instane = literal(null);

/** @type {ESTree.DebuggerStatement} */
const debugger_builder = {
	type: 'DebuggerStatement'
};

/** @type {ESTree.ThisExpression} */
const this_instance = {
	type: 'ThisExpression'
};

/**
 * @param {string | ESTree.Pattern} pattern
 * @param { ESTree.Expression} [init]
 * @returns {ESTree.VariableDeclaration}
 */
function let_builder(pattern, init) {
	return declaration('let', [declarator(pattern, init)]);
}

/**
 * @param {string | ESTree.Pattern} pattern
 * @param { ESTree.Expression} init
 * @returns {ESTree.VariableDeclaration}
 */
function const_builder(pattern, init) {
	return declaration('const', [declarator(pattern, init)]);
}

/**
 * @param {string | ESTree.Pattern} pattern
 * @param { ESTree.Expression} [init]
 * @returns {ESTree.VariableDeclaration}
 */
function var_builder(pattern, init) {
	return declaration('var', [declarator(pattern, init)]);
}

/**
 *
 * @param {ESTree.VariableDeclaration | ESTree.Expression | null} init
 * @param {ESTree.Expression} test
 * @param {ESTree.Expression} update
 * @param {ESTree.Statement} body
 * @returns {ESTree.ForStatement}
 */
function for_builder(init, test, update, body) {
	return { type: 'ForStatement', init, test, update, body };
}

/**
 *
 * @param {'constructor' | 'method' | 'get' | 'set'} kind
 * @param {ESTree.Expression | ESTree.PrivateIdentifier} key
 * @param {ESTree.Pattern[]} params
 * @param {ESTree.Statement[]} body
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {ESTree.MethodDefinition}
 */
export function method(kind, key, params, body, computed = false, is_static = false) {
	return {
		type: 'MethodDefinition',
		key,
		kind,
		value: function_builder(null, params, block(body)),
		computed,
		static: is_static,
		decorators: []
	};
}

/**
 *
 * @param {ESTree.Identifier | null} id
 * @param {ESTree.Pattern[]} params
 * @param {ESTree.BlockStatement} body
 * @returns {ESTree.FunctionExpression}
 */
function function_builder(id, params, body) {
	return {
		type: 'FunctionExpression',
		id,
		params,
		body,
		generator: false,
		async: false,
		metadata: /** @type {any} */ (null) // should not be used by codegen
	};
}

/**
 * @param {ESTree.Expression} test
 * @param {ESTree.Statement} consequent
 * @param {ESTree.Statement} [alternate]
 * @returns {ESTree.IfStatement}
 */
function if_builder(test, consequent, alternate) {
	return { type: 'IfStatement', test, consequent, alternate };
}

/**
 * @param {string} as
 * @param {string} source
 * @returns {ESTree.ImportDeclaration}
 */
export function import_all(as, source) {
	return {
		type: 'ImportDeclaration',
		source: literal(source),
		specifiers: [import_namespace(as)]
	};
}

/**
 * @param {Array<[string, string]>} parts
 * @param {string} source
 * @returns {ESTree.ImportDeclaration}
 */
export function imports(parts, source) {
	return {
		type: 'ImportDeclaration',
		source: literal(source),
		specifiers: parts.map((p) => ({
			type: 'ImportSpecifier',
			imported: id(p[0]),
			local: id(p[1])
		}))
	};
}

/**
 * @param {ESTree.Expression | null} argument
 * @returns {ESTree.ReturnStatement}
 */
function return_builder(argument = null) {
	return { type: 'ReturnStatement', argument };
}

/**
 * @param {string} str
 * @returns {ESTree.ThrowStatement}
 */
export function throw_error(str) {
	return {
		type: 'ThrowStatement',
		argument: new_builder('Error', literal(str))
	};
}

export {
	await_builder as await,
	let_builder as let,
	const_builder as const,
	var_builder as var,
	true_instance as true,
	false_instance as false,
	for_builder as for,
	function_builder as function,
	return_builder as return,
	if_builder as if,
	this_instance as this,
	null_instane as null,
	debugger_builder as debugger
};

/**
 * @param {string} name
 * @returns {ESTree.Expression}
 */
export function key(name) {
	return regex_is_valid_identifier.test(name) ? id(name) : literal(name);
}
