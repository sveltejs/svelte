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

		let opts_string = '';

		if (block.renderer.options.dev) {
			if (handler.modifiers.has('stopPropagation')) {
				opts_string = ', true';
			}

			if (handler.modifiers.has('preventDefault')) {
				opts_string = ', true' + opts_string;
			} else if (opts_string) {
				opts_string = ', false' + opts_string;
			}
		}

		const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));
		if (opts.length) {
			opts_string = (opts.length === 1 && opts[0] === 'capture')
				? ', true'
				: `, { ${opts.map(opt => `${opt}: true`).join(', ')} }`;
		} else if (opts_string) {
			opts_string = ', false' + opts_string;
		}

		block.event_listeners.push(
			`@listen(${target}, "${handler.name}", ${snippet}${opts_string})`
		);
	});
}
