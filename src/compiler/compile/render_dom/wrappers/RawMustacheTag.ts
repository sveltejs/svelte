import { namespaces } from '../../../utils/namespaces.js';
import { b, x } from 'code-red';
import Tag from './shared/Tag.js';
import { is_head } from './shared/is_head.js';

/** @extends Tag */
export default class RawMustacheTagWrapper extends Tag {
	/** @type {import('estree').Identifier} */
	var = { type: 'Identifier', name: 'raw' };

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/MustacheTag.js').default | import('../../nodes/RawMustacheTag.js').default} node
	 */
	constructor(renderer, block, parent, node) {
		super(renderer, block, parent, node);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 */
	render(block, parent_node, _parent_nodes) {
		const in_head = is_head(parent_node);
		const can_use_innerhtml = !in_head && parent_node && !this.prev && !this.next;
		if (can_use_innerhtml) {
			/** @param {import('estree').Node} content */
			const insert = (content) => b`${parent_node}.innerHTML = ${content};`[0];
			const { init } = this.rename_this_method(block, (content) => insert(content));
			block.chunks.mount.push(insert(init));
		} else {
			const needs_anchor =
				in_head ||
				(this.next ? !this.next.is_dom_node() : !this.parent || !this.parent.is_dom_node());
			const html_tag = block.get_unique_name('html_tag');
			const html_anchor = needs_anchor && block.get_unique_name('html_anchor');
			block.add_variable(html_tag);
			const { init } = this.rename_this_method(block, (content) => x`${html_tag}.p(${content})`);
			const update_anchor = needs_anchor ? html_anchor : this.next ? this.next.var : 'null';
			const parent_element = /** @type {import('../../nodes/Element.js').default} */ (
				this.node.find_nearest(/^Element/)
			);
			const is_svg = parent_element && parent_element.namespace === namespaces.svg;
			block.chunks.create.push(b`${html_tag} = new @HtmlTag(${is_svg ? 'true' : 'false'});`);
			if (this.renderer.options.hydratable) {
				block.chunks.claim.push(
					b`${html_tag} = @claim_html_tag(${_parent_nodes}, ${is_svg ? 'true' : 'false'});`
				);
			}
			block.chunks.hydrate.push(b`${html_tag}.a = ${update_anchor};`);
			block.chunks.mount.push(
				b`${html_tag}.m(${init}, ${parent_node || '#target'}, ${parent_node ? null : '#anchor'});`
			);
			if (needs_anchor) {
				block.add_element(html_anchor, x`@empty()`, x`@empty()`, parent_node);
			}
			if (!parent_node || in_head) {
				block.chunks.destroy.push(b`if (detaching) ${html_tag}.d();`);
			}
		}
	}
}
