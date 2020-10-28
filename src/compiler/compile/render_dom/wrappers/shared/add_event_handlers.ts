import Block from '../../Block.ts';
import EventHandler from '../Element/EventHandler.ts';
import { Expression } from 'estree';

export default function add_event_handlers(
	block: Block,
	target: string | Expression,
	handlers: EventHandler[]
) {
	handlers.forEach(handler => add_event_handler(block, target, handler));
}

export function add_event_handler(
	block: Block,
	target: string | Expression,
	handler: EventHandler
) {
	handler.render(block, target);
}
