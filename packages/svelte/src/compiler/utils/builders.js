import { regex_is_valid_identifier } from '../phases/patterns.js';
import { sanitize_template_string } from './sanitize_template_string.js';

/**
 * @param {Array<import('estree').Expression | import('estree').SpreadElement | null>} elements
 * @returns {import('estree').ArrayExpression}
 */
export function array(elements = []) {
	return { type: 'ArrayExpression', elements };
}

/**
 * @param {Array<import('estree').Pattern | null>} elements
 * @returns {import('estree').ArrayPattern}
 */
export function array_pattern(elements) {
	return { type: 'ArrayPattern', elements };
}

/**
 * @param {import('estree').Pattern} left
 * @param {import('estree').Expression} right
 * @returns {import('estree').AssignmentPattern}
 */
export function assignment_pattern(left, right) {
	return { type: 'AssignmentPattern', left, right };
}

/**
 * @param {Array<import('estree').Pattern>} params
 * @param {import('estree').BlockStatement | import('estree').Expression} body
 * @returns {import('estree').ArrowFunctionExpression}
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
 * @param {import('estree').AssignmentOperator} operator
 * @param {import('estree').Pattern} left
 * @param {import('estree').Expression} right
 * @returns {import('estree').AssignmentExpression}
 */
export function assignment(operator, left, right) {
	return { type: 'AssignmentExpression', operator, left, right };
}

/**
 * @template T
 * @param {T & import('estree').BaseFunction} func
 * @returns {T & import('estree').BaseFunction}
 */
export function async(func) {
	return { ...func, async: true };
}

/**
 * @param {import('estree').Expression} argument
 * @returns {import('estree').AwaitExpression}
 */
function await_builder(argument) {
	return { type: 'AwaitExpression', argument };
}

/**
 * @param {import('estree').BinaryOperator} operator
 * @param {import('estree').Expression} left
 * @param {import('estree').Expression} right
 * @returns {import('estree').BinaryExpression}
 */
export function binary(operator, left, right) {
	return { type: 'BinaryExpression', operator, left, right };
}

/**
 * @param {import('estree').Statement[]} body
 * @returns {import('estree').BlockStatement}
 */
export function block(body) {
	return { type: 'BlockStatement', body };
}

/**
 * @param {string} name
 * @param {import('estree').Statement} body
 * @returns {import('estree').LabeledStatement}
 */
export function labeled(name, body) {
	return { type: 'LabeledStatement', label: id(name), body };
}

/**
 * @param {string | import('estree').Expression} callee
 * @param {...(import('estree').Expression | import('estree').SpreadElement)} args
 * @returns {import('estree').CallExpression}
 */
export function call(callee, ...args) {
	if (typeof callee === 'string') callee = id(callee);
	args = args.slice();

	while (args.length > 0 && !args.at(-1)) args.pop();

	return {
		type: 'CallExpression',
		callee,
		arguments: args,
		optional: false
	};
}

/**
 * @param {string | import('estree').Expression} callee
 * @param {...import('estree').Expression} args
 * @returns {import('estree').ChainExpression}
 */
export function maybe_call(callee, ...args) {
	const expression = /** @type {import('estree').SimpleCallExpression} */ (call(callee, ...args));
	expression.optional = true;

	return {
		type: 'ChainExpression',
		expression
	};
}

/**
 * @param {import('estree').UnaryOperator} operator
 * @param {import('estree').Expression} argument
 * @returns {import('estree').UnaryExpression}
 */
export function unary(operator, argument) {
	return { type: 'UnaryExpression', argument, operator, prefix: true };
}

/**
 * @param {import('estree').Expression} test
 * @param {import('estree').Expression} consequent
 * @param {import('estree').Expression} alternate
 * @returns {import('estree').ConditionalExpression}
 */
export function conditional(test, consequent, alternate) {
	return { type: 'ConditionalExpression', test, consequent, alternate };
}

/**
 * @param {import('estree').LogicalOperator} operator
 * @param {import('estree').Expression} left
 * @param {import('estree').Expression} right
 * @returns {import('estree').LogicalExpression}
 */
export function logical(operator, left, right) {
	return { type: 'LogicalExpression', operator, left, right };
}

/**
 * @param {'const' | 'let' | 'var'} kind
 * @param {string | import('estree').Pattern} pattern
 * @param {import('estree').Expression} [init]
 * @returns {import('estree').VariableDeclaration}
 */
export function declaration(kind, pattern, init) {
	if (typeof pattern === 'string') pattern = id(pattern);

	return {
		type: 'VariableDeclaration',
		kind,
		declarations: [init ? declarator(pattern, init) : declarator(pattern)]
	};
}

/**
 * @param {import('estree').Pattern} id
 * @param {import('estree').Expression} [init]
 * @returns {import('estree').VariableDeclarator}
 */
