import Block from '../../Block';
import EventHandler from '../../../nodes/EventHandler';
import { x } from 'code-red';

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

		// let opts_string = '';

		// if (block.renderer.options.dev) {
		// 	if (handler.modifiers.has('stopPropagation')) {
		// 		opts_string = ', true';
		// 	}

		// 	if (handler.modifiers.has('preventDefault')) {
		// 		opts_string = ', true' + opts_string;
		// 	} else if (opts_string) {
		// 		opts_string = ', false' + opts_string;
		// 	}
		// }

		// const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));
		// if (opts.length) {
		// 	opts_string = (opts.length === 1 && opts[0] === 'capture')
		// 		? ', true'
		// 		: `, { ${opts.map(opt => `${opt}: true`).join(', ')} }`;
		// } else if (opts_string) {
		// 	opts_string = ', false' + opts_string;
		// }

		// TODO modifiers

		block.event_listeners.push(
			x`@listen(${target}, "${handler.name}", ${snippet})`
		);
	});
}
