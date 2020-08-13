import Renderer, { RenderOptions } from '../Renderer';
import Slot from '../../nodes/Slot';
import { x } from 'code-red';
import get_slot_data from '../../utils/get_slot_data';

export default function(node: Slot, renderer: Renderer, options: RenderOptions) {
	const slot_data = get_slot_data(node.values);

	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();

	renderer.add_expression(x`
		#slots.${node.slot_name}
			? #slots.${node.slot_name}(${slot_data})
			: ${result}
	`);
}
