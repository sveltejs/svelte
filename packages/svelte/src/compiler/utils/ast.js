/** @import { AST } from '#compiler' */
/** @import * as ESTree from 'estree' */
import { walk } from 'zimmerframe';
import * as b from '../utils/builders.js';

/**
 * Gets the left-most identifier of a member expression or identifier.
 * @param {ESTree.MemberExpression | ESTree.Identifier} expression
 * @returns {ESTree.Identifier | null}
 */
export function object(expression) {
	while (expression.type === 'MemberExpression') {
		expression = /** @type {ESTree.MemberExpression | ESTree.Identifier} */ (expression.object);
	}

	if (expression.type !== 'Identifier') {
		return null;
	}

	return expression;
}

/**
 * Returns true if the attribute contains a single static text node.
 * @param {AST.Attribute} attribute
 * @returns {attribute is AST.Attribute & { value: [AST.Text] }}
 */
export function is_text_attribute(attribute) {
	return (
		Array.isArray(attribute.value) &&
		attribute.value.length === 1 &&
		attribute.value[0].type === 'Text'
	);
}

/**
 * Returns true if the attribute contains a single expression node.
 * In Svelte 5, this also includes a single expression node wrapped in an array.
 * TODO change that in a future version
 * @param {AST.Attribute} attribute
 * @returns {attribute is AST.Attribute & { value: [AST.ExpressionTag] | AST.ExpressionTag }}
 */
export function is_expression_attribute(attribute) {
	return (
		(attribute.value !== true && !Array.isArray(attribute.value)) ||
		(Array.isArray(attribute.value) &&
			attribute.value.length === 1 &&
			attribute.value[0].type === 'ExpressionTag')
	);
}

/**
 * Returns the single attribute expression node.
 * In Svelte 5, this also includes a single expression node wrapped in an array.
 * TODO change that in a future version
 * @param { AST.Attribute & { value: [AST.ExpressionTag] | AST.ExpressionTag }} attribute
 * @returns {ESTree.Expression}
 */
export function get_attribute_expression(attribute) {
	return Array.isArray(attribute.value)
		? /** @type {AST.ExpressionTag} */ (attribute.value[0]).expression
		: attribute.value.expression;
}

/**
 * Returns the expression chunks of an attribute value
 * @param {AST.Attribute['value']} value
 * @returns {Array<AST.Text | AST.ExpressionTag>}
 */
export function get_attribute_chunks(value) {
	return Array.isArray(value) ? value : typeof value === 'boolean' ? [] : [value];
}

/**
 * Returns true if the attribute starts with `on` and contains a single expression node.
 * @param {AST.Attribute} attribute
 * @returns {attribute is AST.Attribute & { value: [AST.ExpressionTag] | AST.ExpressionTag }}
 */
export function is_event_attribute(attribute) {
	return is_expression_attribute(attribute) && attribute.name.startsWith('on');
}

/**
 * Extracts all identifiers and member expressions from a pattern.
 * @param {ESTree.Pattern} pattern
 * @param {Array<ESTree.Identifier | ESTree.MemberExpression>} [nodes]
 * @returns {Array<ESTree.Identifier | ESTree.MemberExpression>}
 */
export function unwrap_pattern(pattern, nodes = []) {
	switch (pattern.type) {
		case 'Identifier':
			nodes.push(pattern);
			break;

		case 'MemberExpression':
			// member expressions can be part of an assignment pattern, but not a binding pattern
			// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#binding_and_assignment
			nodes.push(pattern);
			break;

		case 'ObjectPattern':
			for (const prop of pattern.properties) {
				if (prop.type === 'RestElement') {
					unwrap_pattern(prop.argument, nodes);
				} else {
					unwrap_pattern(prop.value, nodes);
				}
			}

			break;

		case 'ArrayPattern':
			for (const element of pattern.elements) {
				if (element) unwrap_pattern(element, nodes);
			}

			break;

		case 'RestElement':
			unwrap_pattern(pattern.argument, nodes);
			break;

		case 'AssignmentPattern':
			unwrap_pattern(pattern.left, nodes);
			break;
	}

	return nodes;
}

/**
 * Extracts all identifiers from a pattern.
 * @param {ESTree.Pattern} pattern
 * @returns {ESTree.Identifier[]}
 */
export function extract_identifiers(pattern) {
	return unwrap_pattern(pattern, []).filter((node) => node.type === 'Identifier');
}

