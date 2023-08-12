import { is_void } from '../../../../shared/utils/names.js';
import {
	get_attribute_expression,
	get_attribute_value,
	get_class_attribute_value
} from './shared/get_attribute_value.js';
import { boolean_attributes } from '../../../../shared/boolean_attributes.js';
import { is_name_contenteditable, is_contenteditable } from '../../utils/contenteditable.js';
import { p, x } from 'code-red';
import remove_whitespace_children from './utils/remove_whitespace_children.js';
import fix_attribute_casing from '../../render_dom/wrappers/Element/fix_attribute_casing.js';
import { namespaces } from '../../../utils/namespaces.js';
import { regex_starts_with_newline } from '../../../utils/patterns.js';

/**
 * @param {import('../../nodes/Element.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	const children = remove_whitespace_children(node.children, node.next);
	// awkward special case
	let node_contents;
	const contenteditable = is_contenteditable(node);
	if (node.is_dynamic_element) {
		renderer.push();
	}
	renderer.add_string('<');
	add_tag_name();
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
	const style_expression_list = node.styles.map((style_directive) => {
		let {
			name,
			important,
			expression: { node: expression }
		} = style_directive;
		if (important) {
			expression = x`${expression} + ' !important'`;
		}
		return p`"${name}": ${expression}`;
	});
	const style_expression = style_expression_list.length > 0 && x`{ ${style_expression_list} }`;
	if (node.attributes.some((attr) => attr.is_spread)) {
		// TODO dry this out
		const args = [];
		node.attributes.forEach((attribute) => {
			if (attribute.is_spread) {
				args.push(x`@escape_object(${attribute.expression.node})`);
			} else {
				const attr_name =
					node.namespace === namespaces.foreign
						? attribute.name
						: fix_attribute_casing(attribute.name);
				const name = attribute.name.toLowerCase();
				if (name === 'value' && node.name.toLowerCase() === 'textarea') {
					node_contents = get_attribute_value(attribute);
				} else if (attribute.is_true) {
					args.push(x`{ ${attr_name}: true }`);
				} else if (
					boolean_attributes.has(name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					args.push(
						x`{ ${attr_name}: ${
							/** @type {import('../../nodes/shared/Expression.js').default} */ (
								attribute.chunks[0]
							).node
						} || null }`
					);
				} else if (attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text') {
					const snippet = /** @type {import('../../nodes/shared/Expression.js').default} */ (
						attribute.chunks[0]
					).node;
					args.push(x`{ ${attr_name}: @escape_attribute_value(${snippet}) }`);
				} else {
					args.push(x`{ ${attr_name}: ${get_attribute_value(attribute)} }`);
				}
			}
		});
		renderer.add_expression(
			x`@spread([${args}], { classes: ${class_expression}, styles: ${style_expression} })`
		);
	} else {
		let add_class_attribute = !!class_expression;
		let add_style_attribute = !!style_expression;
		node.attributes.forEach((attribute) => {
			const name = attribute.name.toLowerCase();
			const attr_name =
				node.namespace === namespaces.foreign
					? attribute.name
					: fix_attribute_casing(attribute.name);
			if (name === 'value' && node.name.toLowerCase() === 'textarea') {
				node_contents = get_attribute_value(attribute);
			} else if (attribute.is_true) {
				renderer.add_string(` ${attr_name}`);
			} else if (
				boolean_attributes.has(name) &&
				attribute.chunks.length === 1 &&
				attribute.chunks[0].type !== 'Text'
			) {
				// a boolean attribute with one non-Text chunk
				renderer.add_string(' ');
				renderer.add_expression(
					x`${
						/** @type {import('../../nodes/shared/Expression.js').default} */ (attribute.chunks[0])
							.node
					} ? "${attr_name}" : ""`
				);
			} else if (name === 'class' && class_expression) {
				add_class_attribute = false;
				renderer.add_string(` ${attr_name}="`);
				renderer.add_expression(
					x`[${get_class_attribute_value(attribute)}, ${class_expression}].join(' ').trim()`
				);
				renderer.add_string('"');
			} else if (name === 'style' && style_expression) {
				add_style_attribute = false;
				renderer.add_expression(
					x`@add_styles(@merge_ssr_styles(${get_attribute_value(attribute)}, ${style_expression}))`
				);
			} else if (attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text') {
				const snippet = /** @type {import('../../nodes/shared/Expression.js').default} */ (
					attribute.chunks[0]
				).node;
				renderer.add_expression(
					x`@add_attribute("${attr_name}", ${snippet}, ${boolean_attributes.has(name) ? 1 : 0})`
				);
			} else {
				renderer.add_string(` ${attr_name}="`);
				renderer.add_expression(
					(name === 'class' ? get_class_attribute_value : get_attribute_value)(attribute)
				);
				renderer.add_string('"');
			}
		});
		if (add_class_attribute) {
			renderer.add_expression(x`@add_classes((${class_expression}).trim())`);
		}
		if (add_style_attribute) {
			renderer.add_expression(x`@add_styles(${style_expression})`);
		}
	}
	node.bindings.forEach((binding) => {
		const { name, expression } = binding;
		if (binding.is_readonly) {
			return;
		}
		if (name === 'group') {
			const value_attribute = node.attributes.find(({ name }) => name === 'value');
			if (value_attribute) {
				const value = get_attribute_expression(value_attribute);
				const type = node.get_static_attribute_value('type');
				const bound = expression.node;
				const condition =
					type === 'checkbox' ? x`~${bound}.indexOf(${value})` : x`${value} === ${bound}`;
				renderer.add_expression(x`${condition} ? @add_attribute("checked", true, 1) : ""`);
			}
		} else if (contenteditable && is_name_contenteditable(name)) {
			node_contents = expression.node;
			// TODO where was this used?
			// value = name === 'textContent' ? x`@escape($$value)` : x`$$value`;
		} else if (binding.name === 'value' && node.name === 'textarea') {
			const snippet = expression.node;
			node_contents = x`@escape(${snippet} || "")`;
		} else if (binding.name === 'value' && node.name === 'select') {
			// NOTE: do not add "value" attribute on <select />
		} else {
			const snippet = expression.node;
			renderer.add_expression(
				x`@add_attribute("${name}", ${snippet}, ${boolean_attributes.has(name) ? 1 : 0})`
			);
		}
	});
	if (options.hydratable) {
		if (node.can_optimise_hydration && !options.has_added_svelte_hash) {
			renderer.add_string(` data-svelte-h="${node.hash()}"`);
			options = { ...options, has_added_svelte_hash: true };
		}
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
			if (node.name === 'textarea') {
				// Two or more leading newlines are required to restore the leading newline immediately after `<textarea>`.
				// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
				const value_attribute = node.attributes.find(({ name }) => name === 'value');
				if (value_attribute) {
					const first = value_attribute.chunks[0];
					if (first && first.type === 'Text' && regex_starts_with_newline.test(first.data)) {
						renderer.add_string('\n');
					}
				}
			}
			renderer.add_expression(node_contents);
		}
		add_close_tag();
	} else {
		if (node.name === 'pre') {
			// Two or more leading newlines are required to restore the leading newline immediately after `<pre>`.
			// see https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
			// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
			const first = children[0];
			if (first && first.type === 'Text' && regex_starts_with_newline.test(first.data)) {
				renderer.add_string('\n');
			}
		}
		if (node.is_dynamic_element) renderer.push();
		renderer.render(children, options);
		if (node.is_dynamic_element) {
			const children = renderer.pop();
			renderer.add_expression(x`@is_void(#tag) ? '' : ${children}`);
		}
		add_close_tag();
	}
	if (node.is_dynamic_element) {
		/** @type {import('estree').Node} */
		let content = renderer.pop();
		if (options.dev && node.children.length > 0)
			content = x`(() => { @validate_void_dynamic_element(#tag); return ${content}; })()`;
		renderer.add_expression(x`((#tag) => {
			${options.dev && x`@validate_dynamic_element(#tag)`}
			return #tag ? ${content} : '';
		})(${node.tag_expr.node})`);
	}
	function add_close_tag() {
		if (node.tag_expr.node.type === 'Literal') {
			if (!is_void(/** @type {string} */ (node.tag_expr.node.value))) {
				renderer.add_string('</');
				add_tag_name();
				renderer.add_string('>');
			}
			return;
		}
		renderer.add_expression(x`@is_void(#tag) ? '' : \`</\${#tag}>\``);
	}
	function add_tag_name() {
		if (node.tag_expr.node.type === 'Literal') {
			renderer.add_string(/** @type {string} */ (node.tag_expr.node.value));
		} else {
			renderer.add_expression(/** @type {import('estree').Expression} */ (node.tag_expr.node));
		}
	}
}