export function declarator(id, init) {
	return { type: 'VariableDeclarator', id, init };
}

/** @type {import('estree').EmptyStatement} */
export const empty = {
	type: 'EmptyStatement'
};

/**
 * @param {import('estree').Expression | import('estree').MaybeNamedClassDeclaration | import('estree').MaybeNamedFunctionDeclaration} declaration
 * @returns {import('estree').ExportDefaultDeclaration}
 */
export function export_default(declaration) {
	return { type: 'ExportDefaultDeclaration', declaration };
}

/**
 * @param {import('estree').Identifier} id
 * @param {import('estree').Pattern[]} params
 * @param {import('estree').BlockStatement} body
 * @returns {import('estree').FunctionDeclaration}
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
 * @param {import('estree').Statement[]} body
 * @returns {import('estree').Property & { value: import('estree').FunctionExpression}}}
 */
export function get(name, body) {
	return prop('get', key(name), function_builder(null, [], block(body)));
}

/**
 * @param {string} name
 * @returns {import('estree').Identifier}
 */
export function id(name) {
	return { type: 'Identifier', name };
}

/**
 * @param {string} name
 * @returns {import('estree').PrivateIdentifier}
 */
export function private_id(name) {
	return { type: 'PrivateIdentifier', name };
}

/**
 * @param {string} local
 * @returns {import('estree').ImportNamespaceSpecifier}
 */
function import_namespace(local) {
	return {
		type: 'ImportNamespaceSpecifier',
		local: id(local)
	};
}

/**
 * @param {string} name
 * @param {import('estree').Expression} value
 * @returns {import('estree').Property}
 */
export function init(name, value) {
	return prop('init', key(name), value);
}

/**
 * @param {string | boolean | null | number | RegExp} value
 * @returns {import('estree').Literal}
 */
export function literal(value) {
	// @ts-expect-error we don't want to muck around with bigint here
	return { type: 'Literal', value };
}

/**
 * @param {import('estree').Expression | import('estree').Super} object
 * @param {import('estree').Expression | import('estree').PrivateIdentifier} property
 * @param {boolean} computed
 * @param {boolean} optional
 * @returns {import('estree').MemberExpression}
 */
export function member(object, property, computed = false, optional = false) {
	return { type: 'MemberExpression', object, property, computed, optional };
}

/**
 * @param {string} path
 * @returns {import('estree').Identifier | import('estree').MemberExpression}
 */
export function member_id(path) {
	const parts = path.split('.');

	/** @type {import('estree').Identifier | import('estree').MemberExpression} */
	let expression = id(parts[0]);

	for (let i = 1; i < parts.length; i += 1) {
		expression = member(expression, id(parts[i]));
	}
	return expression;
}

/**
 * @param {Array<import('estree').Property | import('estree').SpreadElement>} properties
 * @returns {import('estree').ObjectExpression}
 */
export function object(properties) {
	return { type: 'ObjectExpression', properties };
}

/**
 * @param {Array<import('estree').RestElement | import('estree').AssignmentProperty>} properties
 * @returns {import('estree').ObjectPattern}
 */
export function object_pattern(properties) {
	return { type: 'ObjectPattern', properties };
}

/**
 * @template {import('estree').Expression} Value
 * @param {'init' | 'get' | 'set'} kind
 * @param {import('estree').Expression} key
 * @param {Value} value
 * @param {boolean} computed
 * @returns {import('estree').Property & { value: Value }}
 */
export function prop(kind, key, value, computed = false) {
	return { type: 'Property', kind, key, value, method: false, shorthand: false, computed };
}

/**
 * @param {import('estree').Expression | import('estree').PrivateIdentifier} key
 * @param {import('estree').Expression | null | undefined} value
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {import('estree').PropertyDefinition}
 */
export function prop_def(key, value, computed = false, is_static = false) {
	return { type: 'PropertyDefinition', key, value, computed, static: is_static };
}

/**
 * @param {string} cooked
 * @param {boolean} tail
 * @returns {import('estree').TemplateElement}
 */
export function quasi(cooked, tail = false) {
	const raw = sanitize_template_string(cooked);
	return { type: 'TemplateElement', value: { raw, cooked }, tail };
}

/**
 * @param {import('estree').Pattern} argument
 * @returns {import('estree').RestElement}
 */
export function rest(argument) {
	return { type: 'RestElement', argument };
}

/**
 * @param {import('estree').Expression[]} expressions
 * @returns {import('estree').SequenceExpression}
 */
export function sequence(expressions) {
	return { type: 'SequenceExpression', expressions };
}

/**
 * @param {string} name
 * @param {import('estree').Statement[]} body
 * @returns {import('estree').Property & { value: import('estree').FunctionExpression}}
 */
