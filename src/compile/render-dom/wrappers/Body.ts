import Block from '../Block';
import Wrapper from './shared/Wrapper';
import deindent from '../../../utils/deindent';
import Body from '../../nodes/Body';

export default class BodyWrapper extends Wrapper {
	node: Body;

	render(block: Block, parentNode: string, parentNodes: string) {
		this.node.handlers.forEach(handler => {
			const snippet = handler.render(block);

			block.builders.init.addBlock(deindent`
				document.body.addEventListener("${handler.name}", ${snippet});
			`);

			block.builders.destroy.addBlock(deindent`
				document.body.removeEventListener("${handler.name}", ${snippet});
			`);
		});
	}
}
