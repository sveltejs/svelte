import EventHandler from '../../../nodes/EventHandler';
import Wrapper from '../shared/Wrapper';
import Block from '../../Block';
import { b, x, p } from 'code-red';
import { Expression } from 'estree';

const TRUE = x`true`;
const FALSE = x`false`;

export default class EventHandlerWrapper {
	node: EventHandler;
	parent: Wrapper;

	constructor(node: EventHandler, parent: Wrapper) {
		this.node = node;
		this.parent = parent;

		if (!node.expression) {
			this.parent.renderer.add_to_context(node.handler_name.name);

			this.parent.renderer.component.partly_hoisted.push(b`
				function ${node.handler_name.name}(event) {
					@bubble.call(this, $$self, event);
				}
			`);
		}
	}

	get_snippet(block: Block) {
		const snippet = this.node.expression ? this.node.expression.manipulate(block) : block.renderer.reference(this.node.handler_name);

		if (this.node.reassigned) {
			block.maintain_context = true;
			return x`function () { if (@is_function(${snippet})) ${snippet}.apply(this, arguments); }`;
		}
		return snippet;
	}

	render(block: Block, target: string | Expression) {
		let snippet = this.get_snippet(block);

		if (this.node.modifiers.has('preventDefault')) snippet = x`@prevent_default(${snippet})`;
		if (this.node.modifiers.has('stopPropagation')) snippet = x`@stop_propagation(${snippet})`;
		if (this.node.modifiers.has('self')) snippet = x`@self(${snippet})`;
		if (this.node.modifiers.has('trusted')) snippet = x`@trusted(${snippet})`;

		const args = [];

		const opts = ['nonpassive', 'passive', 'once', 'capture'].filter(mod => this.node.modifiers.has(mod));
		if (opts.length) {
			if (opts.length === 1 && opts[0] === 'capture') {
				args.push(TRUE);
			} else {
				args.push(x`{ ${ opts.map(opt =>
					opt === 'nonpassive'
						? p`passive: false`
						: p`${opt}: true`
				) } }`);
			}
		} else if (block.renderer.options.dev) {
			args.push(FALSE);
		}

		if (block.renderer.options.dev) {
			args.push(this.node.modifiers.has('preventDefault') ? TRUE : FALSE);
			args.push(this.node.modifiers.has('stopPropagation') ? TRUE : FALSE);
		}

		block.event_listeners.push(
			x`@listen(${target}, "${this.node.name}", ${snippet}, ${args})`
		);
	}
}
