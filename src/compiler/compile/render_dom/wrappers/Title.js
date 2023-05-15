import { b, x } from 'code-red';
import Wrapper from './shared/Wrapper.js';
import { string_literal } from '../../utils/stringify.js';
import add_to_set from '../../utils/add_to_set.js';

/** @extends Wrapper<import('../../nodes/Title.js').default> */
export default class TitleWrapper extends Wrapper {
	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Title.js').default} node
	 * @param {boolean} _strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} _next_sibling
	 */
	constructor(renderer, block, parent, node, _strip_whitespace, _next_sibling) {
		super(renderer, block, parent, node);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} _parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 */
	render(block, _parent_node, _parent_nodes) {
		const is_dynamic = !!this.node.children.find((node) => node.type !== 'Text');
		if (is_dynamic) {
			let value;

			/** @type {Set<string>} */
			const all_dependencies = new Set();
			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.node.children.length === 1) {
				// single {tag} — may be a non-string
				// @ts-ignore todo: check this
				const { expression } = this.node.children[0];
				value = expression.manipulate(block);
				add_to_set(all_dependencies, expression.dependencies);
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value = this.node.children
					.map((chunk) => {
						if (chunk.type === 'Text') return string_literal(chunk.data);
						/** @type {import('../../nodes/MustacheTag.js').default} */ (
							chunk
						).expression.dependencies.forEach((d) => {
							all_dependencies.add(d);
						});
						return /** @type {import('../../nodes/MustacheTag.js').default} */ (
							chunk
						).expression.manipulate(block);
					})
					.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
				if (this.node.children[0].type !== 'Text') {
					value = x`"" + ${value}`;
				}
			}
			const last = this.node.should_cache && block.get_unique_name('title_value');
			if (this.node.should_cache) block.add_variable(last);
			const init = this.node.should_cache ? x`${last} = ${value}` : value;
			block.chunks.init.push(b`@_document.title = ${init};`);
			const updater = b`@_document.title = ${this.node.should_cache ? last : value};`;
			if (all_dependencies.size) {
				const dependencies = Array.from(all_dependencies);
				let condition = block.renderer.dirty(dependencies);
				if (block.has_outros) {
					condition = x`!#current || ${condition}`;
				}
				if (this.node.should_cache) {
					condition = x`${condition} && (${last} !== (${last} = ${value}))`;
				}
				block.chunks.update.push(b`
					if (${condition}) {
						${updater}
					}`);
			}
		} else {
			const value =
				this.node.children.length > 0
					? string_literal(
							/** @type {import('../../nodes/Text.js').default} */ (this.node.children[0]).data
					  )
					: x`""`;
			block.chunks.hydrate.push(b`@_document.title = ${value};`);
		}
	}
}
