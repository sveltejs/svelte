import deindent from '../../utils/deindent';
import { DomGenerator } from '../dom/index';
import Node from './shared/Node';
import Element from './Element';
import Block from '../dom/Block';

export default class Spread {
	type: 'Spread';
	start: number;
	end: number;

	generator: DomGenerator;
	parent: Element;
	expression: Node;

	metadata: {
		dependencies: string[];
		snippet: string;
	};

	constructor({
		generator,
		expression,
		parent
	}: {
		generator: DomGenerator,
		expression: Node,
		parent: Element
	}) {
		this.type = 'Spread';
		this.generator = generator;
		this.parent = parent;

		this.expression = expression;
	}

	renderForElement(block: Block) {
		const node = this.parent;

		const { expression } = this;
		const { indexes } = block.contextualise(expression);
		const { dependencies, snippet } = this.metadata;

		const value = snippet;

		const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

		const shouldCache = (
			expression.type !== 'Identifier' ||
			block.contexts.has(expression.name) ||
			hasChangeableIndex
		);

		const last = shouldCache && block.getUniqueName(`${node.var}_spread_value`);

		if (shouldCache) block.addVariable(last);

		const init = shouldCache ? `${last} = ${value}` : value;

		const activeKeys = block.getUniqueName(`${node.var}_spread_keys`);
		block.addVariable(activeKeys, '{}');

		const changes = block.getUniqueName(`${node.var}_spread_changes`);

		const namedAttributes = block.getUniqueName(`${node.var}_attributes`);
		block.builders.init.addBlock(deindent`
			var ${namedAttributes} = [${node.attributes.map(attr => `'${attr.name}'`).join(', ')}];
		`)

		block.builders.hydrate.addBlock(deindent`
			var ${changes} = ${init};
			for (var key in ${changes}) {
				if (${namedAttributes}.indexOf(key) !== -1) continue;

				@setAttribute(${node.var}, key, ${changes}[key]);
				${activeKeys}[key] = true;
			}
		`);

		if (dependencies.length || hasChangeableIndex) {
			const changedCheck = (
				( block.hasOutroMethod ? `#outroing || ` : '' ) +
				dependencies.map(dependency => `changed.${dependency}`).join(' || ')
			);

			const updateCachedValue = `${last} !== (${last} = ${value})`;

			const condition = shouldCache ?
				( dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue ) :
				changedCheck;

			const oldKeys = block.getUniqueName(`${node.var}_spread_keys_old`);

			const updater = deindent`
				var ${oldKeys} = ${activeKeys};
				${activeKeys} = {};

				var ${changes} = ${shouldCache ? last : value};
				for (var key in ${changes}) {
					if (${namedAttributes}.indexOf(key) !== -1) continue;

					@setAttribute(${node.var}, key, ${changes}[key]);

					${activeKeys}[key] = true;
					delete ${oldKeys}[key];
				}

				for (var key in ${oldKeys}) {
					@removeAttribute(${node.var}, key);
				}
			`;

			block.builders.update.addConditional(
				condition,
				updater
			);
		}
	}

	renderForComponent(block: Block, updates: string[]) {
		const node = this.parent;

		const { expression } = this;
		const { indexes } = block.contextualise(expression);
		const { dependencies, snippet } = this.metadata;

		const value = snippet;

		const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

		const shouldCache = (
			expression.type !== 'Identifier' ||
			block.contexts.has(expression.name) ||
			hasChangeableIndex
		);

		const last = shouldCache && block.getUniqueName(`${node.var}_spread_value`);

		if (shouldCache) block.addVariable(last);

		const init = shouldCache ? `${last} = ${value}` : value;

		const activeKeys = block.getUniqueName(`${node.var}_spread_keys`);
		block.addVariable(activeKeys, '{}');

		const changes = block.getUniqueName(`${node.var}_spread_changes`);

		const namedAttributes = block.getUniqueName(`${node.var}_attributes`);
		block.builders.init.addBlock(deindent`
			var ${namedAttributes} = [${node.attributes.map(attr => `'${attr.name}'`).join(', ')}];
		`)

		if (dependencies.length || hasChangeableIndex) {
			const changedCheck = (
				( block.hasOutroMethod ? `#outroing || ` : '' ) +
				dependencies.map(dependency => `changed.${dependency}`).join(' || ')
			);

			const updateCachedValue = `${last} !== (${last} = ${value})`;

			const condition = shouldCache ?
				( dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue ) :
				changedCheck;

			const oldKeys = block.getUniqueName(`${node.var}_spread_keys_old`);

			updates.push(deindent`
				if (${condition}) {
					var ${oldKeys} = ${activeKeys};
					${activeKeys} = {};

					var ${changes} = ${shouldCache ? last : value};
					for (var key in ${changes}) {
						if (${namedAttributes}.indexOf(key) !== -1) continue;

						${node.var}_changes[key] = ${changes}[key];

						${activeKeys}[key] = true;
						delete ${oldKeys}[key];
					}

					for (var key in ${oldKeys}) {
						${node.var}_changes[key] = undefined;
					}
				}
			`);
		}

		return value;
	}
}
