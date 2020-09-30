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
	}

	get_snippet(block) {
		const snippet = this.node.expression.manipulate(block);

		if (this.node.reassigned) {
			block.maintain_context = true;
			return x`function () { if (@is_function(${snippet})) ${snippet}.apply(this, arguments); }`;
		}
		return snippet;
	}

	render(block: Block, target: string | Expression) {
		if (!this.node.expression) {
			if (this.node.name === '*')
				block.chunks.bubble.push(b`local_dispose.push(@listen(${target}, type, callback))`);
			else
				block.chunks.bubble.push(b`if (type === "${this.node.name}") local_dispose.push(@listen(${target}, "${this.node.name}", callback));`);

			return;
		}

		let snippet = this.get_snippet(block);

		if (this.node.modifiers.has('preventDefault')) snippet = x`@prevent_default(${snippet})`;
		if (this.node.modifiers.has('stopPropagation')) snippet = x`@stop_propagation(${snippet})`;
		if (this.node.modifiers.has('self')) snippet = x`@self(${snippet})`;

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
