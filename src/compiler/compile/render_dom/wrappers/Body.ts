import Block from '../Block';
import Wrapper from './shared/Wrapper';
import { b } from 'code-red';
import Body from '../../nodes/Body';
import { Identifier } from 'estree';

export default class BodyWrapper extends Wrapper {
	node: Body;

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		this.node.handlers.forEach(handler => {
			const snippet = handler.render(block);

			block.chunks.init.push(b`
				@_document.body.addEventListener("${handler.name}", ${snippet});
			`);

			block.chunks.destroy.push(b`
				@_document.body.removeEventListener("${handler.name}", ${snippet});
			`);
		});
	}
}