/**
 * Extracts all identifiers and a stringified keypath from an expression.
 * TODO replace this with `expression.dependencies`
 * @param {ESTree.Expression} expr
 * @returns {[keypath: string, ids: ESTree.Identifier[]]}
 */
export function extract_all_identifiers_from_expression(expr) {
	/** @type {ESTree.Identifier[]} */
	let nodes = [];
	/** @type {string[]} */
	let keypath = [];

	walk(
		expr,
		{},
		{
			Identifier(node, { path }) {
				const parent = path.at(-1);
				if (parent?.type !== 'MemberExpression' || parent.property !== node || parent.computed) {
					nodes.push(node);
				}

				if (parent?.type === 'MemberExpression' && parent.computed && parent.property === node) {
					keypath.push(`[${node.name}]`);
				} else {
					keypath.push(node.name);
				}
			},
			Literal(node, { path }) {
				const value = typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
				const parent = path.at(-1);
				if (parent?.type === 'MemberExpression' && parent.computed && parent.property === node) {
					keypath.push(`[${value}]`);
				} else {
					keypath.push(value);
				}
			},
			ThisExpression(_, { next }) {
				keypath.push('this');
				next();
			}
		}
	);

	return [keypath.join('.'), nodes];
}

/**
 * Extracts all leaf identifiers from a destructuring expression.
 * @param {ESTree.Identifier | ESTree.ObjectExpression | ESTree.ArrayExpression} node
 * @param {ESTree.Identifier[]} [nodes]
 * @returns
 */
export function extract_identifiers_from_destructuring(node, nodes = []) {
	// TODO This isn't complete, but it should be enough for our purposes
	switch (node.type) {
		case 'Identifier':
			nodes.push(node);
			break;

		case 'ObjectExpression':
			for (const prop of node.properties) {
				if (prop.type === 'Property') {
					extract_identifiers_from_destructuring(/** @type {any} */ (prop.value), nodes);
				} else {
					extract_identifiers_from_destructuring(/** @type {any} */ (prop.argument), nodes);
				}
			}

			break;

		case 'ArrayExpression':
			for (const element of node.elements) {
				if (element) extract_identifiers_from_destructuring(/** @type {any} */ (element), nodes);
			}

			break;
	}

	return nodes;
}

/**
 * Represents the path of a destructured assignment from either a declaration
 * or assignment expression. For example, given `const { foo: { bar: baz } } = quux`,
 * the path of `baz` is `foo.bar`
 * @typedef {Object} DestructuredAssignment
 * @property {ESTree.Identifier | ESTree.MemberExpression} node The node the destructuring path end in. Can be a member expression only for assignment expressions
 * @property {boolean} is_rest `true` if this is a `...rest` destructuring
 * @property {boolean} has_default_value `true` if this has a fallback value like `const { foo = 'bar } = ..`
 * @property {(expression: ESTree.Expression) => ESTree.Identifier | ESTree.MemberExpression | ESTree.CallExpression | ESTree.AwaitExpression} expression Returns an expression which walks the path starting at the given expression.
 * This will be a call expression if a rest element or default is involved — e.g. `const { foo: { bar: baz = 42 }, ...rest } = quux` — since we can't represent `baz` or `rest` purely as a path
 * Will be an await expression in case of an async default value (`const { foo = await bar } = ...`)
 * @property {(expression: ESTree.Expression) => ESTree.Identifier | ESTree.MemberExpression | ESTree.CallExpression | ESTree.AwaitExpression} update_expression Like `expression` but without default values.
 */

/**
 * Extracts all destructured assignments from a pattern.
 * @param {ESTree.Node} param
 * @returns {DestructuredAssignment[]}
 */
export function extract_paths(param) {
	return _extract_paths(
		[],
		param,
		(node) => /** @type {ESTree.Identifier | ESTree.MemberExpression} */ (node),
		(node) => /** @type {ESTree.Identifier | ESTree.MemberExpression} */ (node),
		false
	);
}

/**
 * @param {DestructuredAssignment[]} assignments
 * @param {ESTree.Node} param
 * @param {DestructuredAssignment['expression']} expression
 * @param {DestructuredAssignment['update_expression']} update_expression
 * @param {boolean} has_default_value
 * @returns {DestructuredAssignment[]}
 */
