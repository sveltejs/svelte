import { string_literal } from '../../../utils/stringify.js';
import { x } from 'code-red';
import { regex_double_quotes } from '../../../../utils/patterns.js';

/**
 * @param {import('../../../nodes/Attribute.js').default} attribute
 * @returns {import('estree').Expression}
 */
export function get_class_attribute_value(attribute) {
	// handle special case — `class={possiblyUndefined}` with scoped CSS
	if (
		attribute.chunks.length === 2 &&
		/** @type {import('../../../nodes/Text.js').default} */ (attribute.chunks[1]).synthetic
	) {
		const value = /** @type {import('../../../nodes/shared/Expression.js').default} */ (
			attribute.chunks[0]
		).node;
		return x`@escape(@null_to_empty(${value}), true) + "${
			/** @type {import('../../../nodes/Text.js').default} */ (attribute.chunks[1]).data
		}"`;
	}
	return get_attribute_value(attribute);
}

/**
 * @param {import('../../../nodes/Attribute.js').default} attribute
 * @returns {import('estree').Expression}
 */
export function get_attribute_value(attribute) {
	if (attribute.chunks.length === 0) return x`""`;
	/**
	 * For value attribute of textarea, it will render as child node of `<textarea>` element.
	 * Therefore, we need to escape as content (not attribute).
	 */
	const is_textarea_value =
		attribute.parent.name.toLowerCase() === 'textarea' && attribute.name.toLowerCase() === 'value';
	return attribute.chunks
		.map((chunk) => {
			return chunk.type === 'Text'
				? /** @type {import('estree').Expression} */ (
						string_literal(chunk.data.replace(regex_double_quotes, '&quot;'))
				  )
				: x`@escape(${chunk.node}, ${is_textarea_value ? 'false' : 'true'})`;
		})
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
}

/**
 * @param {import('../../../nodes/Attribute.js').default} attribute
 * @returns {import('estree').Expression}
 */
export function get_attribute_expression(attribute) {
	if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Expression') {
		return /** @type {import('estree').Expression} */ (
			/** @type {import('../../../nodes/shared/Expression.js').default} */ (attribute.chunks[0])
				.node
		);
	}
	return get_attribute_value(attribute);
}
