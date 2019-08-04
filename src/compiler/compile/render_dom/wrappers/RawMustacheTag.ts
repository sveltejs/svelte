import Renderer from '../Renderer';
import Block from '../Block';
import Tag from './shared/Tag';
import Wrapper from './shared/Wrapper';
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

	render(block: Block, parent_node: string, _parent_nodes: string) {
		const in_head = parent_node === '@_document.head';

		const can_use_innerhtml = !in_head && parent_node && !this.prev && !this.next;

		if (can_use_innerhtml) {
			const insert = content => `${parent_node}.innerHTML = ${content};`;

			const { init } = this.rename_this_method(
				block,
				content => insert(content)
			);

			block.builders.mount.add_line(insert(init));
		}

		else {
			const needs_anchor = in_head || (this.next && !this.next.is_dom_node());

			const html_tag = block.get_unique_name('html_tag');
			const html_anchor = needs_anchor && block.get_unique_name('html_anchor');

			block.add_variable(html_tag);

			const { init } = this.rename_this_method(
				block,
				content => `${html_tag}.p(${content});`
			);

			const anchor = in_head ? 'null' : needs_anchor ? html_anchor : this.next ? this.next.var : 'null';

			block.builders.hydrate.add_line(`${html_tag} = new @HtmlTag(${init}, ${anchor});`);
			block.builders.mount.add_line(`${html_tag}.m(${parent_node || '#target'}, anchor);`);

			if (needs_anchor) {
				block.add_element(html_anchor, '@empty()', '@empty()', parent_node);
			}

			if (!parent_node || in_head) {
				block.builders.destroy.add_conditional('detaching', `${html_tag}.d();`);
			}
		}
	}
}
