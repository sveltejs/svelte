import { quote_prop_if_necessary } from '../../../utils/names';
import get_slot_data from '../../utils/get_slot_data';
import Renderer, { RenderOptions } from '../Renderer';
import Slot from '../../nodes/Slot';
import { x } from 'code-red';

export default function(node: Slot, renderer: Renderer, options: RenderOptions) {
	const slot_data = get_slot_data(node.values, true);

	console.group('push');
	renderer.push();
	console.groupEnd();
	renderer.render(node.children, options);
	const result = renderer.pop();

	renderer.add_expression(x`
		$$slots.${node.slot_name}
			? $$slots.${node.slot_name}(${slot_data})
			: ${result}
	`);
}
