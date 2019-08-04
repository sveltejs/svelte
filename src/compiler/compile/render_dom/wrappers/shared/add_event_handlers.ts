import Block from '../../Block';
import EventHandler from '../../../nodes/EventHandler';

export default function add_event_handlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => {
		let snippet = handler.render(block);
		if (handler.modifiers.has('preventDefault')) snippet = `@prevent_default(${snippet})`;
		if (handler.modifiers.has('stopPropagation')) snippet = `@stop_propagation(${snippet})`;

		const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));

		if (opts.length) {
			const opts_string = (opts.length === 1 && opts[0] === 'capture')
				? 'true'
				: `{ ${opts.map(opt => `${opt}: true`).join(', ')} }`;

			block.event_listeners.push(
				`@listen(${target}, "${handler.name}", ${snippet}, ${opts_string})`
			);
		} else if (handler.name === '$$any') {
			block.any_event_elements.push(target);
			// This isn't required but listen is treeshaken otherwise
			block.event_listeners.push(`@listen`);
		} else {
			block.event_listeners.push(
				`@listen(${target}, "${handler.name}", ${snippet})`
			);
		}
	});
}