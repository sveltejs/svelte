import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';

export default function(node, renderer, options) {
	const name = node.attributes.find(attribute => attribute.name === 'name');

	const slotName = name && name.chunks[0].data || 'default';
	const prop = quotePropIfNecessary(slotName);

	renderer.append(`\${options && options.slotted && options.slotted${prop} ? options.slotted${prop}() : \``);

	renderer.render(node.children, options);

	renderer.append(`\`}`);
}