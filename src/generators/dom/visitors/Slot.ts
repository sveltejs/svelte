import { DomGenerator } from '../index';
import deindent from '../../../utils/deindent';
import visit from '../visit';
import Block from '../Block';
import getStaticAttributeValue from './shared/getStaticAttributeValue';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitSlot(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	const slotName = getStaticAttributeValue(node, 'name') || 'default';
	const name = block.getUniqueName(`slot_${slotName}`);
	const content_name = block.getUniqueName(`slot_content_${slotName}`);

	block.addVariable(content_name, `#component._slotted.${slotName}`);

	block.addVariable(name);
	block.addElement(
		name,
		`@createElement('slot')`,
		`@claimElement(${state.parentNodes}, 'slot', {${slotName !== 'default' ? ` name: '${slotName}' ` : ''}})`,
		state.parentNode
	);

	block.builders.create.pushCondition(`!${content_name}`);
	block.builders.mount.pushCondition(`!${content_name}`);
	block.builders.unmount.pushCondition(`!${content_name}`);
	block.builders.destroy.pushCondition(`!${content_name}`);

	node.children.forEach((child: Node) => {
		visit(generator, block, node._state, child, elementStack.concat(node));
	});

	block.builders.create.popCondition();
	block.builders.mount.popCondition();
	block.builders.unmount.popCondition();
	block.builders.destroy.popCondition();

	// TODO can we use an else here?
	block.builders.mount.addBlock(deindent`
		if (${content_name}) {
			@appendNode(${content_name}, ${name});
		}
	`);

	// if the slot is unmounted, move nodes back into the document fragment,
	// so that it can be reinserted later
	// TODO so that this can work with public API, component._slotted should
	// be all fragments, derived from options.slots. Not === options.slots
	block.builders.unmount.addBlock(deindent`
		if (${content_name}) {
			while (${name}.firstChild) @appendNode(${name}.firstChild, ${content_name});
		}
	`);
}
