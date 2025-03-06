/** @import { BlockStatement, Expression, ExpressionStatement, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev, locator } from '../../../../state.js';
import { is_text_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { determine_namespace_for_children } from '../../utils.js';
import { build_attribute_value, build_set_attributes, build_set_class } from './shared/element.js';
import { build_render_statement, get_expression_id } from './shared/utils.js';

/**
 * @param {AST.SvelteElement} node
 * @param {ComponentContext} context
 */
export function SvelteElement(node, context) {
	context.state.template.push(`<!>`);

	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];

	/** @type {AST.Attribute['value'] | undefined} */
	let dynamic_namespace = undefined;

	/** @type {AST.ClassDirective[]} */
	const class_directives = [];

	/** @type {AST.StyleDirective[]} */
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
			init: [],
			update: [],
			expressions: [],
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
		} else if (attribute.type === 'OnDirective') {
			const handler = /** @type {Expression} */ (context.visit(attribute, inner_context.state));
			inner_context.state.after_update.push(b.stmt(handler));
		} else {
			context.visit(attribute, inner_context.state);
		}
	}

	// Let bindings first, they can be used on attributes
	context.state.init.push(...lets); // create computeds in the outer context; the dynamic element is the single child of this slot

	if (
		attributes.length === 1 &&
		attributes[0].type === 'Attribute' &&
		attributes[0].name.toLowerCase() === 'class' &&
		is_text_attribute(attributes[0])
	) {
		build_set_class(node, element_id, attributes[0], class_directives, inner_context, false);
	} else if (attributes.length) {
		const attributes_id = b.id(context.state.scope.generate('attributes'));

		// Always use spread because we don't know whether the element is a custom element or not,
		// therefore we need to do the "how to set an attribute" logic at runtime.
		build_set_attributes(
			attributes,
			class_directives,
			style_directives,
			inner_context,
			node,
			element_id,
			attributes_id
		);
	}

	const get_tag = b.thunk(/** @type {Expression} */ (context.visit(node.tag)));

	if (dev) {
		if (node.fragment.nodes.length > 0) {
			context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', get_tag)));
		}
		context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', get_tag)));
	}

	/** @type {Statement[]} */
	const inner = inner_context.state.init;
	if (inner_context.state.update.length > 0) {
		inner.push(build_render_statement(inner_context.state));
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
