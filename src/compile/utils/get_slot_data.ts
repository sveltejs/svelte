import { snip } from './snip';
import { stringify_attribute } from './stringify_attribute';
import Attribute from '../nodes/Attribute';

export default function get_slot_data(values: Map<string, Attribute>, is_ssr: boolean) {
	return Array.from(values.values())
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