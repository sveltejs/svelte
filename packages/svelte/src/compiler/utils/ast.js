import { error } from '../errors.js';
import * as b from '../utils/builders.js';

/**
 * Gets the left-most identifier of a member expression or identifier.
 * @param {import('estree').MemberExpression | import('estree').Identifier} expression
 * @returns {import('estree').Identifier | null}
 */
export function object(expression) {
	while (expression.type === 'MemberExpression') {
		expression = /** @type {import('estree').MemberExpression | import('estree').Identifier} */ (
			expression.object
		);
	}

	if (expression.type !== 'Identifier') {
		return null;
	}

	return expression;
}

/**
 * Returns the name of callee if the given expression is a call expression.
 * @param {import('estree').Expression | null | undefined} node
 */
export function get_callee_name(node) {
	if (!node) return null;
	if (node.type !== 'CallExpression') return null;
	if (node.callee.type !== 'Identifier' && node.callee.type !== 'MemberExpression') return null;

	const id = object(node.callee);
	return id === null ? null : id.name;
}

/**
 * Returns true if the attribute contains a single static text node.
 * @param {import('#compiler').Attribute} attribute
 * @returns {attribute is import('#compiler').Attribute & { value: [import('#compiler').Text] }}
 */
export function is_text_attribute(attribute) {
	return (
		attribute.value !== true && attribute.value.length === 1 && attribute.value[0].type === 'Text'
	);
}

/**
 * Returns true if the attribute contains a single expression node.
 * @param {import('#compiler').Attribute} attribute
 * @returns {attribute is import('#compiler').Attribute & { value: [import('#compiler').ExpressionTag] }}
 */
export function is_expression_attribute(attribute) {
	return (
		attribute.value !== true &&
		attribute.value.length === 1 &&
		attribute.value[0].type === 'ExpressionTag'
	);
}

/**
 * Returns true if the attribute starts with `on` and contains a single expression node.
 * @param {import('#compiler').Attribute} attribute
 * @returns {attribute is import('#compiler').Attribute & { value: [import('#compiler').ExpressionTag] }}
 */
export function is_event_attribute(attribute) {
	return is_expression_attribute(attribute) && attribute.name.startsWith('on');
}

/**
 * Extracts all identifiers from a pattern.
 * @param {import('estree').Pattern} param
 * @param {import('estree').Identifier[]} [nodes]
 * @returns {import('estree').Identifier[]}
 */
export function extract_identifiers(param, nodes = []) {
	switch (param.type) {
		case 'Identifier':
			nodes.push(param);
			break;

		case 'ObjectPattern':
			for (const prop of param.properties) {
				if (prop.type === 'RestElement') {
					extract_identifiers(prop.argument, nodes);
				} else {
					extract_identifiers(prop.value, nodes);
				}
			}

			break;

		case 'ArrayPattern':
			for (const element of param.elements) {
				if (element) extract_identifiers(element, nodes);
			}

			break;

		case 'RestElement':
			extract_identifiers(param.argument, nodes);
			break;

		case 'AssignmentPattern':
			extract_identifiers(param.left, nodes);
			break;
	}

	return nodes;
}

/**
 * Extracts all identifiers from an expression.
 * @param {import('estree').Identifier | import('estree').ObjectExpression | import('estree').ArrayExpression} node
 * @param {import('estree').Identifier[]} [nodes]
 * @returns
 */
