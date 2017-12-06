import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import { State } from '../dom/interfaces';
import createDebuggingComment from '../../utils/createDebuggingComment';

export default class AwaitBlock extends Node {
	value: string;
	error: string;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

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

		this.var = block.getUniqueName('await_block');
		block.addDependencies(this.metadata.dependencies);

		let dynamic = false;

		[
			['pending', null],
			['then', this.value],
			['catch', this.error]
		].forEach(([status, arg]) => {
			const child = this[status];

			const context = block.getUniqueName(arg || '_');
			const contexts = new Map(block.contexts);
			contexts.set(arg, context);

			child._block = block.child({
				comment: createDebuggingComment(child, this.generator),
				name: this.generator.getUniqueName(`create_${status}_block`),
				params: block.params.concat(context),
				context,
				contexts
			});

			child._state = state.child();

			child.initChildren(child._block, child._state, inEachBlock, elementStack, componentStack, stripWhitespace, nextSibling);
			this.generator.blocks.push(child._block);

			if (child._block.dependencies.size > 0) {
				dynamic = true;
				block.addDependencies(child._block.dependencies);
			}
		});

		this.pending._block.hasUpdateMethod = dynamic;
		this.then._block.hasUpdateMethod = dynamic;
		this.catch._block.hasUpdateMethod = dynamic;
	}
}