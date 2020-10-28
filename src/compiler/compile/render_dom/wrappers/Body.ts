import Block from '../Block.ts';
import Wrapper from './shared/Wrapper.ts';
import { x } from 'code-red';
import Body from '../../nodes/Body.ts';
import { Identifier } from 'estree';
import EventHandler from './Element/EventHandler.ts';
import add_event_handlers from './shared/add_event_handlers.ts';
import { TemplateNode } from '../../../interfaces.ts';
import Renderer from '../Renderer.ts';

export default class BodyWrapper extends Wrapper {
	node: Body;
	handlers: EventHandler[];

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: TemplateNode) {
		super(renderer, block, parent, node);
		this.handlers = this.node.handlers.map(handler => new EventHandler(handler, this));
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		add_event_handlers(block, x`@_document.body`, this.handlers);
	}
}