export function extract_identifiers_from_expression(node, nodes = []) {
	// TODO This isn't complete, but it should be enough for our purposes
	switch (node.type) {
		case 'Identifier':
			nodes.push(node);
			break;

		case 'ObjectExpression':
			for (const prop of node.properties) {
				if (prop.type === 'Property') {
					extract_identifiers_from_expression(/** @type {any} */ (prop.value), nodes);
				} else {
					extract_identifiers_from_expression(/** @type {any} */ (prop.argument), nodes);
				}
			}

			break;

		case 'ArrayExpression':
			for (const element of node.elements) {
				if (element) extract_identifiers_from_expression(/** @type {any} */ (element), nodes);
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
 * @property {import('estree').Identifier | import('estree').MemberExpression} node The node the destructuring path end in. Can be a member expression only for assignment expressions
 * @property {boolean} is_rest `true` if this is a `...rest` destructuring
 * @property {(expression: import('estree').Expression) => import('estree').Identifier | import('estree').MemberExpression | import('estree').CallExpression} expression Returns an expression which walks the path starting at the given expression.
 * This will be a call expression if a rest element or default is involved —
 * e.g. `const { foo: { bar: baz = 42 }, ...rest } = quux` —
 * since we can't represent `baz` or `rest` purely as a path
 * @property {(expression: import('estree').Expression) => import('estree').Identifier | import('estree').MemberExpression | import('estree').CallExpression} update_expression Like `expression` but without default values.
 */

/**
 * Extracts all destructured assignments from a pattern.
 * @param {import('estree').Node} param
 * @returns {DestructuredAssignment[]}
 */
export function extract_paths(param) {
	return _extract_paths(
		[],
		param,
		(node) => /** @type {import('estree').Identifier | import('estree').MemberExpression} */ (node),
		(node) => /** @type {import('estree').Identifier | import('estree').MemberExpression} */ (node)
	);
}

/**
 * @param {DestructuredAssignment[]} assignments
 * @param {import('estree').Node} param
 * @param {DestructuredAssignment['expression']} expression
 * @param {DestructuredAssignment['update_expression']} update_expression
 * @returns {DestructuredAssignment[]}
 */
function _extract_paths(assignments = [], param, expression, update_expression) {
	switch (param.type) {
		case 'Identifier':
		case 'MemberExpression':
			assignments.push({
				node: param,
				is_rest: false,
				expression,
				update_expression
			});
			break;

		case 'ObjectPattern':
			for (const prop of param.properties) {
				if (prop.type === 'RestElement') {
					/** @type {DestructuredAssignment['expression']} */
					const rest_expression = (object) => {
						/** @type {import('estree').Expression[]} */
						const props = [];
						for (const p of param.properties) {
							if (p.type === 'Property' && p.key.type !== 'PrivateIdentifier') {
								if (p.key.type === 'Identifier' && !p.computed) {
									props.push(b.literal(p.key.name));
								} else {
									props.push(p.key);
								}
							}
						}
						return b.call('$.exclude_from_object', expression(object), b.array(props));
					};

					if (prop.argument.type === 'Identifier') {
						assignments.push({
							node: prop.argument,
							is_rest: true,
							expression: rest_expression,
							update_expression: rest_expression
						});
					} else {
						_extract_paths(assignments, prop.argument, rest_expression, rest_expression);
					}
				} else {
					/** @type {DestructuredAssignment['expression']} */
					const object_expression = (object) =>
						b.member(expression(object), prop.key, prop.computed || prop.key.type !== 'Identifier');
					_extract_paths(assignments, prop.value, object_expression, object_expression);
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
							b.call(b.member(expression(object), b.id('slice')), b.literal(i));
						if (element.argument.type === 'Identifier') {
							assignments.push({
								node: element.argument,
								is_rest: true,
								expression: rest_expression,
								update_expression: rest_expression
							});
						} else {
							_extract_paths(assignments, element.argument, rest_expression, rest_expression);
						}
					} else {
						/** @type {DestructuredAssignment['expression']} */
						const array_expression = (object) => b.member(expression(object), b.literal(i), true);
						_extract_paths(assignments, element, array_expression, array_expression);
					}
				}
			}

			break;

		case 'AssignmentPattern': {
			/** @type {DestructuredAssignment['expression']} */
			const fallback_expression = (object) =>
				b.call('$.value_or_fallback', expression(object), param.right);
			if (param.left.type === 'Identifier') {
				assignments.push({
					node: param.left,
					is_rest: false,
					expression: fallback_expression,
					update_expression
				});
			} else {
				_extract_paths(assignments, param.left, fallback_expression, update_expression);
			}

			break;
		}
	}

	return assignments;
}
