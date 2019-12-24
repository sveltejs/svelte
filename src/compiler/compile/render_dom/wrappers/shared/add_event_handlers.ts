import Block from '../../Block';
import EventHandler from '../Element/EventHandler';

export default function add_event_handlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => add_event_handler(block, target, handler));
}

export function add_event_handler(
	block: Block,
	target: string,
	handler: EventHandler
) {
	handler.render(block, target);
}
