import Node from './shared/Node.ts';
import EventHandler from './EventHandler.ts';

export default class Body extends Node {
	type: 'Body';
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
