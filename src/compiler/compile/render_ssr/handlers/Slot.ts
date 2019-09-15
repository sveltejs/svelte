import { quote_prop_if_necessary } from '../../../utils/names';
import get_slot_data from '../../utils/get_slot_data';
import Renderer, { RenderOptions } from '../Renderer';
import Slot from '../../nodes/Slot';

export default function(node: Slot, renderer: Renderer, options: RenderOptions) {
	const prop = quote_prop_if_necessary(node.slot_name);

	const slot_data = get_slot_data(node.values, true);

	renderer.append(`\${$$slots${prop} ? $$slots${prop}(${slot_data}) : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}
