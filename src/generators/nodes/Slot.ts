import deindent from '../../utils/deindent';
import Node from './shared/Node';
import Element from './Element';
import Attribute from './Attribute';
import Block from '../dom/Block';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	attributes: Attribute[]; // TODO have more specific Attribute type
	children: Node[];

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName('slot');

		if (this.children.length) {
			this.initChildren(block, stripWhitespace, nextSibling);
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		const slotName = this.getStaticAttributeValue('name') || 'default';
		generator.slots.add(slotName);

		const content_name = block.getUniqueName(`slot_content_${slotName}`);
		block.addVariable(content_name, `#component._slotted.${slotName}`);

		const needsAnchorBefore = this.prev ? this.prev.type !== 'Element' : !parentNode;
		const needsAnchorAfter = this.next ? this.next.type !== 'Element' : !parentNode;

		const anchorBefore = needsAnchorBefore
			? block.getUniqueName(`${content_name}_before`)
			: (this.prev && this.prev.var) || 'null';

		const anchorAfter = needsAnchorAfter
			? block.getUniqueName(`${content_name}_after`)
			: (this.next && this.next.var) || 'null';

		if (needsAnchorBefore) block.addVariable(anchorBefore);
		if (needsAnchorAfter) block.addVariable(anchorAfter);

		block.builders.create.pushCondition(`!${content_name}`);
		block.builders.hydrate.pushCondition(`!${content_name}`);
		block.builders.mount.pushCondition(`!${content_name}`);
		block.builders.unmount.pushCondition(`!${content_name}`);
		block.builders.destroy.pushCondition(`!${content_name}`);

		this.children.forEach((child: Node) => {
			child.build(block, parentNode, parentNodes);
		});

		block.builders.create.popCondition();
		block.builders.hydrate.popCondition();
		block.builders.mount.popCondition();
		block.builders.unmount.popCondition();
		block.builders.destroy.popCondition();

		// TODO can we use an else here?
		if (parentNode) {
			block.builders.mount.addBlock(deindent`
				if (${content_name}) {
					${needsAnchorBefore && `@appendNode(${anchorBefore} || (${anchorBefore} = @createComment()), ${parentNode});`}
					@appendNode(${content_name}, ${parentNode});
					${needsAnchorAfter && `@appendNode(${anchorAfter} || (${anchorAfter} = @createComment()), ${parentNode});`}
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
					@reinsertChildren(${parentNode}, ${content_name});
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

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			(attr: Node) => attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.value === true) return true;
		if (attribute.value.length === 0) return '';

		if (attribute.value.length === 1 && attribute.value[0].type === 'Text') {
			return attribute.value[0].data;
		}

		return null;
	}
}