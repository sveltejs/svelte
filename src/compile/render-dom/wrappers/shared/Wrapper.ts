import Renderer from '../../Renderer';
import Node from '../../../nodes/shared/Node';
import { CompileOptions } from '../../../../interfaces';
import Block from '../../Block';

export default class Wrapper {
	renderer: Renderer;
	parent: Wrapper;
	node: Node;

	prev: Wrapper | null;
	next: Wrapper | null;

	canUseInnerHTML: boolean;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Node
	) {
		this.renderer = renderer;
		this.parent = parent;
		this.node = node;

		this.canUseInnerHTML = !renderer.options.hydratable;

		block.wrappers.push(this);
	}

	cannotUseInnerHTML() {
		this.canUseInnerHTML = false;
		if (this.parent) this.parent.cannotUseInnerHTML();
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

	render(block: Block, parentNode: string, parentNodes: string) {
		throw new Error(`render method not implemented by subclass ${this.node.type}`);
	}
}