import { DomGenerator } from '../index';
import deindent from '../../../utils/deindent';
import visit from '../visit';
import Block from '../Block';
import getStaticAttributeValue from '../../../utils/getStaticAttributeValue';
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

	const needsAnchorBefore = node.prev ? node.prev.type !== 'Element' : !state.parentNode;
	const needsAnchorAfter = node.next ? node.next.type !== 'Element' : !state.parentNode;

	const anchorBefore = needsAnchorBefore
		? block.getUniqueName(`${content_name}_before`)
		: (node.prev && node.prev.var) || 'null';

	const anchorAfter = needsAnchorAfter
		? block.getUniqueName(`${content_name}_after`)
		: (node.next && node.next.var) || 'null';

	if (needsAnchorBefore) block.addVariable(anchorBefore);
	if (needsAnchorAfter) block.addVariable(anchorAfter);

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
				${needsAnchorBefore && `@appendNode(${anchorBefore} || (${anchorBefore} = @createComment()), ${state.parentNode});`}
				@appendNode(${content_name}, ${state.parentNode});
				${needsAnchorAfter && `@appendNode(${anchorAfter} || (${anchorAfter} = @createComment()), ${state.parentNode});`}
			}
		`);
	} else {
		block.builders.mount.addBlock(deindent`
			if (${content_name}) {
				${needsAnchorBefore && `@insertNode(${anchorBefore} || (${anchorBefore} = @createComment()), #target, anchor);`}
				@insertNode(${content_name}, #target, anchor);
				${needsAnchorAfter && `@insertNode(${anchorAfter} || (${anchorAfter} = @createComment()), #target, anchor);`}
			}
		`);
	}

	// if the slot is unmounted, move nodes back into the document fragment,
	// so that it can be reinserted later
	// TODO so that this can work with public API, component._slotted should
	// be all fragments, derived from options.slots. Not === options.slots
	// TODO can we use an else here?
	if (anchorBefore === 'null' && anchorAfter === 'null') {
		block.builders.unmount.addBlock(deindent`
			if (${content_name}) {
				@reinsertChildren(${state.parentNode}, ${content_name});
			}
		`);
	} else if (anchorBefore === 'null') {
		block.builders.unmount.addBlock(deindent`
			if (${content_name}) {
				@reinsertBefore(${anchorAfter}, ${content_name});
			}
		`);
	} else if (anchorAfter === 'null') {
		block.builders.unmount.addBlock(deindent`
			if (${content_name}) {
				@reinsertAfter(${anchorBefore}, ${content_name});
			}
		`);
	} else {
		block.builders.unmount.addBlock(deindent`
			if (${content_name}) {
				@reinsertBetween(${anchorBefore}, ${anchorAfter}, ${content_name});
				@detachNode(${anchorBefore});
				@detachNode(${anchorAfter});
			}
		`);
	}
}
