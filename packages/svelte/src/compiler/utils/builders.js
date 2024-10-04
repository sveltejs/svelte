/** @import * as AST from 'oxc-svelte/ast-builder' */
import { regex_is_valid_identifier } from '../phases/patterns.js';
import { sanitize_template_string } from './sanitize_template_string.js';

/**
 * @param {Array<AST.Expression | AST.SpreadElement | null>} elements
 * @returns {AST.ArrayExpression}
 */
export function array(elements = []) {
	return { type: 'ArrayExpression', elements };
}

/**
 * @param {Array<AST.BindingPattern | null>} elements
 * @returns {AST.ArrayPattern}
 */
export function array_pattern(elements) {
	return { type: 'ArrayPattern', elements };
}

/**
 * @param {AST.BindingPattern} left
 * @param {AST.Expression} right
 * @returns {AST.AssignmentPattern}
 */
export function assignment_pattern(left, right) {
	return { type: 'AssignmentPattern', left, right };
}

/**
 * @param {Array<AST.BindingPattern>} params
 * @param {AST.BlockStatement | AST.Expression} body
 * @returns {AST.ArrowFunctionExpression}
 */
export function arrow(params, body) {
	return {
		type: 'ArrowFunctionExpression',
		params: parameters(params, 'ArrowFormalParameters'),
		body: {
			type: 'FunctionBody',
			directives: [],
			statements: body.type === 'BlockStatement' ? body.body : [stmt(body)]
		},
		expression: body.type !== 'BlockStatement',
		async: false,
		typeParameters: null,
		returnType: null
	};
}

/**
 * @param {AST.AssignmentOperator} operator
 * @param {AST.AssignmentTarget} left
 * @param {AST.Expression} right
 * @returns {AST.AssignmentExpression}
 */
export function assignment(operator, left, right) {
	return { type: 'AssignmentExpression', operator, left, right };
}

/**
 * @template T
 * @param {T & AST.Function} func
 * @returns {T & AST.Function}
 */
export function async(func) {
	return { ...func, async: true };
}

/**
 * @param {AST.Expression} argument
 * @returns {AST.AwaitExpression}
 */
function await_builder(argument) {
	return { type: 'AwaitExpression', argument };
}

/**
 * @param {AST.BinaryOperator} operator
 * @param {AST.Expression} left
 * @param {AST.Expression} right
 * @returns {AST.BinaryExpression}
 */
export function binary(operator, left, right) {
	return { type: 'BinaryExpression', operator, left, right };
}

/**
 * @param {AST.Statement[]} body
 * @returns {AST.BlockStatement}
 */
export function block(body) {
	return { type: 'BlockStatement', body };
}

/**
 * @param {string} name
 * @param {AST.Statement} body
 * @returns {AST.LabeledStatement}
 */
export function labeled(name, body) {
	return { type: 'LabeledStatement', label: id(name), body };
}

/**
 * @param {string | AST.Expression} callee
 * @param {...(AST.Expression | AST.SpreadElement | false | undefined)} args
 * @returns {AST.CallExpression}
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
		callee: /** @type {AST.Expression} */ (callee),
		arguments: /** @type {Array<AST.Expression | AST.SpreadElement>} */ (args),
		optional: false,
		typeParameters: null
	};
}

/**
 * @param {string | AST.Expression} callee
 * @param {...AST.Expression} args
 * @returns {AST.ChainExpression}
 */
export function maybe_call(callee, ...args) {
	const expression = /** @type {AST.CallExpression} */ (call(callee, ...args));
	expression.optional = true;

	return {
		type: 'ChainExpression',
		expression
	};
}

/**
 * @param {AST.UnaryOperator} operator
 * @param {AST.Expression} argument
 * @returns {AST.UnaryExpression}
 */
export function unary(operator, argument) {
	return { type: 'UnaryExpression', argument, operator };
}

/**
 * @param {AST.Expression} test
 * @param {AST.Expression} consequent
 * @param {AST.Expression} alternate
 * @returns {AST.ConditionalExpression}
 */
export function conditional(test, consequent, alternate) {
	return { type: 'ConditionalExpression', test, consequent, alternate };
}

/**
 * @param {AST.LogicalOperator} operator
 * @param {AST.Expression} left
 * @param {AST.Expression} right
 * @returns {AST.LogicalExpression}
 */
export function logical(operator, left, right) {
	return { type: 'LogicalExpression', operator, left, right };
}

/**
 * @param {'const' | 'let' | 'var'} kind
 * @param {AST.VariableDeclarator[]} declarations
 * @returns {AST.VariableDeclaration}
 */
