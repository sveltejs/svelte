/**
 * @param {import('../../Block.js').default} block
 * @param {string | import('estree').Expression} target
 * @param {import('../Element/EventHandler.js').default[]} handlers
 */
export default function add_event_handlers(block, target, handlers) {
	handlers.forEach((handler) => add_event_handler(block, target, handler));
}

/**
 * @param {import('../../Block.js').default} block
 * @param {string | import('estree').Expression} target
 * @param {import('../Element/EventHandler.js').default} handler
 */
export function add_event_handler(block, target, handler) {
	handler.render(block, target);
}
