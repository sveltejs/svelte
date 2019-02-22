import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import FragmentWrapper from './Fragment';
import deindent from '../../../utils/deindent';
import sanitize from '../../../utils/sanitize';
import addToSet from '../../../utils/addToSet';
import get_slot_data from '../../../utils/get_slot_data';
import stringifyProps from '../../../utils/stringifyProps';
import Expression from '../../nodes/shared/Expression';

export default class SlotWrapper extends Wrapper {
	node: Slot;
	fragment: FragmentWrapper;

	var = 'slot';
	dependencies: Set<string> = new Set(['$$scope']);

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

		this.node.attributes.forEach(attribute => {
			addToSet(this.dependencies, attribute.dependencies);
		});

		block.addDependencies(this.dependencies);
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { renderer } = this;

		const slot_name = this.node.getStaticAttributeValue('name') || 'default';
		renderer.slots.add(slot_name);

		let get_slot_changes;
		let get_slot_context;

		const attributes = this.node.attributes.filter(attribute => attribute.name !== 'name');

		if (attributes.length > 0) {
			get_slot_changes = renderer.component.getUniqueName(`get_${slot_name}_slot_changes`);
			get_slot_context = renderer.component.getUniqueName(`get_${slot_name}_slot_context`);

			const context_props = get_slot_data(attributes, false);
			const changes_props = [];

			const dependencies = new Set();

			attributes.forEach(attribute => {
				attribute.chunks.forEach(chunk => {
					if ((chunk as Expression).dependencies) {
						addToSet(dependencies, (chunk as Expression).dependencies);
						addToSet(dependencies, (chunk as Expression).contextual_dependencies);
					}
				});

				if (attribute.dependencies.size > 0) {
					changes_props.push(`${attribute.name}: ${[...attribute.dependencies].join(' || ')}`)
				}
			});

			const arg = dependencies.size > 0 ? `{ ${Array.from(dependencies).join(', ')} }` : '{}';

			renderer.blocks.push(deindent`
				const ${get_slot_changes} = (${arg}) => (${stringifyProps(changes_props)});
				const ${get_slot_context} = (${arg}) => (${stringifyProps(context_props)});
			`);
		} else {
			get_slot_context = 'null';
		}

		const slot = block.getUniqueName(`${sanitize(slot_name)}_slot`);
		const slot_definition = block.getUniqueName(`${sanitize(slot_name)}_slot`);

		block.builders.init.addBlock(deindent`
			const ${slot_definition} = ctx.$$slot_${sanitize(slot_name)};
			const ${slot} = @create_slot(${slot_definition}, ctx, ${get_slot_context});
		`);

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

		let update_conditions = [...this.dependencies].map(name => `changed.${name}`).join(' || ');
		if (this.dependencies.size > 1) update_conditions = `(${update_conditions})`;

		block.builders.update.addBlock(deindent`
			if (${slot} && ${slot}.p && ${update_conditions}) {
				${slot}.p(@assign(@assign({}, ${get_slot_changes}(changed)), ctx.$$scope.changed), @get_slot_context(${slot_definition}, ctx, ${get_slot_context}));
			}
		`);

		block.builders.destroy.addLine(
			`if (${slot}) ${slot}.d(detach);`
		);
	}
}