export function declaration(kind, declarations) {
	return {
		type: 'VariableDeclaration',
		kind,
		declarations,
		declare: false /* typescript - declare const foo */
	};
}

/**
 * @param {AST.BindingPattern | string} pattern
 * @param {AST.Expression} init
 * @returns {AST.VariableDeclarator}
 */
export function declarator(pattern, init) {
	if (typeof pattern === 'string')
		pattern = { type: 'Identifier', name: pattern, optional: false, typeAnnotation: null };
	return {
		type: 'VariableDeclarator',
		id: /** @type {AST.BindingPattern} */ (pattern),
		init,
		definite: false /** const foo!: number */
	};
}

/** @type {AST.EmptyStatement} */
export const empty = {
	type: 'EmptyStatement'
};

/**
 * @param {AST.ExportDefaultDeclarationKind} declaration
 * @returns {AST.ExportDefaultDeclaration}
 */
export function export_default(declaration) {
	return {
		type: 'ExportDefaultDeclaration',
		declaration,
		exported: { type: 'Identifier', name: 'default' }
	};
}

/**
 * @param {AST.IdentifierReference} id
 * @param {Array<AST.BindingPattern>} params
 * @param {AST.BlockStatement} body
 * @returns {AST.Function}
 */
export function function_declaration(id, params, body) {
	return {
		type: 'FunctionDeclaration',
		id,
		params: parameters(params),
		body: {
			type: 'FunctionBody',
			directives: [],
			statements: body.body
		},
		generator: false,
		async: false,
		typeParameters: null,
		returnType: null,
		declare: false,
		thisParam: null
	};
}

/**
 * @param {string} name
 * @param {AST.Statement[]} body
 * @returns {AST.ObjectProperty & { value: AST.Function }}
 */
export function get(name, body) {
	return prop('get', key(name), function_builder(null, [], block(body)));
}

/**
 * @param {string} name
 * @returns {AST.IdentifierReference}
 */
export function id(name) {
	return { type: 'Identifier', name };
}

/**
 * @param {string} name
 * @returns {AST.PrivateIdentifier}
 */
export function private_id(name) {
	return { type: 'PrivateIdentifier', name };
}

/**
 * @param {string} local
 * @returns {AST.ImportNamespaceSpecifier}
 */
function import_namespace(local) {
	return {
		type: 'ImportNamespaceSpecifier',
		local: id(local)
	};
}

/**
 * @param {string} name
 * @param {AST.Expression} value
 * @returns {AST.ObjectProperty}
 */
export function init(name, value) {
	return prop('init', key(name), value);
}

/**
 * @param {string | boolean | null | number} value
 * @returns {AST.StringLiteral | AST.BooleanLiteral | AST.NullLiteral | AST.NumericLiteral}
 */
export function literal(value) {
	if (value === null) return { type: 'NullLiteral' };
	switch (typeof value) {
		case 'string':
			return {
				type: 'StringLiteral',
				value
			};
		case 'boolean':
			return {
				type: 'BooleanLiteral',
				value
			};
		case 'number':
			return {
				type: 'NumericLiteral',
				value,
				raw: value.toString()
			};
		default:
			throw new Error(`invalid literal ${value}`);
	}
}

/**
 * @param {AST.Expression | AST.Super} object
 * @param {string | AST.Expression | AST.PrivateIdentifier} property
 * @param {boolean} optional
 * @returns {AST.MemberExpression}
 */
export function member(object, property, computed = false, optional = false) {
	if (typeof property === 'string') {
		property = id(property);
	}

	if (property.type === 'PrivateIdentifier') {
		return {
			type: 'PrivateFieldExpression',
			object,
			field: property,
			optional
		};
	}

	if (computed) {
		return {
			type: 'ComputedMemberExpression',
			object,
			expression: property,
			optional
		};
	}

	if (property.type !== 'Identifier') {
		throw new Error('invalid property type ' + property.type);
	}

	return {
		type: 'StaticMemberExpression',
		object,
		property,
		optional
	};
}

/**
 * @param {string} path
 * @returns {AST.IdentifierReference | AST.MemberExpression}
 */
export function member_id(path) {
	const parts = path.split('.');

	/** @type {AST.IdentifierReference | AST.MemberExpression} */
	let expression = id(parts[0]);

	for (let i = 1; i < parts.length; i += 1) {
		expression = member(expression, id(parts[i]));
	}
	return expression;
}

/**
 * @param {Array<AST.ObjectPropertyKind>} properties
 * @returns {AST.ObjectExpression}
 */
export function object(properties) {
	return { type: 'ObjectExpression', properties };
}

/**
 * @param {AST.ObjectPattern['properties']} properties
 * @returns {AST.ObjectPattern}
 */
