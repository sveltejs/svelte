import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import { snip } from '../utils';
import { stringify_attribute } from './shared/stringify_attribute';

export default function(node, renderer, options) {
	const name = node.attributes.find(attribute => attribute.name === 'name');

	const slot_name = name && name.chunks[0].data || 'default';
	const prop = quotePropIfNecessary(slot_name);

	const slot_data = node.attributes
		.filter(attribute => attribute.name !== 'name')
		.map(attribute => {
			const value = attribute.isTrue
				? 'true'
				: attribute.chunks.length === 0
					? '""'
					: attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text'
						? snip(attribute.chunks[0])
						: stringify_attribute(attribute);

			return `${attribute.name}: ${value}`;
		});

	const arg = slot_data ? `{ ${slot_data.join(', ')} }` : '';

	renderer.append(`\${$$slots${prop} ? $$slots${prop}(${arg}) : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}