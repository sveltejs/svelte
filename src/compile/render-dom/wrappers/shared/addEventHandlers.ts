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
		if (opts.length) {
			const optString = (opts.length === 1 && opts[0] === 'capture')
				? 'true'
				: `{ ${opts.map(opt => `${opt}: true`).join(', ')} }`;

			block.builders.hydrate.addLine(
				`@addListener(${target}, "${handler.name}", ${handler.snippet}, ${optString});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${target}, "${handler.name}", ${handler.snippet}, ${optString});`
			);
		} else {
			block.builders.hydrate.addLine(
				`@addListener(${target}, "${handler.name}", ${handler.snippet});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${target}, "${handler.name}", ${handler.snippet});`
			);
		}

		if (handler.expression) {
			handler.expression.declarations.forEach(declaration => {
				block.builders.init.addBlock(declaration);
			});
		}
	});
}