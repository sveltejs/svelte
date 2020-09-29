import ElementWrapper from './index';
import SlotWrapper from '../Slot';
import Block from '../../Block';
import { sanitize } from '../../../../utils/names';
import InlineComponentWrapper from '../InlineComponent';
import create_debugging_comment from '../shared/create_debugging_comment';
import { get_slot_definition } from '../shared/get_slot_definition';

export default function create_slot_block(attribute, element: ElementWrapper | SlotWrapper, block: Block) {
	const owner = find_slot_owner(element.parent);

	if (owner && owner.node.type === 'InlineComponent') {
		const name = attribute.get_static_value() as string;

		if (!((owner as unknown) as InlineComponentWrapper).slots.has(name)) {
			const child_block = block.child({
				comment: create_debugging_comment(element.node, element.renderer.component),
				name: element.renderer.component.get_unique_name(
					`create_${sanitize(name)}_slot`
				),
				type: 'slot'
			});

			const { scope, lets } = element.node;
			const seen = new Set(lets.map(l => l.name.name));

			((owner as unknown) as InlineComponentWrapper).node.lets.forEach(l => {
				if (!seen.has(l.name.name)) lets.push(l);
			});

			((owner as unknown) as InlineComponentWrapper).slots.set(
				name,
				get_slot_definition(child_block, scope, lets)
			);
			element.renderer.blocks.push(child_block);
		}

		element.slot_block = ((owner as unknown) as InlineComponentWrapper).slots.get(
			name
		).block;

		return element.slot_block;
	}

	return block;
}

function find_slot_owner(owner) {
	while (owner) {
		if (owner.node.type === 'InlineComponent') {
			break;
		}

		if (owner.node.type === 'Element' && /-/.test(owner.node.name)) {
			break;
		}

		owner = owner.parent;
	}
	return owner;
}
