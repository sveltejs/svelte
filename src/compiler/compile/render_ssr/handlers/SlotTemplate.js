import SlotTemplate from '../../nodes/SlotTemplate.js';
import remove_whitespace_children from './utils/remove_whitespace_children.js';
import { get_slot_scope } from './shared/get_slot_scope.js';
import { get_const_tags } from './shared/get_const_tags.js';

/**
 * @param {import('../../nodes/SlotTemplate.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions & {
 * 		slot_scopes: Map<any, any>;
 * 	}} options
 */
export default function (node, renderer, options) {
	const parent_inline_component = /** @type {import('../../nodes/InlineComponent.js').default} */ (
		node.parent
	);
	const children = remove_whitespace_children(
		node instanceof SlotTemplate ? node.children : [node],
		node.next
	);
	renderer.push();
	renderer.render(children, options);

	const slot_fragment_content = renderer.pop();
	if (!is_empty_template_literal(slot_fragment_content)) {
		if (options.slot_scopes.has(node.slot_template_name)) {
			if (node.slot_template_name === 'default') {
				throw new Error('Found elements without slot attribute when using slot="default"');
			}
			throw new Error(
				`Duplicate slot name "${node.slot_template_name}" in <${parent_inline_component.name}>`
			);
		}
		options.slot_scopes.set(node.slot_template_name, {
			input: get_slot_scope(node.lets),
			output: slot_fragment_content,
			statements: get_const_tags(node.const_tags)
		});
	}
}

/** @param {any} template_literal */
function is_empty_template_literal(template_literal) {
	return (
		template_literal.expressions.length === 0 &&
		template_literal.quasis.length === 1 &&
		template_literal.quasis[0].value.raw === ''
	);
}
