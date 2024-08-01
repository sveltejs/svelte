/** @import { Expression, Statement, TemplateElement, TemplateLiteral } from 'estree' */
/** @import { ExpressionTag, SvelteNode, Text } from '#compiler' */
/** @import { ComponentClientTransformState } from '../../types' */
import * as b from '../../../../../utils/builders.js';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { create_derived } from '../../utils.js';

/**
 * @param {Array<Text | ExpressionTag>} values
 * @param {(node: SvelteNode, state: any) => any} visit
 * @param {ComponentClientTransformState} state
 * @returns {[boolean, TemplateLiteral]}
 */
export function serialize_template_literal(values, visit, state) {
	/** @type {TemplateElement[]} */
	const quasis = [];

	/** @type {Expression[]} */
	const expressions = [];
	let has_call = false;
	let contains_multiple_call_expression = false;
	quasis.push(b.quasi(''));

	for (let i = 0; i < values.length; i++) {
		const node = values[i];

		if (node.type === 'ExpressionTag' && node.metadata.expression.has_call) {
			if (has_call) {
				contains_multiple_call_expression = true;
			}
			has_call = true;
		}
	}

	for (let i = 0; i < values.length; i++) {
		const node = values[i];

		if (node.type === 'Text') {
			const last = /** @type {TemplateElement} */ (quasis.at(-1));
			last.value.raw += sanitize_template_string(node.data);
		} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
			const last = /** @type {TemplateElement} */ (quasis.at(-1));
			if (node.expression.value != null) {
				last.value.raw += sanitize_template_string(node.expression.value + '');
			}
		} else {
			if (contains_multiple_call_expression) {
				const id = b.id(state.scope.generate('stringified_text'));

				state.init.push(
					b.const(
						id,
						create_derived(
							state,
							b.thunk(/** @type {Expression} */ (visit(node.expression, state)))
						)
					)
				);
				expressions.push(b.call('$.get', id));
			} else {
				expressions.push(b.logical('??', visit(node.expression, state), b.literal('')));
			}
			quasis.push(b.quasi('', i + 1 === values.length));
		}
	}

	// TODO instead of this tuple, return a `{ dynamic, complex, value }` object. will DRY stuff out
	return [has_call, b.template(quasis, expressions)];
}

/**
 * @param {Statement} statement
 */
export function serialize_update(statement) {
	const body =
		statement.type === 'ExpressionStatement' ? statement.expression : b.block([statement]);

	return b.stmt(b.call('$.template_effect', b.thunk(body)));
}

/**
 * @param {Statement[]} update
 */
export function serialize_render_stmt(update) {
	return update.length === 1
		? serialize_update(update[0])
		: b.stmt(b.call('$.template_effect', b.thunk(b.block(update))));
}
