import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import { quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import FragmentWrapper from './Fragment';
import deindent from '../../../utils/deindent';
import sanitize from '../../../utils/sanitize';

export default class SlotWrapper extends Wrapper {
	node: Slot;
	fragment: FragmentWrapper;

	var = 'slot';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Slot,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();

		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			parent,
			stripWhitespace,
			nextSibling
		);

		block.addDependencies(new Set('$$scope'));
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { renderer } = this;

		const slot_name = this.node.getStaticAttributeValue('name') || 'default';
		renderer.slots.add(slot_name);

		const slot = block.getUniqueName(`${sanitize(slot_name)}_slot`);

		block.builders.init.addLine(
			`const ${slot} = ctx.$$slot_${sanitize(slot_name)} && ctx.$$slot_${sanitize(slot_name)}(ctx.$$scope.ctx);`
		);

		let mountBefore = block.builders.mount.toString();

		block.builders.create.pushCondition(`!${slot}`);
		block.builders.hydrate.pushCondition(`!${slot}`);
		block.builders.mount.pushCondition(`!${slot}`);
		block.builders.update.pushCondition(`!${slot}`);
		block.builders.destroy.pushCondition(`!${slot}`);

		const listeners = block.event_listeners;
		block.event_listeners = [];
		this.fragment.render(block, parentNode, parentNodes);
		block.renderListeners(`_${slot}`);
		block.event_listeners = listeners;

		block.builders.create.popCondition();
		block.builders.hydrate.popCondition();
		block.builders.mount.popCondition();
		block.builders.update.popCondition();
		block.builders.destroy.popCondition();

		block.builders.create.addLine(
			`if (${slot}) ${slot}.c();`
		);

		block.builders.claim.addLine(
			`if (${slot}) ${slot}.l(${parentNodes});`
		);

		const mountLeadin = block.builders.mount.toString() !== mountBefore
			? `else`
			: `if (${slot})`;

		block.builders.mount.addBlock(deindent`
			${mountLeadin} {
				${slot}.m(${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});
			}
		`);

		block.builders.update.addLine(
			`if (${slot} && changed.$$scope) ${slot}.p(ctx.$$scope.changed, ctx.$$scope.ctx);`
		);

		block.builders.destroy.addLine(
			`if (${slot}) ${slot}.d(detach);`
		);
	}
}