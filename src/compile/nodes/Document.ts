import Node from './shared/Node';
import EventHandler from './EventHandler';

export default class Document extends Node {
	type: 'Document';
	handlers: EventHandler[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.handlers = [];

		info.attributes.forEach(node => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
			}

			else {
				// TODO there shouldn't be anything else here...
			}
		});
	}
}
