/** @import { ArrayExpression, Expression, Identifier, ObjectExpression } from 'estree' */
/** @import { AST, ExpressionMetadata } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { escape_html } from '../../../../../../escaping.js';
import { normalize_attribute } from '../../../../../../utils.js';
import { is_ignored } from '../../../../../state.js';
import { is_event_attribute } from '../../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { build_class_directives_object, build_style_directives_object } from '../RegularElement.js';
import { build_template_chunk, get_expression_id } from './utils.js';

/**
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {AST.ClassDirective[]} class_directives
 * @param {AST.StyleDirective[]} style_directives
 * @param {ComponentContext} context
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Identifier} element_id
 * @param {Identifier} attributes_id
 */
export function build_set_attributes(
	attributes,
	class_directives,
	style_directives,
	context,
	element,
	element_id,
	attributes_id
) {
	let is_dynamic = false;

	/** @type {ObjectExpression['properties']} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const { value, has_state } = build_attribute_value(
				attribute.value,
				context,
				(value, metadata) => (metadata.has_call ? get_expression_id(context.state, value) : value)
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

			is_dynamic ||= has_state;
		} else {
			// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
			is_dynamic = true;

			let value = /** @type {Expression} */ (context.visit(attribute));

			if (attribute.metadata.expression.has_call) {
				value = get_expression_id(context.state, value);
			}

			values.push(b.spread(value));
		}
	}

	if (class_directives.length) {
		values.push(
			b.prop(
				'init',
				b.array([b.id('$.CLASS')]),
				build_class_directives_object(class_directives, context)
			)
		);

		is_dynamic ||=
			class_directives.find((directive) => directive.metadata.expression.has_state) !== null;
	}

	if (style_directives.length) {
		values.push(
			b.prop(
				'init',
				b.array([b.id('$.STYLE')]),
				build_style_directives_object(style_directives, context)
			)
		);

		is_dynamic ||= style_directives.some((directive) => directive.metadata.expression.has_state);
	}

	const call = b.call(
		'$.set_attributes',
		element_id,
		is_dynamic ? attributes_id : b.null,
		b.object(values),
		element.metadata.scoped &&
			context.state.analysis.css.hash !== '' &&
			b.literal(context.state.analysis.css.hash),
		is_ignored(element, 'hydration_attribute_changed') && b.true
	);

	if (is_dynamic) {
		context.state.init.push(b.let(attributes_id));
		const update = b.stmt(b.assignment('=', attributes_id, call));
		context.state.update.push(update);
	} else {
		context.state.init.push(b.stmt(call));
	}
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

		let expression = /** @type {Expression} */ (context.visit(chunk.expression));

		return {
			value: memoize(expression, chunk.metadata.expression),
			has_state: chunk.metadata.expression.has_state
		};
	}

	return build_template_chunk(value, context.visit, context.state, memoize);
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

		return metadata.has_call ? get_expression_id(context.state, value) : value;
	});

	/** @type {Identifier | undefined} */
	let previous_id;

	/** @type {ObjectExpression | Identifier | undefined} */
	let prev;

	/** @type {ObjectExpression | Identifier | undefined} */
	let next;

	if (class_directives.length) {
		next = build_class_directives_object(class_directives, context);
		has_state ||= class_directives.some((d) => d.metadata.expression.has_state);

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
		metadata.has_call ? get_expression_id(context.state, value) : value
	);

	/** @type {Identifier | undefined} */
	let previous_id;

	/** @type {ObjectExpression | Identifier | undefined} */
	let prev;

	/** @type {ArrayExpression | ObjectExpression | undefined} */
	let next;

	if (style_directives.length) {
		next = build_style_directives_object(style_directives, context);
		has_state ||= style_directives.some((d) => d.metadata.expression.has_state);

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
