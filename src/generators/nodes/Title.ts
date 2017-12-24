import { stringify } from '../../utils/stringify';
import getExpressionPrecedence from '../../utils/getExpressionPrecedence';
import Node from './shared/Node';
import Block from '../dom/Block';

export default class Title extends Node {
	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const isDynamic = !!this.children.find(node => node.type !== 'Text');

		if (isDynamic) {
			let value;

			const allDependencies = new Set();
			let shouldCache;

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.children.length === 1) {
				// single {{tag}} — may be a non-string
				const { expression } = this.children[0];
				const { indexes } = block.contextualise(expression);
				const { dependencies, snippet } = this.children[0].metadata;

				value = snippet;
				dependencies.forEach(d => {
					allDependencies.add(d);
				});

				shouldCache = (
					expression.type !== 'Identifier' ||
					block.contexts.has(expression.name)
				);
			} else {
				// '{{foo}} {{bar}}' — treat as string concatenation
				value =
					(this.children[0].type === 'Text' ? '' : `"" + `) +
					this.children
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								const { indexes } = block.contextualise(chunk.expression);
								const { dependencies, snippet } = chunk.metadata;

								dependencies.forEach(d => {
									allDependencies.add(d);
								});

								return getExpressionPrecedence(chunk.expression) <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');

				shouldCache = true;
			}

			const last = shouldCache && block.getUniqueName(
				`title_value`
			);

			if (shouldCache) block.addVariable(last);

			let updater;
			const init = shouldCache ? `${last} = ${value}` : value;

			block.builders.init.addLine(
				`document.title = ${init};`
			);
			updater = `document.title = ${shouldCache ? last : value};`;

			if (allDependencies.size) {
				const dependencies = Array.from(allDependencies);
				const changedCheck = (
					( block.hasOutroMethod ? `#outroing || ` : '' ) +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const updateCachedValue = `${last} !== (${last} = ${value})`;

				const condition = shouldCache ?
					( dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue ) :
					changedCheck;

				block.builders.update.addConditional(
					condition,
					updater
				);
			}
		} else {
			const value = stringify(this.children[0].data);
			block.builders.hydrate.addLine(`document.title = ${value};`);
		}
	}
}