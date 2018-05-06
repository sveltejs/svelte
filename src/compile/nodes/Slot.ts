import deindent from '../../utils/deindent';
import isValidIdentifier from '../../utils/isValidIdentifier';
import reservedNames from '../../utils/reservedNames';
import Node from './shared/Node';
import Element from './Element';
import Attribute from './Attribute';
import Block from '../dom/Block';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	attributes: Attribute[];
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
		const { compiler } = this;

		const slotName = this.getStaticAttributeValue('name') || 'default';
		compiler.slots.add(slotName);

		const content_name = block.getUniqueName(`slot_content_${slotName}`);
		const prop = !isValidIdentifier(slotName) ? `["${slotName}"]` : `.${slotName}`;
		block.addVariable(content_name, `#component._slotted${prop}`);

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

		let mountBefore = block.builders.mount.toString();
		let destroyBefore = block.builders.destroy.toString();

		block.builders.create.pushCondition(`!${content_name}`);
		block.builders.hydrate.pushCondition(`!${content_name}`);
		block.builders.mount.pushCondition(`!${content_name}`);
		block.builders.update.pushCondition(`!${content_name}`);
		block.builders.destroy.pushCondition(`!${content_name}`);

		this.children.forEach((child: Node) => {
			child.build(block, parentNode, parentNodes);
		});

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
					${needsAnchorBefore && `@appendNode(${anchorBefore} || (${anchorBefore} = @createComment()), ${parentNode});`}
					@appendNode(${content_name}, ${parentNode});
					${needsAnchorAfter && `@appendNode(${anchorAfter} || (${anchorAfter} = @createComment()), ${parentNode});`}
				}
			`);
		} else {
			block.builders.mount.addBlock(deindent`
				${mountLeadin} {
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

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			attr => attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.isTrue) return true;
		if (attribute.chunks.length === 0) return '';

		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return attribute.chunks[0].data;
		}

		return null;
	}

	ssr() {
		const name = this.attributes.find(attribute => attribute.name === 'name');
		const slotName = name && name.chunks[0].data || 'default';

		this.compiler.target.append(`\${options && options.slotted && options.slotted.${slotName} ? options.slotted.${slotName}() : \``);

		this.children.forEach((child: Node) => {
			child.ssr();
		});

		this.compiler.target.append(`\`}`);
	}
}