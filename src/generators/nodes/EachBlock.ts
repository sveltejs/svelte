import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import State from '../dom/State';
import visitEachBlock from '../dom/visitors/EachBlock';
import createDebuggingComment from '../../utils/createDebuggingComment';

export default class EachBlock extends Node {
	_block: Block;
	_state: State;
	expression: Node;

	iterations: string;
	index: string;
	context: string;
	key: string;
	destructuredContexts: string[];

	else?: ElseBlock;

	init(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName(`each`);
		this.iterations = block.getUniqueName(`${this.var}_blocks`);

		const { dependencies } = this.metadata;
		block.addDependencies(dependencies);

		const indexNames = new Map(block.indexNames);
		const indexName =
			this.index || block.getUniqueName(`${this.context}_index`);
		indexNames.set(this.context, indexName);

		const listNames = new Map(block.listNames);
		const listName = block.getUniqueName(
			(this.expression.type === 'MemberExpression' && !this.expression.computed) ? this.expression.property.name :
			this.expression.type === 'Identifier' ? this.expression.name :
			`each_value`
		);
		listNames.set(this.context, listName);

		const context = block.getUniqueName(this.context);
		const contexts = new Map(block.contexts);
		contexts.set(this.context, context);

		const indexes = new Map(block.indexes);
		if (this.index) indexes.set(this.index, this.context);

		const changeableIndexes = new Map(block.changeableIndexes);
		if (this.index) changeableIndexes.set(this.index, this.key);

		if (this.destructuredContexts) {
			for (let i = 0; i < this.destructuredContexts.length; i += 1) {
				contexts.set(this.destructuredContexts[i], `${context}[${i}]`);
			}
		}

		this._block = block.child({
			comment: createDebuggingComment(this, this.generator),
			name: this.generator.getUniqueName('create_each_block'),
			context: this.context,
			key: this.key,

			contexts,
			indexes,
			changeableIndexes,

			listName,
			indexName,

			indexNames,
			listNames,
			params: block.params.concat(listName, context, indexName),
		});

		this._state = state.child({
			inEachBlock: true,
		});

		this.generator.blocks.push(this._block);
		this.initChildren(this._block, this._state, true, elementStack, componentStack, stripWhitespace, nextSibling);
		block.addDependencies(this._block.dependencies);
		this._block.hasUpdateMethod = this._block.dependencies.size > 0;

		if (this.else) {
			this.else._block = block.child({
				comment: '// TODO', // createDebuggingComment(this.else, generator),
				name: this.generator.getUniqueName(`${this._block.name}_else`),
			});

			this.else._state = state.child();

			this.generator.blocks.push(this.else._block);
			this.else.initChildren(
				this.else._block,
				this.else._state,
				inEachBlock,
				elementStack,
				componentStack,
				stripWhitespace,
				nextSibling
			);
			this.else._block.hasUpdateMethod = this.else._block.dependencies.size > 0;
		}
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		visitEachBlock(this.generator, block, state, this, elementStack, componentStack);
	}
}