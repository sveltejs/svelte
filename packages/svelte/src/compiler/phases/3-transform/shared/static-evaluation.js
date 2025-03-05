/** @import { Node, BinaryExpression, LogicalExpression, UnaryExpression, Expression, SequenceExpression, TemplateLiteral, ConditionalExpression } from 'estree' */
/** @import { ComponentClientTransformState } from '../client/types' */
/** @import { ComponentServerTransformState } from '../server/types' */
export const DYNAMIC = Symbol('DYNAMIC');

/**
 * @template {boolean} S
 * @param {Node} node
 * @param {S extends true ? ComponentServerTransformState : ComponentClientTransformState} state
 * @param {S} [server=false]
 * @returns {any}
 */
export function evaluate_static_expression(node, state, server) {
	/**
	 * @template {boolean} S
	 * @param {Node} node
	 * @param {S extends true ? ComponentServerTransformState : ComponentClientTransformState} state
	 * @param {S} [server]
	 * @returns {any}
	 */
	function internal(node, state, server) {
		if (node == undefined) return DYNAMIC;
		/**
		 * @param {BinaryExpression | LogicalExpression} node
		 */
		function handle_left_right(node) {
			const left = internal(node?.left, state, server);
			const right = internal(node?.right, state, server);
			if (left === DYNAMIC || right === DYNAMIC) {
				return DYNAMIC;
			}
			switch (node.operator) {
				case '+':
					return left + right;
				case '-':
					return left - right;
				case '&':
					return left & right;
				case '|':
					return left | right;
				case '<<':
					return left << right;
				case '>>':
					return left >> right;
				case '>':
					return left > right;
				case '<':
					return left < right;
				case '>=':
					return left >= right;
				case '<=':
					return left <= right;
				case '==':
					return left == right;
				case '===':
					return left === right;
				case '||':
					return left || right;
				case '??':
					return left ?? right;
				case '&&':
					return left && right;
				case '%':
					return left % right;
				case '>>>':
					return left >>> right;
				case '^':
					return left ^ right;
				case '**':
					return left ** right;
				case '*':
					return left * right;
				case '/':
					return left / right;
				case '!=':
					return left != right;
				case '!==':
					return left !== right;
				default:
					return DYNAMIC;
			}
		}
		/**
		 * @param {UnaryExpression} node
		 */
		function handle_unary(node) {
			const argument = internal(node?.argument, state, server);
			if (argument === DYNAMIC) return DYNAMIC;
			/**
			 * @param {Expression} argument
			 */
			function handle_void(argument) {
				//@ts-ignore
				const evaluated = internal(argument, state, server);
				if (evaluated !== DYNAMIC) {
					return undefined;
				}
				return DYNAMIC;
			}
			switch (node.operator) {
				case '!':
					return !argument;
				case '-':
					return -argument;
				case 'typeof':
					return typeof argument;
				case '~':
					return ~argument;
				case '+':
					return +argument;
				case 'void':
					return handle_void(argument);
				default:
					// `delete` is ignored, since it may have side effects
					return DYNAMIC;
			}
		}
		/**
		 * @param {SequenceExpression} node
		 */
		function handle_sequence(node) {
			const is_static = node.expressions.reduce(
				(a, b) => a && internal(b, state, server) !== DYNAMIC,
				true
			);
			if (is_static) {
				//@ts-ignore
				return internal(node.expressions.at(-1), state, server);
			}
			return DYNAMIC;
		}
		/**
		 * @param {string} name
		 */
		function handle_ident(name) {
			if (server) return DYNAMIC;
			const scope = state.scope.get(name);
			if (scope?.kind === 'normal' && scope?.declaration_kind !== 'import') {
				if (scope.initial && !scope.mutated && !scope.reassigned && !scope.updated) {
					//@ts-ignore
					let evaluated = internal(scope.initial, state);
					return evaluated;
				}
			}
			return DYNAMIC;
		}
		/**
		 * @param {TemplateLiteral} node
		 */
		function handle_template(node) {
			const expressions = node.expressions;
			const quasis = node.quasis;
			const is_static = expressions.reduce(
				(a, b) => a && internal(b, state, server) !== DYNAMIC,
				true
			);
			if (is_static) {
				let res = '';
				let last_was_quasi = false;
				let expr_index = 0;
				let quasi_index = 0;
				for (let index = 0; index < quasis.length + expressions.length; index++) {
					if (last_was_quasi) {
						res += internal(expressions[expr_index++], state, server);
						last_was_quasi = false;
					} else {
						res += quasis[quasi_index++].value.cooked;
						last_was_quasi = true;
					}
				}
				return res;
			}
			return DYNAMIC;
		}
		/**
		 * @param {ConditionalExpression} node
		 */
		function handle_ternary(node) {
			const test = internal(node.test, state, server);
			if (test !== DYNAMIC) {
				if (test) {
					return internal(node.consequent, state, server);
				} else {
					return internal(node.alternate, state, server);
				}
			}
			return DYNAMIC;
		}
		switch (node.type) {
			case 'Literal':
				return node.value;
			case 'BinaryExpression':
				return handle_left_right(node);
			case 'LogicalExpression':
				return handle_left_right(node);
			case 'UnaryExpression':
				return handle_unary(node);
			case 'Identifier':
				return handle_ident(node.name);
			case 'SequenceExpression':
				return handle_sequence(node);
			case 'TemplateLiteral':
				return handle_template(node);
			case 'ConditionalExpression':
				return handle_ternary(node);
			default:
				return DYNAMIC;
		}
	}
	try {
		return internal(node, state, server ?? false);
	} catch (err) {
		// if the expression is so nested it causes a call stack overflow, then it's probably not static
		// this probably won't ever happen, but just in case...
		if (err instanceof RangeError && err.message === 'Maximum call stack size exceeded') {
			return DYNAMIC;
		} else if (
			//@ts-expect-error firefox has a non-standard recursion error
			typeof globalThis['InternalError'] === 'function' &&
			//@ts-expect-error
			err instanceof globalThis['InternalError'] &&
			//@ts-ignore
			err.message === 'too much recursion'
		) {
			return DYNAMIC;
		} else {
			throw err;
		}
	}
}
