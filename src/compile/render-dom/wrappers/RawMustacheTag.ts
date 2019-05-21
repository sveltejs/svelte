import Renderer from '../Renderer';
import Block from '../Block';
import Tag from './shared/Tag';
import Wrapper from './shared/wrapper';
import deindent from '../../utils/deindent';
import MustacheTag from '../../nodes/MustacheTag';
import RawMustacheTag from '../../nodes/RawMustacheTag';

export default class RawMustacheTagWrapper extends Tag {
	var = 'raw';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: MustacheTag | RawMustacheTag
	) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		const name = this.var;

		// TODO use is_dom_node instead of type === 'Element'?
		const needs_anchor_before = this.prev ? this.prev.node.type !== 'Element' : !parent_node;
		const needs_anchor_after = this.next ? this.next.node.type !== 'Element' : !parent_node;

		const anchor_before = needs_anchor_before
			? block.get_unique_name(`${name}_before`)
			: (this.prev && this.prev.var) || 'null';

		const anchor_after = needs_anchor_after
			? block.get_unique_name(`${name}_after`)
			: (this.next && this.next.var) || 'null';

		let detach: string;
		let insert: (content: string) => string;
		let use_innerhtml = false;

		if (anchor_before === 'null' && anchor_after === 'null') {
			use_innerhtml = true;
			detach = `${parent_node}.innerHTML = '';`;
			insert = content => `${parent_node}.innerHTML = ${content};`;
		} else if (anchor_before === 'null') {
			detach = `@detach_before(${anchor_after});`;
			insert = content => `${anchor_after}.insertAdjacentHTML("beforebegin", ${content});`;
		} else if (anchor_after === 'null') {
			detach = `@detach_after(${anchor_before});`;
			insert = content => `${anchor_before}.insertAdjacentHTML("afterend", ${content});`;
		} else {
			detach = `@detach_between(${anchor_before}, ${anchor_after});`;
			insert = content => `${anchor_before}.insertAdjacentHTML("afterend", ${content});`;
		}

		const { init } = this.rename_this_method(
			block,
			content => deindent`
				${!use_innerhtml && detach}
				${insert(content)}
			`
		);

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		if (needs_anchor_before) {
			block.add_element(
				anchor_before,
				`@element('noscript')`,
				parent_nodes && `@element('noscript')`,
				parent_node,
				true
			);
		}

		function add_anchor_after() {
			block.add_element(
				anchor_after,
				`@element('noscript')`,
				parent_nodes && `@element('noscript')`,
				parent_node
			);
		}

		if (needs_anchor_after && anchor_before === 'null') {
			// anchor_after needs to be in the DOM before we
			// insert the HTML...
			add_anchor_after();
		}

		block.builders.mount.add_line(insert(init));

		if (!parent_node) {
			block.builders.destroy.add_conditional('detaching', needs_anchor_before
				? `${detach}\n@detach(${anchor_before});`
				: detach);
		}

		if (needs_anchor_after && anchor_before !== 'null') {
			// ...otherwise it should go afterwards
			add_anchor_after();
		}
	}
}
