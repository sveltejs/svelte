import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';

export default function(node, renderer, options) {
	const name = node.attributes.find(attribute => attribute.name === 'name');

	const slot_name = name && name.chunks[0].data || 'default';
	const prop = quotePropIfNecessary(slot_name);

	renderer.append(`\${$$slots${prop} ? $$slots${prop}() : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}