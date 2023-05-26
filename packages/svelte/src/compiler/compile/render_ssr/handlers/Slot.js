import { x } from 'code-red';
import get_slot_data from '../../utils/get_slot_data.js';
import { get_slot_scope } from './shared/get_slot_scope.js';

/**
 * @param {import('../../nodes/Slot.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions & {
 * 		slot_scopes: Map<any, any>;
 * 	}} options
 */
export default function (node, renderer, options) {
	const slot_data = get_slot_data(node.values);
	const slot = node.get_static_attribute_value('slot');
	const nearest_inline_component = node.find_nearest(/InlineComponent/);
	if (slot && nearest_inline_component) {
		renderer.push();
	}
	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();
	renderer.add_expression(x`
		#slots.${node.slot_name}
			? #slots.${node.slot_name}(${slot_data})
			: ${result}
	`);
	if (slot && nearest_inline_component) {
		options.slot_scopes.set(slot, {
			input: get_slot_scope(node.lets),
			output: renderer.pop()
		});
	}
}
