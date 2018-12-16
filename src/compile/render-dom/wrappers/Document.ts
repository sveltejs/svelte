import Block from '../Block';
import Wrapper from './shared/Wrapper';
import deindent from '../../../utils/deindent';
import Document from '../../nodes/Document';

export default class DocumentWrapper extends Wrapper {
	node: Document;

	render(block: Block, parentNode: string, parentNodes: string) {
		this.node.handlers.forEach(handler => {
			const snippet = handler.render();

			block.builders.init.addBlock(deindent`
				document.addEventListener("${handler.name}", ${snippet});
			`);

			block.builders.destroy.addBlock(deindent`
				document.removeEventListener("${handler.name}", ${snippet});
			`);
		});
	}
}