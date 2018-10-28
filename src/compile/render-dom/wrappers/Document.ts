import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Wrapper from './shared/Wrapper';
import deindent from '../../../utils/deindent';
import Document from '../../nodes/Document';

export default class DocumentWrapper extends Wrapper {
	node: Document;

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Node) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;
		const { component } = renderer;

		this.node.handlers.forEach(handler => {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			component.addSourcemapLocations(handler.expression);

			const isCustomEvent = component.events.has(handler.name);

			let usesState = handler.dependencies.size > 0;

			handler.render(component, block, 'document', false); // TODO hoist?

			const handlerName = block.getUniqueName(`onwindow${handler.name}`);
			const handlerBody = deindent`
				${usesState && `var ctx = #component.get();`}
				${handler.snippet};
			`;

			if (isCustomEvent) {
				// TODO dry this out
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${handler.name}.call(#component, document, function(event) {
						${handlerBody}
					});
				`);

				block.builders.destroy.addLine(deindent`
					${handlerName}.destroy();
				`);
			} else {
				block.builders.init.addBlock(deindent`
					function ${handlerName}(event) {
						${handlerBody}
					}
					document.addEventListener("${handler.name}", ${handlerName});
				`);

				block.builders.destroy.addBlock(deindent`
					document.removeEventListener("${handler.name}", ${handlerName});
				`);
			}
		});
	}
}