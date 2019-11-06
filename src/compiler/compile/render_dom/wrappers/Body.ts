import Block from '../Block';
import Wrapper from './shared/Wrapper';
import { b } from 'code-red';
import Body from '../../nodes/Body';
import { Identifier } from 'estree';
import EventHandler from './Element/EventHandler';

export default class BodyWrapper extends Wrapper {
	node: Body;

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		this.node.handlers
			.map(handler => new EventHandler(handler, this))
			.forEach(handler => {
				const snippet = handler.get_snippet(block);

				block.chunks.init.push(b`
					@_document.body.addEventListener("${handler.node.name}", ${snippet});
				`);

				block.chunks.destroy.push(b`
					@_document.body.removeEventListener("${handler.node.name}", ${snippet});
				`);
			});
	}
}
