import { DomGenerator } from '../index';
import deindent from '../../../utils/deindent';
import visit from '../visit';
import Block from '../Block';
import getStaticAttributeValue from '../../shared/getStaticAttributeValue';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitSlot(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) {
	const slotName = getStaticAttributeValue(node, 'name') || 'default';
	generator.slots.add(slotName);

	const content_name = block.getUniqueName(`slot_content_${slotName}`);
	block.addVariable(content_name, `#component._slotted.${slotName}`);

	// TODO use surrounds as anchors where possible, a la if/each blocks
	const before = block.getUniqueName(`${content_name}_before`);
	const after = block.getUniqueName(`${content_name}_after`);
	block.addVariable(before);
	block.addVariable(after);

	block.builders.create.pushCondition(`!${content_name}`);
	block.builders.hydrate.pushCondition(`!${content_name}`);
	block.builders.mount.pushCondition(`!${content_name}`);
	block.builders.unmount.pushCondition(`!${content_name}`);
	block.builders.destroy.pushCondition(`!${content_name}`);

	node.children.forEach((child: Node) => {
		visit(generator, block, state, child, elementStack, componentStack);
	});

	block.builders.create.popCondition();
	block.builders.hydrate.popCondition();
	block.builders.mount.popCondition();
	block.builders.unmount.popCondition();
	block.builders.destroy.popCondition();

	// TODO can we use an else here?
	if (state.parentNode) {
		block.builders.mount.addBlock(deindent`
			if (${content_name}) {
				@appendNode(${before} || (${before} = @createComment()), ${state.parentNode});
				@appendNode(${content_name}, ${state.parentNode});
				@appendNode(${after} || (${after} = @createComment()), ${state.parentNode});
			}
		`);
	} else {
		block.builders.mount.addBlock(deindent`
			if (${content_name}) {
				@insertNode(${before} || (${before} = @createComment()), #target, anchor);
				@insertNode(${content_name}, #target, anchor);
				@insertNode(${after} || (${after} = @createComment()), #target, anchor);
			}
		`);
	}

	// if the slot is unmounted, move nodes back into the document fragment,
	// so that it can be reinserted later
	// TODO so that this can work with public API, component._slotted should
	// be all fragments, derived from options.slots. Not === options.slots
	// TODO can we use an else here?
	block.builders.unmount.addBlock(deindent`
		if (${content_name}) {
			@reinsertBetween(${before}, ${after}, ${content_name});
			@detachNode(${before});
			@detachNode(${after});
		}
	`);
}
