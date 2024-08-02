/** @import { BlockStatement, Expression, ExpressionStatement, Identifier, Literal, MemberExpression, ObjectExpression, Statement } from 'estree' */
/** @import { Attribute, ClassDirective, SpreadAttribute, StyleDirective, SvelteElement } from '#compiler' */
/** @import { SourceLocation } from '#shared' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
/** @import { Scope } from '../../../scope' */
import { dev, locator } from '../../../../state.js';
import {
	get_attribute_expression,
	is_event_attribute,
	is_text_attribute
} from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { determine_namespace_for_children } from '../../utils.js';
import {
	build_attribute_value,
	build_class_directives,
	build_style_directives
} from './shared/element.js';
import { build_render_statement, build_update } from './shared/utils.js';

/**
 * @param {SvelteElement} node
 * @param {ComponentContext} context
 */
export function SvelteElement(node, context) {
	context.state.template.push(`<!>`);

	/** @type {Array<Attribute | SpreadAttribute>} */
	const attributes = [];

	/** @type {Attribute['value'] | undefined} */
	let dynamic_namespace = undefined;

	/** @type {ClassDirective[]} */
	const class_directives = [];

	/** @type {StyleDirective[]} */
	const style_directives = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	// Create a temporary context which picks up the init/update statements.
	// They'll then be added to the function parameter of $.element
	const element_id = b.id(context.state.scope.generate('$$element'));

	/** @type {ComponentContext} */
	const inner_context = {
		...context,
		state: {
			...context.state,
			node: element_id,
			before_init: [],
			init: [],
			update: [],
			after_update: []
		}
	};

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'xmlns' && !is_text_attribute(attribute)) {
				dynamic_namespace = attribute.value;
			}
			attributes.push(attribute);
		} else if (attribute.type === 'SpreadAttribute') {
			attributes.push(attribute);
		} else if (attribute.type === 'ClassDirective') {
			class_directives.push(attribute);
		} else if (attribute.type === 'StyleDirective') {
			style_directives.push(attribute);
		} else if (attribute.type === 'LetDirective') {
			lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
		} else {
			context.visit(attribute, inner_context.state);
		}
	}

	// Let bindings first, they can be used on attributes
	context.state.init.push(...lets); // create computeds in the outer context; the dynamic element is the single child of this slot

	// Then do attributes
	// Always use spread because we don't know whether the element is a custom element or not,
	// therefore we need to do the "how to set an attribute" logic at runtime.
	const is_attributes_reactive =
		build_dynamic_element_attributes(attributes, inner_context, element_id) !== null;

	// class/style directives must be applied last since they could override class/style attributes
	build_class_directives(class_directives, element_id, inner_context, is_attributes_reactive);
	build_style_directives(style_directives, element_id, inner_context, is_attributes_reactive, true);

	const get_tag = b.thunk(/** @type {Expression} */ (context.visit(node.tag)));

	if (dev && context.state.metadata.namespace !== 'foreign') {
		if (node.fragment.nodes.length > 0) {
			context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', get_tag)));
		}
		context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', get_tag)));
	}

	/** @type {Statement[]} */
	const inner = inner_context.state.init;
	if (inner_context.state.update.length > 0) {
		inner.push(build_render_statement(inner_context.state.update));
	}
	inner.push(...inner_context.state.after_update);
	inner.push(
		.../** @type {BlockStatement} */ (
			context.visit(node.fragment, {
				...context.state,
				metadata: {
					...context.state.metadata,
					namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
				}
			})
		).body
	);

	const location = dev && locator(node.start);

	context.state.init.push(
		b.stmt(
			b.call(
				'$.element',
				context.state.node,
				get_tag,
				node.metadata.svg || node.metadata.mathml ? b.true : b.false,
				inner.length > 0 && b.arrow([element_id, b.id('$$anchor')], b.block(inner)),
				dynamic_namespace && b.thunk(build_attribute_value(dynamic_namespace, context).value),
				location && b.array([b.literal(location.line), b.literal(location.column)])
			)
		)
	);
}

/**
 * Serializes dynamic element attribute assignments.
 * Returns the `true` if spread is deemed reactive.
 * @param {Array<Attribute | SpreadAttribute>} attributes
 * @param {ComponentContext} context
 * @param {Identifier} element_id
 * @returns {boolean}
 */
function build_dynamic_element_attributes(attributes, context, element_id) {
	if (attributes.length === 0) {
		if (context.state.analysis.css.hash) {
			context.state.init.push(
				b.stmt(b.call('$.set_class', element_id, b.literal(context.state.analysis.css.hash)))
			);
		}
		return false;
	}

	// TODO why are we always treating this as a spread? needs docs, if that's not an error

	let needs_isolation = false;
	let is_reactive = false;

	/** @type {ObjectExpression['properties']} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const { value } = build_attribute_value(attribute.value, context);

			if (
				is_event_attribute(attribute) &&
				(get_attribute_expression(attribute).type === 'ArrowFunctionExpression' ||
					get_attribute_expression(attribute).type === 'FunctionExpression')
			) {
				// Give the event handler a stable ID so it isn't removed and readded on every update
				const id = context.state.scope.generate('event_handler');
				context.state.init.push(b.var(id, value));
				values.push(b.init(attribute.name, b.id(id)));
			} else {
				values.push(b.init(attribute.name, value));
			}
		} else {
			values.push(b.spread(/** @type {Expression} */ (context.visit(attribute))));
		}

		is_reactive ||=
			attribute.metadata.expression.has_state ||
			// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
			attribute.type === 'SpreadAttribute';
		needs_isolation ||=
			attribute.type === 'SpreadAttribute' && attribute.metadata.expression.has_call;
	}

	if (needs_isolation || is_reactive) {
		const id = context.state.scope.generate('attributes');
		context.state.init.push(b.let(id));

		const update = b.stmt(
			b.assignment(
				'=',
				b.id(id),
				b.call(
					'$.set_dynamic_element_attributes',
					element_id,
					b.id(id),
					b.object(values),
					b.literal(context.state.analysis.css.hash)
				)
			)
		);

		if (needs_isolation) {
			context.state.init.push(build_update(update));
			return false;
		}

		context.state.update.push(update);
		return true;
	}

	context.state.init.push(
		b.stmt(
			b.call(
				'$.set_dynamic_element_attributes',
				element_id,
				b.literal(null),
				b.object(values),
				b.literal(context.state.analysis.css.hash)
			)
		)
	);
	return false;
}
