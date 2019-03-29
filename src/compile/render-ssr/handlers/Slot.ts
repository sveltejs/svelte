import { quote_prop_if_necessary } from '../../../utils/names';
import get_slot_data from '../../utils/get_slot_data';

export default function(node, renderer, options) {
	const prop = quote_prop_if_necessary(node.slot_name);

	const slot_data = get_slot_data(node.attributes, true);

	const arg = slot_data.length > 0 ? `{ ${slot_data.join(', ')} }` : '';

	renderer.append(`\${$$slots${prop} ? $$slots${prop}(${arg}) : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}