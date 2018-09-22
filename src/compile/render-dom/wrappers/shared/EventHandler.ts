import Renderer from '../../Renderer';
import Block from '../../Block';
import Wrapper from './Wrapper';
import EventHandler from '../../../nodes/EventHandler';
import validCalleeObjects from '../../../../utils/validCalleeObjects';

export default class EventHandlerWrapper extends Wrapper {
	node: EventHandler;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: EventHandler,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;
		const { component } = renderer;

		const hoisted = this.node.shouldHoist;

		if (this.node.insertionPoint === null) return; // TODO handle shorthand events here?

		if (!validCalleeObjects.has(this.node.callee.name)) {
			const component_name = hoisted ? `component` : block.alias(`component`);

			// allow event.stopPropagation(), this.select() etc
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			if (this.node.callee.name[0] === '$' && !component.methods.has(this.node.callee.name)) {
				component.code.overwrite(
					this.node.insertionPoint,
					this.node.insertionPoint + 1,
					`${component_name}.store.`
				);
			} else {
				component.code.prependRight(
					this.node.insertionPoint,
					`${component_name}.`
				);
			}
		}

		if (this.node.isCustomEvent) {
			this.node.args.forEach(arg => {
				arg.overwriteThis(this.parent.var);
			});

			if (this.node.callee && this.node.callee.name === 'this') {
				const node = this.node.callee.nodes[0];
				component.code.overwrite(node.start, node.end, this.parent.var, {
					storeName: true,
					contentOnly: true
				});
			}
		}
	}
}