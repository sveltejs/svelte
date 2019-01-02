import Block from '../../Block';
import EventHandler from '../../../nodes/EventHandler';

export default function addEventHandlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => {
		let snippet = handler.render(block);
		if (handler.modifiers.has('preventDefault')) snippet = `@preventDefault(${snippet})`;
		if (handler.modifiers.has('stopPropagation')) snippet = `@stopPropagation(${snippet})`;

		const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));

		if (opts.length) {
			const optString = (opts.length === 1 && opts[0] === 'capture')
				? 'true'
				: `{ ${opts.map(opt => `${opt}: true`).join(', ')} }`;

			block.event_listeners.push(
				`@addListener(${target}, "${handler.name}", ${snippet}, ${optString})`
			);
		} else {
			block.event_listeners.push(
				`@addListener(${target}, "${handler.name}", ${snippet})`
			);
		}
	});
}