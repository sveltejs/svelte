import {
	get_attribute_value,
	get_class_attribute_value
} from './shared/get_attribute_value';
import { get_slot_scope } from './shared/get_slot_scope';
import { boolean_attributes } from './shared/boolean_attributes';
import Renderer, { RenderOptions } from '../Renderer';
import ElementHandler from './Element';
import { x } from 'code-red';
import Expression from '../../nodes/shared/Expression';
import remove_whitespace_children from './utils/remove_whitespace_children';
import Element from '../../nodes/Element';
import { Expression as ESExpression } from 'estree';

export default function (
	node: Element,
	renderer: Renderer,
	options: RenderOptions & {
		slot_scopes: Map<any, any>;
	}
) {
	const dependencies = node.dynamic_tag_expr.dynamic_dependencies();

	if (dependencies.length === 0) {
		ElementHandler(node, renderer, options);
	} else {
		const children = remove_whitespace_children(node.children, node.next);

		// awkward special case
		let node_contents;

		const contenteditable = node.attributes.some(
			(attribute) => attribute.name === 'contenteditable'
		);

		const slot = node.get_static_attribute_value('slot');
		const nearest_inline_component = node.find_nearest(/InlineComponent/);

		if (slot && nearest_inline_component) {
			renderer.push();
		}

		renderer.add_string('<');
		renderer.add_expression(node.dynamic_tag_expr.node as ESExpression);

		const class_expression_list = node.classes.map((class_directive) => {
			const { expression, name } = class_directive;
			const snippet = expression ? expression.node : x`#ctx.${name}`; // TODO is this right?
			return x`${snippet} ? "${name}" : ""`;
		});
		if (node.needs_manual_style_scoping) {
			class_expression_list.push(x`"${node.component.stylesheet.id}"`);
		}
		const class_expression =
			class_expression_list.length > 0 &&
			class_expression_list.reduce((lhs, rhs) => x`${lhs} + ' ' + ${rhs}`);

		if (node.attributes.some((attr) => attr.is_spread)) {
			// TODO dry this out
			const args = [];
			node.attributes.forEach((attribute) => {
				if (attribute.is_spread) {
					args.push(attribute.expression.node);
				} else {
					const name = attribute.name.toLowerCase();
					if (attribute.is_true) {
						args.push(x`{ ${attribute.name}: true }`);
					} else if (
						boolean_attributes.has(name) &&
						attribute.chunks.length === 1 &&
						attribute.chunks[0].type !== 'Text'
					) {
						// a boolean attribute with one non-Text chunk
						args.push(
							x`{ ${attribute.name}: ${
								(attribute.chunks[0] as Expression).node
							} || null }`
						);
					} else {
						args.push(
							x`{ ${attribute.name}: ${get_attribute_value(attribute)} }`
						);
					}
				}
			});

			renderer.add_expression(x`@spread([${args}], ${class_expression})`);
		} else {
			let add_class_attribute = !!class_expression;
			node.attributes.forEach((attribute) => {
				const name = attribute.name.toLowerCase();
				if (attribute.is_true) {
					renderer.add_string(` ${attribute.name}`);
				} else if (
					boolean_attributes.has(name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					renderer.add_string(' ');
					renderer.add_expression(
						x`${(attribute.chunks[0] as Expression).node} ? "${
							attribute.name
						}" : ""`
					);
				} else if (name === 'class' && class_expression) {
					add_class_attribute = false;
					renderer.add_string(` ${attribute.name}="`);
					renderer.add_expression(
						x`[${get_class_attribute_value(
							attribute
						)}, ${class_expression}].join(' ').trim()`
					);
					renderer.add_string('"');
				} else if (
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					const snippet = (attribute.chunks[0] as Expression).node;
					renderer.add_expression(
						x`@add_attribute("${attribute.name}", ${snippet}, ${
							boolean_attributes.has(name) ? 1 : 0
						})`
					);
				} else {
					renderer.add_string(` ${attribute.name}="`);
					renderer.add_expression(
						(name === 'class'
							? get_class_attribute_value
							: get_attribute_value)(attribute)
					);
					renderer.add_string('"');
				}
			});
			if (add_class_attribute) {
				renderer.add_expression(
					x`@add_classes([${class_expression}].join(' ').trim())`
				);
			}
		}

		node.bindings.forEach((binding) => {
			const { name, expression } = binding;

			if (binding.is_readonly) {
				return;
			}

			if (name === 'group') {
				// TODO server-render group bindings
			} else if (
				contenteditable &&
				(name === 'textContent' || name === 'innerHTML')
			) {
				node_contents = expression.node;

				// TODO where was this used?
				// value = name === 'textContent' ? x`@escape($$value)` : x`$$value`;
			} else {
				const snippet = expression.node;
				renderer.add_expression(x`@add_attribute("${name}", ${snippet}, 1)`);
			}
		});

		if (options.hydratable && options.head_id) {
			renderer.add_string(` data-svelte="${options.head_id}"`);
		}

		renderer.add_string('>');

		if (node_contents !== undefined) {
			if (contenteditable) {
				renderer.push();
				renderer.render(children, options);
				const result = renderer.pop();

				renderer.add_expression(
					x`($$value => $$value === void 0 ? ${result} : $$value)(${node_contents})`
				);
			} else {
				renderer.add_expression(node_contents);
			}

			renderer.add_string('</');
			renderer.add_expression(node.dynamic_tag_expr.node as ESExpression);
			renderer.add_string('>');
		} else if (slot && nearest_inline_component) {
			renderer.render(children, options);

			renderer.add_string('</');
			renderer.add_expression(node.dynamic_tag_expr.node as ESExpression);
			renderer.add_string('>');

			const lets = node.lets;
			const seen = new Set(lets.map((l) => l.name.name));

			nearest_inline_component.lets.forEach((l) => {
				if (!seen.has(l.name.name)) lets.push(l);
			});

			options.slot_scopes.set(slot, {
				input: get_slot_scope(node.lets),
				output: renderer.pop()
			});
		} else {
			renderer.render(children, options);

			renderer.add_string('</');
			renderer.add_expression(node.dynamic_tag_expr.node as ESExpression);
			renderer.add_string('>');
		}
	}
}
