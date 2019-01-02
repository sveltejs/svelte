import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Title from '../../nodes/Title';
import FragmentWrapper from './Fragment';
import { stringify } from '../../../utils/stringify';
import addToSet from '../../../utils/addToSet';

export default class TitleWrapper extends Wrapper {
	node: Title;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Title,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const isDynamic = !!this.node.children.find(node => node.type !== 'Text');

		if (isDynamic) {
			let value;

			const allDependencies = new Set();

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.node.children.length === 1) {
				// single {tag} — may be a non-string
				const { expression } = this.node.children[0];
				value = expression.render(block);
				addToSet(allDependencies, expression.dynamic_dependencies);
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value =
					(this.node.children[0].type === 'Text' ? '' : `"" + `) +
					this.node.children
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								const snippet = chunk.expression.render(block);

								chunk.expression.dynamic_dependencies.forEach(d => {
									allDependencies.add(d);
								});

								return chunk.expression.getPrecedence() <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');
			}

			const last = this.node.shouldCache && block.getUniqueName(
				`title_value`
			);

			if (this.node.shouldCache) block.addVariable(last);

			let updater;
			const init = this.node.shouldCache ? `${last} = ${value}` : value;

			block.builders.init.addLine(
				`document.title = ${init};`
			);
			updater = `document.title = ${this.node.shouldCache ? last : value};`;

			if (allDependencies.size) {
				const dependencies = Array.from(allDependencies);
				const changedCheck = (
					( block.hasOutros ? `!#current || ` : '' ) +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const updateCachedValue = `${last} !== (${last} = ${value})`;

				const condition = this.node.shouldCache ?
					( dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue ) :
					changedCheck;

				block.builders.update.addConditional(
					condition,
					updater
				);
			}
		} else {
			const value = stringify(this.node.children[0].data);
			block.builders.hydrate.addLine(`document.title = ${value};`);
		}
	}
}