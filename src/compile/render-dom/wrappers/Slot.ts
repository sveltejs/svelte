import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import FragmentWrapper from './Fragment';
import deindent from '../../../utils/deindent';
import sanitize from '../../../utils/sanitize';

export default class SlotWrapper extends Wrapper {
	node: Slot;
	fragment: FragmentWrapper;

	var = 'slot';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Slot,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();

		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			parent,
			stripWhitespace,
			nextSibling
		);
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { renderer } = this;

		const slotName = this.node.getStaticAttributeValue('name') || 'default';
		renderer.slots.add(slotName);

		const content_name = block.getUniqueName(`slot_content_${sanitize(slotName)}`);
		const prop = quotePropIfNecessary(slotName);
		block.addVariable(content_name, `$$.slotted${prop}`);

		// TODO can we use isDomNode instead of type === 'Element'?
		const needsAnchorBefore = this.prev ? this.prev.node.type !== 'Element' : !parentNode;
		const needsAnchorAfter = this.next ? this.next.node.type !== 'Element' : !parentNode;

		const anchorBefore = needsAnchorBefore
			? block.getUniqueName(`${content_name}_before`)
			: (this.prev && this.prev.var) || 'null';

		const anchorAfter = needsAnchorAfter
			? block.getUniqueName(`${content_name}_after`)
			: (this.next && this.next.var) || 'null';

		if (needsAnchorBefore) block.addVariable(anchorBefore);
		if (needsAnchorAfter) block.addVariable(anchorAfter);

		let mountBefore = block.builders.mount.toString();
		let destroyBefore = block.builders.destroy.toString();

		block.builders.create.pushCondition(`!${content_name}`);
		block.builders.hydrate.pushCondition(`!${content_name}`);
		block.builders.mount.pushCondition(`!${content_name}`);
		block.builders.update.pushCondition(`!${content_name}`);
		block.builders.destroy.pushCondition(`!${content_name}`);

		this.fragment.render(block, parentNode, parentNodes);

		block.builders.create.popCondition();
		block.builders.hydrate.popCondition();
		block.builders.mount.popCondition();
		block.builders.update.popCondition();
		block.builders.destroy.popCondition();

		const mountLeadin = block.builders.mount.toString() !== mountBefore
			? `else`
			: `if (${content_name})`;

		if (parentNode) {
			block.builders.mount.addBlock(deindent`
				${mountLeadin} {
					${needsAnchorBefore && `@append(${parentNode}, ${anchorBefore} || (${anchorBefore} = @createComment()));`}
					@append(${parentNode}, ${content_name});
					${needsAnchorAfter && `@append(${parentNode}, ${anchorAfter} || (${anchorAfter} = @createComment()));`}
				}
			`);
		} else {
			block.builders.mount.addBlock(deindent`
				${mountLeadin} {
					${needsAnchorBefore && `@insert(#target, ${anchorBefore} || (${anchorBefore} = @createComment()), anchor);`}
					@insert(#target, ${content_name}, anchor);
					${needsAnchorAfter && `@insert(#target, ${anchorAfter} || (${anchorAfter} = @createComment()), anchor);`}
				}
			`);
		}

		// if the slot is unmounted, move nodes back into the document fragment,
		// so that it can be reinserted later
		// TODO so that this can work with public API, component.$$.slotted should
		// be all fragments, derived from options.slots. Not === options.slots
		const unmountLeadin = block.builders.destroy.toString() !== destroyBefore
			? `else`
			: `if (${content_name})`;

		if (anchorBefore === 'null' && anchorAfter === 'null') {
			block.builders.destroy.addBlock(deindent`
				${unmountLeadin} {
					@reinsertChildren(${parentNode}, ${content_name});
				}
			`);
		} else if (anchorBefore === 'null') {
			block.builders.destroy.addBlock(deindent`
				${unmountLeadin} {
					@reinsertBefore(${anchorAfter}, ${content_name});
				}
			`);
		} else if (anchorAfter === 'null') {
			block.builders.destroy.addBlock(deindent`
				${unmountLeadin} {
					@reinsertAfter(${anchorBefore}, ${content_name});
				}
			`);
		} else {
			block.builders.destroy.addBlock(deindent`
				${unmountLeadin} {
					@reinsertBetween(${anchorBefore}, ${anchorAfter}, ${content_name});
					@detachNode(${anchorBefore});
					@detachNode(${anchorAfter});
				}
			`);
		}
	}
}