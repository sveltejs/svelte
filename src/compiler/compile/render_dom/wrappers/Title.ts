import { b, x } from 'code-red';
import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Title from '../../nodes/Title';
import { string_literal } from '../../utils/stringify';
import add_to_set from '../../utils/add_to_set';
import Text from '../../nodes/Text';
import { Identifier } from 'estree';
import MustacheTag from '../../nodes/MustacheTag';

export default class TitleWrapper extends Wrapper {
	node: Title;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Title,
		_strip_whitespace: boolean,
		_next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		const is_dynamic = !!this.node.children.find(node => node.type !== 'Text');

		if (is_dynamic) {
			let value;

			const all_dependencies: Set<string> = new Set();

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
					.map(chunk => {
						if (chunk.type === 'Text') return string_literal(chunk.data);

						(chunk as MustacheTag).expression.dependencies.forEach(d => {
							all_dependencies.add(d);
						});

						return (chunk as MustacheTag).expression.manipulate(block);
					})
					.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

				if (this.node.children[0].type !== 'Text') {
					value = x`"" + ${value}`;
				}
			}

			const last = this.node.should_cache && block.get_unique_name(
				`title_value`
			);

			if (this.node.should_cache) block.add_variable(last);

			const init = this.node.should_cache ? x`${last} = ${value}` : value;

			block.chunks.init.push(
				b`@_document.title = ${init};`
			);

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
			const value = this.node.children.length > 0
				? string_literal((this.node.children[0] as Text).data)
				: x`""`;

			block.chunks.hydrate.push(b`@_document.title = ${value};`);
		}
	}
}
