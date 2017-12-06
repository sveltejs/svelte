import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import State from '../dom/State';

export default class Fragment extends Node {
	block: Block;
	state: State;
	children: Node[];

	init(
		namespace: string
	) {
		this.block = new Block({
			generator: this.generator,
			name: '@create_main_fragment',
			key: null,

			contexts: new Map(),
			indexes: new Map(),
			changeableIndexes: new Map(),

			params: ['state'],
			indexNames: new Map(),
			listNames: new Map(),

			dependencies: new Set(),
		});

		this.state = new State({
			namespace,
			parentNode: null,
			parentNodes: 'nodes'
		});

		this.generator.blocks.push(this.block);
		this.initChildren(this.block, this.state, false, [], [], true, null);

		this.block.hasUpdateMethod = true;
	}
}