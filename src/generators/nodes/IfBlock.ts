import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import { State } from '../dom/interfaces';
import createDebuggingComment from '../../utils/createDebuggingComment';

function isElseIf(node: Node) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

export default class IfBlock extends Node {
	init(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		const { generator } = this;

		this.cannotUseInnerHTML();

		const blocks: Block[] = [];
		let dynamic = false;
		let hasIntros = false;
		let hasOutros = false;

		function attachBlocks(node: Node) {
			node.var = block.getUniqueName(`if_block`);

			block.addDependencies(node.metadata.dependencies);

			node._block = block.child({
				comment: createDebuggingComment(node, generator),
				name: generator.getUniqueName(`create_if_block`),
			});

			node._state = state.child();

			blocks.push(node._block);
			node.initChildren(node._block, node._state, inEachBlock, elementStack, componentStack, stripWhitespace, nextSibling);

			if (node._block.dependencies.size > 0) {
				dynamic = true;
				block.addDependencies(node._block.dependencies);
			}

			if (node._block.hasIntroMethod) hasIntros = true;
			if (node._block.hasOutroMethod) hasOutros = true;

			if (isElseIf(node.else)) {
				attachBlocks(node.else.children[0]);
			} else if (node.else) {
				node.else._block = block.child({
					comment: createDebuggingComment(node.else, generator),
					name: generator.getUniqueName(`create_if_block`),
				});

				node.else._state = state.child();

				blocks.push(node.else._block);
				node.else.initChildren(
					node.else._block,
					node.else._state,
					inEachBlock,
					elementStack,
					componentStack,
					stripWhitespace,
					nextSibling
				);

				if (node.else._block.dependencies.size > 0) {
					dynamic = true;
					block.addDependencies(node.else._block.dependencies);
				}
			}
		}

		attachBlocks(this);

		blocks.forEach(block => {
			block.hasUpdateMethod = dynamic;
			block.hasIntroMethod = hasIntros;
			block.hasOutroMethod = hasOutros;
		});

		generator.blocks.push(...blocks);
	}
}