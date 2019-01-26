import { snip } from './snip';
import { stringify_attribute } from './stringify_attribute';

export default function(attributes) {
	return attributes
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
}