import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class Title extends Node {
	type: 'Title';
	children: any[]; // TODO
	shouldCache: boolean;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.children = mapChildren(compiler, parent, scope, info.children);

		this.shouldCache = info.children.length === 1
			? (
				info.children[0].type !== 'Identifier' ||
				scope.names.has(info.children[0].name)
			)
			: true;
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const isDynamic = !!this.children.find(node => node.type !== 'Text');

		if (isDynamic) {
			let value;

			const allDependencies = new Set();

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.children.length === 1) {
				// single {{tag}} — may be a non-string
				const { expression } = this.children[0];
				const { dependencies, snippet } = this.children[0].expression;

				value = snippet;
				dependencies.forEach(d => {
					allDependencies.add(d);
				});
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value =
					(this.children[0].type === 'Text' ? '' : `"" + `) +
					this.children
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								const { dependencies, snippet } = chunk.expression;

								dependencies.forEach(d => {
									allDependencies.add(d);
								});

								return chunk.expression.getPrecedence() <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');
			}

			const last = this.shouldCache && block.getUniqueName(
				`title_value`
			);

			if (this.shouldCache) block.addVariable(last);

			let updater;
			const init = this.shouldCache ? `${last} = ${value}` : value;

			block.builders.init.addLine(
				`document.title = ${init};`
			);
			updater = `document.title = ${this.shouldCache ? last : value};`;

			if (allDependencies.size) {
				const dependencies = Array.from(allDependencies);
				const changedCheck = (
					( block.hasOutroMethod ? `#outroing || ` : '' ) +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const updateCachedValue = `${last} !== (${last} = ${value})`;

				const condition = this.shouldCache ?
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

	ssr() {
		this.compiler.append(`<title>`);

		this.children.forEach((child: Node) => {
			child.ssr();
		});

		this.compiler.append(`</title>`);
	}
}