function _extract_paths(assignments = [], param, expression, update_expression, has_default_value) {
	switch (param.type) {
		case 'Identifier':
		case 'MemberExpression':
			assignments.push({
				node: param,
				is_rest: false,
				has_default_value,
				expression,
				update_expression
			});
			break;

		case 'ObjectPattern':
			for (const prop of param.properties) {
				if (prop.type === 'RestElement') {
					/** @type {DestructuredAssignment['expression']} */
					const rest_expression = (object) => {
						/** @type {ESTree.Expression[]} */
						const props = [];

						for (const p of param.properties) {
							if (p.type === 'Property' && p.key.type !== 'PrivateIdentifier') {
								if (p.key.type === 'Identifier' && !p.computed) {
									props.push(b.literal(p.key.name));
								} else if (p.key.type === 'Literal') {
									props.push(b.literal(String(p.key.value)));
								} else {
									props.push(b.call('String', p.key));
								}
							}
						}

						return b.call('$.exclude_from_object', expression(object), b.array(props));
					};

					if (prop.argument.type === 'Identifier') {
						assignments.push({
							node: prop.argument,
							is_rest: true,
							has_default_value,
							expression: rest_expression,
							update_expression: rest_expression
						});
					} else {
						_extract_paths(
							assignments,
							prop.argument,
							rest_expression,
							rest_expression,
							has_default_value
						);
					}
				} else {
					/** @type {DestructuredAssignment['expression']} */
					const object_expression = (object) =>
						b.member(expression(object), prop.key, prop.computed || prop.key.type !== 'Identifier');
					_extract_paths(
						assignments,
						prop.value,
						object_expression,
						object_expression,
						has_default_value
					);
				}
			}

			break;

		case 'ArrayPattern':
			for (let i = 0; i < param.elements.length; i += 1) {
				const element = param.elements[i];
				if (element) {
					if (element.type === 'RestElement') {
						/** @type {DestructuredAssignment['expression']} */
						const rest_expression = (object) =>
							b.call(b.member(expression(object), 'slice'), b.literal(i));
						if (element.argument.type === 'Identifier') {
							assignments.push({
								node: element.argument,
								is_rest: true,
								has_default_value,
								expression: rest_expression,
								update_expression: rest_expression
							});
						} else {
							_extract_paths(
								assignments,
								element.argument,
								rest_expression,
								rest_expression,
								has_default_value
							);
						}
					} else {
						/** @type {DestructuredAssignment['expression']} */
						const array_expression = (object) => b.member(expression(object), b.literal(i), true);
						_extract_paths(
							assignments,
							element,
							array_expression,
							array_expression,
							has_default_value
						);
					}
				}
			}

			break;

		case 'AssignmentPattern': {
			/** @type {DestructuredAssignment['expression']} */
			const fallback_expression = (object) => build_fallback(expression(object), param.right);

			if (param.left.type === 'Identifier') {
				assignments.push({
					node: param.left,
					is_rest: false,
					has_default_value: true,
					expression: fallback_expression,
					update_expression
				});
			} else {
				_extract_paths(assignments, param.left, fallback_expression, update_expression, true);
			}

			break;
		}
	}

	return assignments;
}

/**
 * Like `path.at(x)`, but skips over `TSNonNullExpression` and `TSAsExpression` nodes and eases assertions a bit
 * by removing the `| undefined` from the resulting type.
 *
 * @template {AST.SvelteNode} T
 * @param {T[]} path
 * @param {number} at
 */
export function get_parent(path, at) {
	let node = path.at(at);
	// @ts-expect-error
	if (node.type === 'TSNonNullExpression' || node.type === 'TSAsExpression') {
		return /** @type {T} */ (path.at(at < 0 ? at - 1 : at + 1));
	}
	return /** @type {T} */ (node);
}

/**
 * Returns `true` if the expression is an identifier, a literal, a function expression,
 * or a logical expression that only contains simple expressions. Used to determine whether
 * something needs to be treated as though accessing it could have side-effects (i.e.
 * reading signals prematurely)
 * @param {ESTree.Expression} node
 * @returns {boolean}
 */
export function is_simple_expression(node) {
	if (
		node.type === 'Literal' ||
		node.type === 'Identifier' ||
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'FunctionExpression'
	) {
		return true;
	}

	if (node.type === 'ConditionalExpression') {
		return (
			is_simple_expression(node.test) &&
			is_simple_expression(node.consequent) &&
			is_simple_expression(node.alternate)
		);
	}

	if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
		return (
			node.left.type !== 'PrivateIdentifier' &&
			is_simple_expression(node.left) &&
			is_simple_expression(node.right)
		);
	}

	return false;
}