export function object_pattern(properties) {
	return { type: 'ObjectPattern', properties };
}

/**
 * @template {AST.Expression} Value
 * @param {'init' | 'get' | 'set'} kind
 * @param {AST.Expression} key
 * @param {Value} value
 * @param {boolean} computed
 * @returns {AST.ObjectProperty & { value: Value }}
 */
export function prop(kind, key, value, computed = false) {
	return {
		type: 'ObjectProperty',
		kind,
		key,
		value,
		method: false,
		shorthand: false,
		computed,
		init: null
	};
}

/**
 * @param {AST.Expression | AST.PrivateIdentifier} key
 * @param {AST.Expression | null | undefined} value
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {AST.PropertyDefinition}
 */
export function prop_def(key, value = null, computed = false, is_static = false) {
	return {
		type: 'PropertyDefinition',
		key,
		value,
		computed,
		static: is_static,
		decorators: [],
		// Typescript properties
		declare: false,
		definite: false,
		typeAnnotation: null,
		accessibility: null,
		override: false,
		optional: false,
		readonly: false
	};
}

/**
 * @param {string} cooked
 * @param {boolean} tail
 * @returns {AST.TemplateElement}
 */
export function quasi(cooked, tail = false) {
	const raw = sanitize_template_string(cooked);
	return { type: 'TemplateElement', value: { raw, cooked }, tail };
}

/**
 * @param {AST.BindingPattern} argument
 * @returns {AST.BindingRestElement}
 */
export function rest(argument) {
	return { type: 'RestElement', argument };
}

/**
 * @param {AST.Expression[]} expressions
 * @returns {AST.SequenceExpression}
 */
export function sequence(expressions) {
	return { type: 'SequenceExpression', expressions };
}

/**
 * @param {string} name
 * @param {AST.Statement[]} body
 * @returns {AST.ObjectProperty & { value: AST.Function}}
 */
export function set(name, body) {
	return prop('set', key(name), function_builder(null, [id('$$value')], block(body)));
}

/**
 * @param {AST.Expression} argument
 * @returns {AST.SpreadElement}
 */
export function spread(argument) {
	return { type: 'SpreadElement', argument };
}

/**
 * @param {AST.Expression} expression
 * @returns {AST.ExpressionStatement}
 */
export function stmt(expression) {
	return { type: 'ExpressionStatement', expression };
}

/**
 * @param {AST.TemplateElement[]} elements
 * @param {AST.Expression[]} expressions
 * @returns {AST.TemplateLiteral}
 */
export function template(elements, expressions) {
	return { type: 'TemplateLiteral', quasis: elements, expressions };
}

/**
 * @param {AST.Expression | AST.BlockStatement} expression
 * @param {boolean} [async]
 * @returns {AST.Expression}
 */
export function thunk(expression, async = false) {
	const fn = arrow([], expression);
	if (async) fn.async = true;
	return unthunk(fn);
}

/**
 * Replace "(arg) => func(arg)" to "func"
 * @param {AST.Expression} expression
 * @returns {AST.Expression}
 */
export function unthunk(expression) {
	if (expression.type !== 'ArrowFunctionExpression' || expression.async) return expression;

	const body = expression.body.statements[0];
	if (!body) return expression;

	if (
		body.type === 'ExpressionStatement' &&
		body.expression.type === 'CallExpression' &&
		body.expression.callee.type === 'Identifier' &&
		expression.params.items.length === body.expression.arguments.length &&
		expression.params.items.every((param, index) => {
			const arg = /** @type {AST.CallExpression} */ (body.expression).arguments[index];
			return (
				param.type === 'FormalParameter' &&
				param.pattern.type === 'Identifier' &&
				arg.type === 'Identifier' &&
				param.pattern.name === arg.name
			);
		})
	) {
		return body.expression.callee;
	}
	return expression;
}

/**
 *
 * @param {string | AST.Expression} expression
 * @param  {...AST.Expression} args
 * @returns {AST.NewExpression}
 */
function new_builder(expression, ...args) {
	if (typeof expression === 'string') expression = id(expression);

	return {
		callee: expression,
		arguments: args,
		type: 'NewExpression',
		typeParameters: null
	};
}

/**
 * @param {AST.UpdateOperator} operator
 * @param {AST.SimpleAssignmentTarget} argument
 * @param {boolean} prefix
 * @returns {AST.UpdateExpression}
 */
export function update(operator, argument, prefix = false) {
	return { type: 'UpdateExpression', operator, argument, prefix };
}

/**
 * @param {AST.Expression} test
 * @param {AST.Statement} body
 * @returns {AST.DoWhileStatement}
 */
export function do_while(test, body) {
	return { type: 'DoWhileStatement', test, body };
}

