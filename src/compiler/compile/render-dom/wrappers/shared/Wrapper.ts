import Renderer from '../../Renderer';
import Block from '../../Block';
import { INode } from '../../../nodes/interfaces';

export default class Wrapper {
	renderer: Renderer;
	parent: Wrapper;
	node: INode;

	prev: Wrapper | null;
	next: Wrapper | null;

	var: string;
	can_use_innerhtml: boolean;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: INode
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

		this.can_use_innerhtml = !renderer.options.hydratable;

		block.wrappers.push(this);
	}

	cannot_use_innerhtml() {
		this.can_use_innerhtml = false;
		if (this.parent) this.parent.cannot_use_innerhtml();
	}

	get_or_create_anchor(block: Block, parent_node: string, parent_nodes: string) {
		// TODO use this in EachBlock and IfBlock — tricky because
		// children need to be created first
		const needs_anchor = this.next ? !this.next.is_dom_node() : !parent_node || !this.parent.is_dom_node();
		const anchor = needs_anchor
			? block.get_unique_name(`${this.var}_anchor`)
			: (this.next && this.next.var) || 'null';

		if (needs_anchor) {
			block.add_element(
				anchor,
				`@empty()`,
				parent_nodes && `@empty()`,
				parent_node
			);
		}

		return anchor;
	}

	get_update_mount_node(anchor: string) {
		return (this.parent && this.parent.is_dom_node())
			? this.parent.var
			: `${anchor}.parentNode`;
	}

	is_dom_node() {
		return (
			this.node.type === 'Element' ||
			this.node.type === 'Text' ||
			this.node.type === 'MustacheTag'
		);
	}

	render(_block: Block, _parent_node: string, _parent_nodes: string) {
		throw Error('Wrapper class is not renderable');
	}
}
