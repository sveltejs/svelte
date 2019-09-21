import Block from '../../Block';
import EventHandler from '../../../nodes/EventHandler';
import { x, p } from 'code-red';

const TRUE = x`true`;
const FALSE = x`false`;

export default function add_event_handlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => {
		let snippet = handler.render(block);
		if (handler.modifiers.has('preventDefault')) snippet = x`@prevent_default(${snippet})`;
		if (handler.modifiers.has('stopPropagation')) snippet = x`@stop_propagation(${snippet})`;
		if (handler.modifiers.has('self')) snippet = x`@self(${snippet})`;

		const args = [];

		const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));
		if (opts.length) {
			args.push((opts.length === 1 && opts[0] === 'capture')
				? TRUE
				: x`{ ${opts.map(opt => p`${opt}: true`)} }`);
		} else if (block.renderer.options.dev) {
			args.push(FALSE);
		}

		if (block.renderer.options.dev) {
			args.push(handler.modifiers.has('stopPropagation') ? TRUE : FALSE);
			args.push(handler.modifiers.has('preventDefault') ? TRUE : FALSE);
		}

		block.event_listeners.push(
			x`@listen(${target}, "${handler.name}", ${snippet}, ${args})`
		);
	});
}
