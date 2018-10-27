import Node from './shared/Node';
import Binding from './Binding';
import EventHandler from './EventHandler';
import flattenReference from '../../utils/flattenReference';
import fuzzymatch from '../validate/utils/fuzzymatch';
import list from '../../utils/list';

const validBindings = [
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'scrollX',
	'scrollY',
	'online'
];

export default class Window extends Node {
	type: 'Window';
	handlers: EventHandler[];
	bindings: Binding[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.handlers = [];
		this.bindings = [];

		info.attributes.forEach(node => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
			}

			else if (node.type === 'Binding') {
				if (node.value.type !== 'Identifier') {
					const { parts } = flattenReference(node.value);

					component.error(node.value, {
						code: `invalid-binding`,
						message: `Bindings on <svelte:window> must be to top-level properties, e.g. '${parts[parts.length - 1]}' rather than '${parts.join('.')}'`
					});
				}

				if (!~validBindings.indexOf(node.name)) {
					const match = node.name === 'width'
						? 'innerWidth'
						: node.name === 'height'
							? 'innerHeight'
							: fuzzymatch(node.name, validBindings);

					const message = `'${node.name}' is not a valid binding on <svelte:window>`;

					if (match) {
						component.error(node, {
							code: `invalid-binding`,
							message: `${message} (did you mean '${match}'?)`
						});
					} else {
						component.error(node, {
							code: `invalid-binding`,
							message: `${message} — valid bindings are ${list(validBindings)}`
						});
					}
				}

				this.bindings.push(new Binding(component, this, scope, node));
			}

			else {
				// TODO there shouldn't be anything else here...
			}
		});
	}
}