/**
 * @template {ESTree.SimpleCallExpression | ESTree.MemberExpression} T
 * @param {ESTree.ChainExpression & { expression : T } | T} node
 * @returns {T}
 */
export function unwrap_optional(node) {
	return node.type === 'ChainExpression' ? node.expression : node;
}

/**
 * @param {ESTree.Expression | ESTree.Pattern} expression
 * @returns {boolean}
 */
export function is_expression_async(expression) {
	switch (expression.type) {
		case 'AwaitExpression': {
			return true;
		}
		case 'ArrayPattern': {
			return expression.elements.some((element) => element && is_expression_async(element));
		}
		case 'ArrayExpression': {
			return expression.elements.some((element) => {
				if (!element) {
					return false;
				} else if (element.type === 'SpreadElement') {
					return is_expression_async(element.argument);
				} else {
					return is_expression_async(element);
				}
			});
		}
		case 'AssignmentPattern':
		case 'AssignmentExpression':
		case 'BinaryExpression':
		case 'LogicalExpression': {
			return (
				(expression.left.type !== 'PrivateIdentifier' && is_expression_async(expression.left)) ||
				is_expression_async(expression.right)
			);
		}
		case 'CallExpression':
		case 'NewExpression': {
			return (
				(expression.callee.type !== 'Super' && is_expression_async(expression.callee)) ||
				expression.arguments.some((element) => {
					if (element.type === 'SpreadElement') {
						return is_expression_async(element.argument);
					} else {
						return is_expression_async(element);
					}
				})
			);
		}
		case 'ChainExpression': {
			return is_expression_async(expression.expression);
		}
		case 'ConditionalExpression': {
			return (
				is_expression_async(expression.test) ||
				is_expression_async(expression.alternate) ||
				is_expression_async(expression.consequent)
			);
		}
		case 'ImportExpression': {
			return is_expression_async(expression.source);
		}
		case 'MemberExpression': {
			return (
				(expression.object.type !== 'Super' && is_expression_async(expression.object)) ||
				(expression.property.type !== 'PrivateIdentifier' &&
					is_expression_async(expression.property))
			);
		}
		case 'ObjectPattern':
		case 'ObjectExpression': {
			return expression.properties.some((property) => {
				if (property.type === 'SpreadElement') {
					return is_expression_async(property.argument);
				} else if (property.type === 'Property') {
					return (
						(property.key.type !== 'PrivateIdentifier' && is_expression_async(property.key)) ||
						is_expression_async(property.value)
					);
				}
			});
		}
		case 'RestElement': {
			return is_expression_async(expression.argument);
		}
		case 'SequenceExpression':
		case 'TemplateLiteral': {
			return expression.expressions.some((subexpression) => is_expression_async(subexpression));
		}
		case 'TaggedTemplateExpression': {
			return is_expression_async(expression.tag) || is_expression_async(expression.quasi);
		}
		case 'UnaryExpression':
		case 'UpdateExpression': {
			return is_expression_async(expression.argument);
		}
		case 'YieldExpression': {
			return expression.argument ? is_expression_async(expression.argument) : false;
		}
		default:
			return false;
	}
}

/**
 *
 * @param {ESTree.Expression} expression
 * @param {ESTree.Expression} fallback
 */
export function build_fallback(expression, fallback) {
	if (is_simple_expression(fallback)) {
		return b.call('$.fallback', expression, fallback);
	}

	if (fallback.type === 'AwaitExpression' && is_simple_expression(fallback.argument)) {
		return b.await(b.call('$.fallback', expression, fallback.argument));
	}

	return is_expression_async(fallback)
		? b.await(b.call('$.fallback', expression, b.thunk(fallback, true), b.true))
		: b.call('$.fallback', expression, b.thunk(fallback), b.true);
}

/**
 * @param {ESTree.AssignmentOperator} operator
 * @param {ESTree.Identifier | ESTree.MemberExpression} left
 * @param {ESTree.Expression} right
 */
export function build_assignment_value(operator, left, right) {
	return operator === '='
		? right
		: // turn something like x += 1 into x = x + 1
			b.binary(/** @type {ESTree.BinaryOperator} */ (operator.slice(0, -1)), left, right);
}