const true_instance = literal(true);
const false_instance = literal(false);
const null_instane = literal(null);

/** @type {AST.DebuggerStatement} */
const debugger_builder = {
	type: 'DebuggerStatement'
};

/** @type {AST.ThisExpression} */
const this_instance = {
	type: 'ThisExpression'
};

/**
 * @param {string | AST.BindingPattern} pattern
 * @param {AST.Expression} init
 * @returns {AST.VariableDeclaration}
 */
function let_builder(pattern, init) {
	return declaration('let', [declarator(pattern, init)]);
}

/**
 * @param {string | AST.BindingPattern} pattern
 * @param { AST.Expression} init
 * @returns {AST.VariableDeclaration}
 */
function const_builder(pattern, init) {
	return declaration('const', [declarator(pattern, init)]);
}

/**
 * @param {string | AST.BindingPattern} pattern
 * @param {AST.Expression} init
 * @returns {AST.VariableDeclaration}
 */
function var_builder(pattern, init) {
	return declaration('var', [declarator(pattern, init)]);
}

/**
 *
 * @param {AST.VariableDeclaration | AST.Expression | null} init
 * @param {AST.Expression} test
 * @param {AST.Expression} update
 * @param {AST.Statement} body
 * @returns {AST.ForStatement}
 */
function for_builder(init, test, update, body) {
	return { type: 'ForStatement', init, test, update, body };
}

/**
 *
 * @param {'constructor' | 'method' | 'get' | 'set'} kind
 * @param {AST.Expression | AST.PrivateIdentifier} key
 * @param {AST.BindingPattern[]} params
 * @param {AST.Statement[]} body
 * @param {boolean} computed
 * @param {boolean} is_static
 * @returns {AST.MethodDefinition}
 */
export function method(kind, key, params, body, computed = false, is_static = false) {
	return {
		type: 'MethodDefinition',
		key,
		kind,
		value: function_builder(null, params, block(body)),
		computed,
		static: is_static,
		decorators: [],
		override: false,
		optional: false,
		accessibility: null
	};
}

/**
 * 
 * @param {Array<AST.BindingPatternKind>} params
 * @param {AST.FormalParameterKind} kind
 * @returns {AST.FormalParameters}
 */
function parameters(params, kind = 'FormalParameter') {
	return {
		type: 'FormalParameters',
		kind,
		items: params.map((p) => ({
			type: 'FormalParameter',
			pattern: {
				...p,
				typeAnnotation: null,
				optional: false,
			},
			decorators: [],
			accessibility: null,
			readonly: false,
			override: false
		}))
	};
}

/**
 *
 * @param {AST.IdentifierReference | null} id
 * @param {Array<AST.BindingPatternKind>} params
 * @param {AST.BlockStatement} body
 * @returns {AST.Function}
 */
function function_builder(id, params, body) {
	return {
		type: 'FunctionExpression',
		id,
		params: parameters(params),
		body: {
			type: 'FunctionBody',
			directives: [],
			statements: body.body
		},
		generator: false,
		async: false,
		declare: false,
		typeParameters: null,
		returnType: null,
		thisParam: null
	};
}

/**
 * @param {AST.Expression} test
 * @param {AST.Statement} consequent
 * @param {AST.Statement} alternate
 * @returns {AST.IfStatement}
 */
function if_builder(test, consequent, alternate) {
	return { type: 'IfStatement', test, consequent, alternate };
}

/**
 * @param {string} as
 * @param {string} source
 * @returns {AST.ImportDeclaration}
 */
export function import_all(as, source) {
	return {
		type: 'ImportDeclaration',
		source: {
			type: 'StringLiteral',
			value: source
		},
		specifiers: [import_namespace(as)],
		withClause: null,
		importKind: 'value'
	};
}

/**
 * @param {Array<[string, string]>} parts
 * @param {string} source
 * @returns {AST.ImportDeclaration}
 */
export function imports(parts, source) {
	return {
		type: 'ImportDeclaration',
		source: {
			type: 'StringLiteral',
			value: source
		},
		specifiers: parts.map((p) => ({
			type: 'ImportSpecifier',
			imported: id(p[0]),
			local: id(p[1]),
			importKind: 'value'
		})),
		withClause: null,
		importKind: 'value'
	};
}

/**
 * @param {AST.Expression | null} argument
 * @returns {AST.ReturnStatement}
 */
function return_builder(argument = null) {
	return { type: 'ReturnStatement', argument };
}

/**
 * @param {string} str
 * @returns {AST.ThrowStatement}
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
 * @returns {AST.Expression}
 */
export function key(name) {
	return regex_is_valid_identifier.test(name) ? id(name) : literal(name);
}
