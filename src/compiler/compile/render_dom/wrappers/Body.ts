import Block from '../Block';
import Wrapper from './shared/Wrapper';
import deindent from '../../utils/deindent';
import Body from '../../nodes/Body';

export default class BodyWrapper extends Wrapper {
	node: Body;

	render(block: Block, _parent_node: string, _parent_nodes: string) {
		this.node.handlers.forEach(handler => {
			const snippet = handler.render(block);

			block.builders.init.add_block(deindent`
				@_document.body.addEventListener("${handler.name}", ${snippet});
			`);

			block.builders.destroy.add_block(deindent`
				@_document.body.removeEventListener("${handler.name}", ${snippet});
			`);
		});
	}
}
