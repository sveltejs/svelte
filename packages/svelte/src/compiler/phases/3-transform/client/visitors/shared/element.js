/** @import { Expression, Identifier, ObjectExpression } from 'estree' */
/** @import { AST, ExpressionMetadata } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { escape_html } from '../../../../../../escaping.js';
import { normalize_attribute } from '../../../../../../utils.js';
import { is_ignored } from '../../../../../state.js';
import { is_event_attribute } from '../../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { build_class_directives_object, build_style_directives_object } from '../RegularElement.js';
import { build_expression, build_template_chunk, Memoizer } from './utils.js';

/**
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {AST.ClassDirective[]} class_directives
 * @param {AST.StyleDirective[]} style_directives
 * @param {ComponentContext} context
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Identifier} element_id
 * @param {boolean} [should_remove_defaults]
 */
export function build_attribute_effect(
	attributes,
	class_directives,
	style_directives,
	context,
	element,
	element_id,
	should_remove_defaults = false
) {
	/** @type {ObjectExpression['properties']} */
	const values = [];

	const memoizer = new Memoizer();

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const { value } = build_attribute_value(attribute.value, context, (value, metadata) =>
				metadata.has_call || metadata.has_await ? memoizer.add(value, metadata.has_await) : value
			);

			if (
				is_event_attribute(attribute) &&
				(value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression')
			) {
				// Give the event handler a stable ID so it isn't removed and readded on every update
				const id = context.state.scope.generate('event_handler');
				context.state.init.push(b.var(id, value));
				values.push(b.init(attribute.name, b.id(id)));
			} else {
				values.push(b.init(attribute.name, value));
			}
		} else {
			let value = /** @type {Expression} */ (context.visit(attribute));

			if (attribute.metadata.expression.has_call || attribute.metadata.expression.has_await) {
				value = memoizer.add(value, attribute.metadata.expression.has_await);
			}

			values.push(b.spread(value));
		}
	}

	if (class_directives.length) {
		values.push(
			b.prop(
				'init',
				b.array([b.id('$.CLASS')]),
				build_class_directives_object(class_directives, context, memoizer)
			)
		);
	}

	if (style_directives.length) {
		values.push(
			b.prop(
				'init',
				b.array([b.id('$.STYLE')]),
				build_style_directives_object(style_directives, context, memoizer)
			)
		);
	}

	const ids = memoizer.apply();

	context.state.init.push(
		b.stmt(
			b.call(
				'$.attribute_effect',
				element_id,
				b.arrow(ids, b.object(values)),
				memoizer.sync_values(),
				memoizer.async_values(),
				element.metadata.scoped &&
					context.state.analysis.css.hash !== '' &&
					b.literal(context.state.analysis.css.hash),
				should_remove_defaults && b.true,
				is_ignored(element, 'hydration_attribute_changed') && b.true
			)
		)
	);
}

/**
 * @param {AST.Attribute['value']} value
 * @param {ComponentContext} context
 * @param {(value: Expression, metadata: ExpressionMetadata) => Expression} memoize
 * @returns {{ value: Expression, has_state: boolean }}
 */
export function build_attribute_value(value, context, memoize = (value) => value) {
	if (value === true) {
		return { value: b.true, has_state: false };
	}

	if (!Array.isArray(value) || value.length === 1) {
		const chunk = Array.isArray(value) ? value[0] : value;

		if (chunk.type === 'Text') {
			return { value: b.literal(chunk.data), has_state: false };
		}

		let expression = build_expression(context, chunk.expression, chunk.metadata.expression);

		return {
			value: memoize(expression, chunk.metadata.expression),
			has_state: chunk.metadata.expression.has_state || chunk.metadata.expression.has_await
		};
	}

	return build_template_chunk(value, context, context.state, memoize);
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {AST.Attribute} attribute
 */
export function get_attribute_name(element, attribute) {
	if (!element.metadata.svg && !element.metadata.mathml) {
		return normalize_attribute(attribute.name);
	}

	return attribute.name;
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Identifier} node_id
 * @param {AST.Attribute} attribute
 * @param {AST.ClassDirective[]} class_directives
 * @param {ComponentContext} context
 * @param {boolean} is_html
 */
export function build_set_class(element, node_id, attribute, class_directives, context, is_html) {
	let { value, has_state } = build_attribute_value(attribute.value, context, (value, metadata) => {
		if (attribute.metadata.needs_clsx) {
			value = b.call('$.clsx', value);
		}

		return metadata.has_call || metadata.has_await
			? context.state.memoizer.add(value, metadata.has_await)
			: value;
	});

	/** @type {Identifier | undefined} */
	let previous_id;

	/** @type {ObjectExpression | Identifier | undefined} */
	let prev;

	/** @type {ObjectExpression | Identifier | undefined} */
	let next;

	if (class_directives.length) {
		next = build_class_directives_object(class_directives, context);
		has_state ||= class_directives.some(
			(d) => d.metadata.expression.has_state || d.metadata.expression.has_await
		);

		if (has_state) {
			previous_id = b.id(context.state.scope.generate('classes'));
			context.state.init.push(b.declaration('let', [b.declarator(previous_id)]));
			prev = previous_id;
		} else {
			prev = b.object([]);
		}
	}

	/** @type {Expression | undefined} */
	let css_hash;

	if (element.metadata.scoped && context.state.analysis.css.hash) {
		if (value.type === 'Literal' && (value.value === '' || value.value === null)) {
			value = b.literal(context.state.analysis.css.hash);
		} else if (value.type === 'Literal' && typeof value.value === 'string') {
			value = b.literal(escape_html(value.value, true) + ' ' + context.state.analysis.css.hash);
		} else {
			css_hash = b.literal(context.state.analysis.css.hash);
		}
	}

	if (!css_hash && next) {
		css_hash = b.null;
	}

	/** @type {Expression} */
	let set_class = b.call(
		'$.set_class',
		node_id,
		is_html ? b.literal(1) : b.literal(0),
		value,
		css_hash,
		prev,
		next
	);

	if (previous_id) {
		set_class = b.assignment('=', previous_id, set_class);
	}

	(has_state ? context.state.update : context.state.init).push(b.stmt(set_class));
}

/**
 * @param {Identifier} node_id
 * @param {AST.Attribute} attribute
 * @param {AST.StyleDirective[]} style_directives
 * @param {ComponentContext} context
 */
export function build_set_style(node_id, attribute, style_directives, context) {
	let { value, has_state } = build_attribute_value(attribute.value, context, (value, metadata) =>
		metadata.has_call ? context.state.memoizer.add(value, metadata.has_await) : value
	);

	/** @type {Identifier | undefined} */
	let previous_id;

	/** @type {ObjectExpression | Identifier | undefined} */
	let prev;

	/** @type {Expression | undefined} */
	let next;

	if (style_directives.length) {
		next = build_style_directives_object(style_directives, context);
		has_state ||= style_directives.some(
			(d) => d.metadata.expression.has_state || d.metadata.expression.has_await
		);

		if (has_state) {
			previous_id = b.id(context.state.scope.generate('styles'));
			context.state.init.push(b.declaration('let', [b.declarator(previous_id)]));
			prev = previous_id;
		} else {
			prev = b.object([]);
		}
	}

	/** @type {Expression} */
	let set_style = b.call('$.set_style', node_id, value, prev, next);

	if (previous_id) {
		set_style = b.assignment('=', previous_id, set_style);
	}

	(has_state ? context.state.update : context.state.init).push(b.stmt(set_style));
}
