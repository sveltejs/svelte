import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Title from '../../nodes/Title';
import { stringify } from '../../utils/stringify';
import add_to_set from '../../utils/add_to_set';
import Text from '../../nodes/Text';

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

	render(block: Block, _parent_node: string, _parent_nodes: string) {
		const is_dynamic = !!this.node.children.find(node => node.type !== 'Text');

		if (is_dynamic) {
			let value;

			const all_dependencies = new Set();

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.node.children.length === 1) {
				// single {tag} — may be a non-string
				// @ts-ignore todo: check this
				const { expression } = this.node.children[0];
				value = expression.render(block);
				add_to_set(all_dependencies, expression.dependencies);
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value =
					(this.node.children[0].type === 'Text' ? '' : `"" + `) +
					this.node.children
						.map((chunk) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								// @ts-ignore todo: check this
								const snippet = chunk.expression.render(block);
								// @ts-ignore todo: check this
								chunk.expression.dependencies.forEach(d => {
									all_dependencies.add(d);
								});

								// @ts-ignore todo: check this
								return chunk.expression.get_precedence() <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');
			}

			const last = this.node.should_cache && block.get_unique_name(
				`title_value`
			);

			if (this.node.should_cache) block.add_variable(last);

			const init = this.node.should_cache ? `${last} = ${value}` : value;

			block.builders.init.add_line(
				`@_document.title = ${init};`
			);
			const updater = `@_document.title = ${this.node.should_cache ? last : value};`;

			if (all_dependencies.size) {
				const dependencies = Array.from(all_dependencies);
				const changed_check = (
					(block.has_outros ? `!#current || ` : '') +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const update_cached_value = `${last} !== (${last} = ${value})`;

				const condition = this.node.should_cache ?
					(dependencies.length ? `(${changed_check}) && ${update_cached_value}` : update_cached_value) :
					changed_check;

				block.builders.update.add_conditional(
					condition,
					updater
				);
			}
		} else {
			const value = this.node.children.length > 0
				? stringify((this.node.children[0] as Text).data)
				: '""';

			block.builders.hydrate.add_line(`@_document.title = ${value};`);
		}
	}
}
