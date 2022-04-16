import { namespaces } from './../../../utils/namespaces';
import { b, x } from 'code-red';
import Renderer from '../Renderer';
import Block from '../Block';
import Tag from './shared/Tag';
import Wrapper from './shared/Wrapper';
import Element from '../../nodes/Element';
import MustacheTag from '../../nodes/MustacheTag';
import RawMustacheTag from '../../nodes/RawMustacheTag';
import { is_head } from './shared/is_head';
import { Identifier } from 'estree';

export default class RawMustacheTagWrapper extends Tag {
	var: Identifier = { type: 'Identifier', name: 'raw' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: MustacheTag | RawMustacheTag
	) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();
		this.not_static_content();
	}

	render(block: Block, parent_node: Identifier, _parent_nodes: Identifier) {
		const in_head = is_head(parent_node);

		const can_use_innerhtml = !in_head && parent_node && !this.prev && !this.next;

		if (can_use_innerhtml) {
			const insert = content => b`${parent_node}.innerHTML = ${content};`[0];

			const { init } = this.rename_this_method(
				block,
				content => insert(content)
			);

			block.chunks.mount.push(insert(init));
		} else {
			const needs_anchor = in_head || (this.next ? !this.next.is_dom_node() : (!this.parent || !this.parent.is_dom_node()));

			const html_tag = block.get_unique_name('html_tag');
			const html_anchor = needs_anchor && block.get_unique_name('html_anchor');

			block.add_variable(html_tag);

			const { init } = this.rename_this_method(
				block,
				content => x`${html_tag}.p(${content})`
			);

			const update_anchor = needs_anchor ? html_anchor : this.next ? this.next.var : 'null';

			const parent_element = this.node.find_nearest(/^Element/) as Element;
			const is_svg = parent_element && parent_element.namespace === namespaces.svg;
			block.chunks.create.push(b`${html_tag} = new @HtmlTag(${is_svg ? 'true' : 'false'});`);

			if (this.renderer.options.hydratable) {
				block.chunks.claim.push(b`${html_tag} = @claim_html_tag(${_parent_nodes}, ${is_svg ? 'true' : 'false'});`);
			}
			block.chunks.hydrate.push(b`${html_tag}.a = ${update_anchor};`);
			block.chunks.mount.push(b`${html_tag}.m(${init}, ${parent_node || '#target'}, ${parent_node ? null : '#anchor'});`);

			if (needs_anchor) {
				block.add_element(html_anchor, x`@empty()`, x`@empty()`, parent_node);
			}

			if (!parent_node || in_head) {
				block.chunks.destroy.push(b`if (detaching) ${html_tag}.d();`);
			}
		}
	}
}
