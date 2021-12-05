import Block from '../Block';
import Wrapper from './shared/Wrapper';
import { x } from 'code-red';
import Body from '../../nodes/Body';
import { Identifier } from 'estree';
import EventHandler from './Element/EventHandler';
import add_event_handlers from './shared/add_event_handlers';
import { TemplateNode } from '../../../interfaces';
import Renderer from '../Renderer';
import add_actions from './shared/add_actions';

export default class BodyWrapper extends Wrapper {
	node: Body;
	handlers: EventHandler[];

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: TemplateNode) {
		super(renderer, block, parent, node);
		this.handlers = this.node.handlers.map(handler => new EventHandler(handler, this));
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		add_event_handlers(block, x`@_document.body`, this.handlers);
		add_actions(block, x`@_document.body`, this.node.actions);
	}
}
