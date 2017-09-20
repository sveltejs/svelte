import { DomGenerator } from '../index';
import deindent from '../../../utils/deindent';
import visit from '../visit';
import Block from '../Block';
import mountChildren from '../mountChildren';
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

	node.children.forEach((child: Node) => {
		visit(generator, block, state, child, elementStack, componentStack);
	});

	if (state.parentNode) {
		node.mountStatement = deindent`
			if (${content_name}) {
				${needsAnchorBefore && `@append(${state.parentNode}, ${anchorBefore} || (${anchorBefore} = @createComment()));`}
				@append(${state.parentNode}, ${content_name});
				${needsAnchorAfter && `@append(${state.parentNode}, ${anchorAfter} || (${anchorAfter} = @createComment()));`}
			} else {
				${mountChildren(node, state.parentNode)}
			}
		`;
	} else {
		node.mountStatement = deindent`
			if (${content_name}) {
				${needsAnchorBefore && `@insert(#target, anchor, ${anchorBefore} || (${anchorBefore} = @createComment()));`}
				@insert(#target, anchor, ${content_name});
				${needsAnchorAfter && `@insert(#target, anchor, ${anchorAfter} || (${anchorAfter} = @createComment()));`}
			} else {
				${mountChildren(node, state.parentNode)}
			}
		`;
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
