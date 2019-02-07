import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import get_slot_data from '../../../utils/get_slot_data';

export default function(node, renderer, options) {
	const name = node.attributes.find(attribute => attribute.name === 'name');

	const slot_name = name && name.chunks[0].data || 'default';
	const prop = quotePropIfNecessary(slot_name);

	const slot_data = get_slot_data(node.attributes, true);

	const arg = slot_data.length > 0 ? `{ ${slot_data.join(', ')} }` : '';

	renderer.append(`\${$$slots${prop} ? $$slots${prop}(${arg}) : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}