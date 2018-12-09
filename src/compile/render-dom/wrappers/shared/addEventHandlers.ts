import Block from '../../Block';
import EventHandler from '../../../nodes/EventHandler';

export default function addEventHandlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => {
		const modifiers = [];
		if (handler.modifiers.has('preventDefault')) modifiers.push('event.preventDefault();');
		if (handler.modifiers.has('stopPropagation')) modifiers.push('event.stopPropagation();');

		const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));

		const snippet = handler.render();

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

		if (handler.expression) {
			handler.expression.declarations.forEach(declaration => {
				block.builders.init.addBlock(declaration);
			});
		}
	});
}