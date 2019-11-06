import Block from '../../Block';
import EventHandler from '../Element/EventHandler';

export default function add_event_handlers(
	block: Block,
	target: string,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => handler.render(block, target));
}