export function set(name, body) {
	return prop('set', key(name), function_builder(null, [id('$$value')], block(body)));
}

/**
 * @param {import('estree').Expression} argument
 * @returns {import('estree').SpreadElement}
 */
export function spread(argument) {
	return { type: 'SpreadElement', argument };
}

/**
 * @param {import('estree').Expression} expression
 * @returns {import('estree').ExpressionStatement}
 */
export function stmt(expression) {
	return { type: 'ExpressionStatement', expression };
}

/**
 * @param {import('estree').TemplateElement[]} elements
 * @param {import('estree').Expression[]} expressions
 * @returns {import('estree').TemplateLiteral}
 */
export function template(elements, expressions) {
	return { type: 'TemplateLiteral', quasis: elements, expressions };
}

/**
 * @param {import('estree').Expression | import('estree').BlockStatement} expression
 * @param {boolean} [async]
 * @returns {import('estree').Expression}
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
 * @param {string | import('estree').Expression} expression
 * @param  {...import('estree').Expression} args
 * @returns {import('estree').NewExpression}
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
 * @param {import('estree').UpdateOperator} operator
 * @param {import('estree').Expression} argument
 * @param {boolean} prefix
 * @returns {import('estree').UpdateExpression}
 */
export function update(operator, argument, prefix = false) {
	return { type: 'UpdateExpression', operator, argument, prefix };
}

/**
 * @param {import('estree').Expression} test
 * @param {import('estree').Statement} body
 * @returns {import('estree').DoWhileStatement}
 */
export function do_while(test, body) {
	return { type: 'DoWhileStatement', test, body };
}

const true_instance = literal(true);
const false_instance = literal(false);

/** @type {import('estree').DebuggerStatement} */
const debugger_builder = {
	type: 'DebuggerStatement'
};

/** @type {import('estree').ThisExpression} */
const this_instance = {
	type: 'ThisExpression'
};

/**
 * @param {string | import('estree').Pattern} pattern
 * @param { import('estree').Expression} [init]
 * @returns {import('estree').VariableDeclaration}
 */
function let_builder(pattern, init) {
	return declaration('let', pattern, init);
}

/**
 * @param {string | import('estree').Pattern} pattern
 * @param { import('estree').Expression} init
 * @returns {import('estree').VariableDeclaration}
 */
function const_builder(pattern, init) {
	return declaration('const', pattern, init);
}

/**
 * @param {string | import('estree').Pattern} pattern
 * @param { import('estree').Expression} [init]
 * @returns {import('estree').VariableDeclaration}
 */
function var_builder(pattern, init) {
	return declaration('var', pattern, init);
}

/**
 *
 * @param {import('estree').VariableDeclaration | import('estree').Expression | null} init
 * @param {import('estree').Expression} test
 * @param {import('estree').Expression} update
 * @param {import('estree').Statement} body
 * @returns {import('estree').ForStatement}
 */
function for_builder(init, test, update, body) {
	return { type: 'ForStatement', init, test, update, body };
}

/**
 *
 * @param {'constructor' | 'method' | 'get' | 'set'} kind
 * @param {import('estree').Expression | import('estree').PrivateIdentifier} key
 * @param {import('estree').Pattern[]} params
 * @param {import('estree').Statement[]} body
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {import('estree').MethodDefinition}
 */
export function method(kind, key, params, body, computed = false, is_static = false) {
	return {
		type: 'MethodDefinition',
		key,
		kind,
		value: function_builder(null, params, block(body)),
		computed,
		static: is_static
	};
}

/**
 *
 * @param {import('estree').Identifier | null} id
 * @param {import('estree').Pattern[]} params
 * @param {import('estree').BlockStatement} body
 * @returns {import('estree').FunctionExpression}
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
 * @param {import('estree').Expression} test
 * @param {import('estree').Statement} consequent
 * @param {import('estree').Statement} [alternate]
 * @returns {import('estree').IfStatement}
 */
function if_builder(test, consequent, alternate) {
	return { type: 'IfStatement', test, consequent, alternate };
}

/**
 * @param {string} as
 * @param {string} source
 * @returns {import('estree').ImportDeclaration}
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
 * @returns {import('estree').ImportDeclaration}
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
 * @param {import('estree').Expression | null} argument
 * @returns {import('estree').ReturnStatement}
 */
function return_builder(argument = null) {
	return { type: 'ReturnStatement', argument };
}

/**
 * @param {string} str
 * @returns {import('estree').ThrowStatement}
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
	debugger_builder as debugger
};

/**
 * @param {string} name
 * @returns {import('estree').Expression}
 */
export function key(name) {
	return regex_is_valid_identifier.test(name) ? id(name) : literal(name);
}
