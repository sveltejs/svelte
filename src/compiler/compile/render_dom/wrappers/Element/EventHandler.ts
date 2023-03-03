import EventHandler from '../../../nodes/EventHandler';
import Wrapper from '../shared/Wrapper';
import Block from '../../Block';
import { x, p } from 'code-red';
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

	
	get_snippet(block: Block) {
		return this.node.expression.manipulate(block);
	}



	render(block: Block, target: string | Expression, is_comp: boolean = false) {
		const listen = is_comp ? '@listen_comp' : '@listen';
		if (!this.node.expression) {
			const self = this.parent.renderer.add_to_context('$$self');
			const selfvar = block.renderer.reference(self.name);
			const aliasName = this.node.aliasName ? `"${this.node.aliasName}"` : null;
			
			block.event_listeners.push(x`@bubble(${selfvar}, ${listen}, ${target}, "${this.node.name}", ${aliasName})`);
			return;
		}

		const snippet = this.get_snippet(block);

		let wrappers = [];
		if (this.node.modifiers.has('trusted')) wrappers.push(x`@trusted`);
		if (this.node.modifiers.has('self')) wrappers.push(x`@self`);
		if (this.node.modifiers.has('stopImmediatePropagation')) wrappers.push(x`@stop_immediate_propagation`);
		if (this.node.modifiers.has('stopPropagation')) wrappers.push(x`@stop_propagation`);
		if (this.node.modifiers.has('preventDefault')) wrappers.push(x`@prevent_default`);
		// TODO : once() on component ????

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
		} else if (wrappers.length) {
			args.push(FALSE);
		}
		if (wrappers.length) {
			args.push(x`[${wrappers}]`);
		}

		if (this.node.reassigned) {
			const index = block.event_listeners.length;
			const condition = block.renderer.dirty(this.node.expression.dynamic_dependencies());

			block.event_updaters.push({condition, index});
			block.event_listeners.push(
				x`@listen_and_update( () => (${snippet}), (h) => ${listen}(${target}, "${this.node.name}", h, ${args}))`
			);
		} else {
			block.event_listeners.push(
				x`${listen}(${target}, "${this.node.name}", ${snippet}, ${args})`
			);
		}
	}
}
