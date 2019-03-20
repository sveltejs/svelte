import { snip } from './snip';
import { stringify_attribute } from './stringify_attribute';

export default function get_slot_data(attributes, is_ssr: boolean) {
	return attributes
		.filter(attribute => attribute.name !== 'name')
		.map(attribute => {
			const value = attribute.is_true
				? 'true'
				: attribute.chunks.length === 0
					? '""'
					: attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text'
						? snip(attribute.chunks[0])
						: '`' + stringify_attribute(attribute, is_ssr) + '`';

			return `${attribute.name}: ${value}`;
		});
}