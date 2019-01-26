import Renderer from '../../Renderer';
import Node from '../../../nodes/shared/Node';
import Block from '../../Block';

export default class Wrapper {
	renderer: Renderer;
	parent: Wrapper;
	node: Node;

	prev: Wrapper | null;
	next: Wrapper | null;

	var: string;
	canUseInnerHTML: boolean;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Node
	) {
		this.node = node;

		// make these non-enumerable so that they can be logged sensibly
		// (TODO in dev only?)
		Object.defineProperties(this, {
			renderer: {
				value: renderer
			},
			parent: {
				value: parent
			}
		});

		this.canUseInnerHTML = !renderer.options.hydratable;

		block.wrappers.push(this);
	}

	cannotUseInnerHTML() {
		this.canUseInnerHTML = false;
		if (this.parent) this.parent.cannotUseInnerHTML();
	}

	getOrCreateAnchor(block: Block, parentNode: string, parentNodes: string) {
		// TODO use this in EachBlock and IfBlock — tricky because
		// children need to be created first
		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${this.var}_anchor`)
			: (this.next && this.next.var) || 'null';

		if (needsAnchor) {
			block.addElement(
				anchor,
				`@createComment()`,
				parentNodes && `@createComment()`,
				parentNode
			);
		}

		return anchor;
	}

	getUpdateMountNode(anchor: string) {
		return (this.parent && this.parent.isDomNode())
			? this.parent.var
			: `${anchor}.parentNode`;
	}

	isDomNode() {
		return (
			this.node.type === 'Element' ||
			this.node.type === 'Text' ||
			this.node.type === 'MustacheTag'
		);
	}

	remount(name: string) {
		return `${this.var}.m(${name}.$$.slotted.default, null);`;
	}
}