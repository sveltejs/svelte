import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import FragmentWrapper from './Fragment';
import deindent from '../../utils/deindent';
import { sanitize, quote_prop_if_necessary } from '../../../utils/names';
import add_to_set from '../../utils/add_to_set';
import get_slot_data from '../../utils/get_slot_data';
import { stringify_props } from '../../utils/stringify_props';
import Expression from '../../nodes/shared/Expression';
import is_dynamic from './shared/is_dynamic';

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
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();

		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			parent,
			strip_whitespace,
			next_sibling
		);

		this.node.values.forEach(attribute => {
			add_to_set(this.dependencies, attribute.dependencies);
		});

		block.add_dependencies(this.dependencies);

		// we have to do this, just in case
		block.add_intro();
		block.add_outro();
	}

	render(
		block: Block,
		parent_node: string,
		parent_nodes: string
	) {
		const { renderer } = this;

		const { slot_name } = this.node;

		let get_slot_changes;
		let get_slot_context;

		if (this.node.values.size > 0) {
			get_slot_changes = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_changes`);
			get_slot_context = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_context`);

			const context_props = get_slot_data(this.node.values, false);
			const changes_props = [];

			const dependencies = new Set();

			this.node.values.forEach(attribute => {
				attribute.chunks.forEach(chunk => {
					if ((chunk as Expression).dependencies) {
						add_to_set(dependencies, (chunk as Expression).contextual_dependencies);

						// add_to_set(dependencies, (chunk as Expression).dependencies);
						(chunk as Expression).dependencies.forEach(name => {
							const variable = renderer.component.var_lookup.get(name);
							if (variable && !variable.hoistable) dependencies.add(name);
						});
					}
				});

				const dynamic_dependencies = Array.from(attribute.dependencies).filter(name => {
					const variable = renderer.component.var_lookup.get(name);
					return is_dynamic(variable);
				});

				if (dynamic_dependencies.length > 0) {
					changes_props.push(`${attribute.name}: ${dynamic_dependencies.join(' || ')}`);
				}
			});

			const arg = dependencies.size > 0 ? `{ ${Array.from(dependencies).join(', ')} }` : '';

			renderer.blocks.push(deindent`
				const ${get_slot_changes} = (${arg}) => (${stringify_props(changes_props)});
				const ${get_slot_context} = (${arg}) => (${stringify_props(context_props)});
			`);
		} else {
			get_slot_changes = 'null';
			get_slot_context = 'null';
		}

		const slot = block.get_unique_name(`${sanitize(slot_name)}_slot`);
		const slot_definition = block.get_unique_name(`${sanitize(slot_name)}_slot`);

		block.builders.init.add_block(deindent`
			const ${slot_definition} = ctx.$$slots${quote_prop_if_necessary(slot_name)};
			const ${slot} = @create_slot(${slot_definition}, ctx, ${get_slot_context});
		`);

		const mount_before = block.builders.mount.toString();

		block.builders.create.push_condition(`!${slot}`);
		block.builders.claim.push_condition(`!${slot}`);
		block.builders.hydrate.push_condition(`!${slot}`);
		block.builders.mount.push_condition(`!${slot}`);
		block.builders.update.push_condition(`!${slot}`);
		block.builders.destroy.push_condition(`!${slot}`);

		const listeners = block.event_listeners;
		block.event_listeners = [];
		this.fragment.render(block, parent_node, parent_nodes);
		block.render_listeners(`_${slot}`);
		block.event_listeners = listeners;

		block.builders.create.pop_condition();
		block.builders.claim.pop_condition();
		block.builders.hydrate.pop_condition();
		block.builders.mount.pop_condition();
		block.builders.update.pop_condition();
		block.builders.destroy.pop_condition();

		block.builders.create.add_line(
			`if (${slot}) ${slot}.c();`
		);

		block.builders.claim.add_line(
			`if (${slot}) ${slot}.l(${parent_nodes});`
		);

		const mount_leadin = block.builders.mount.toString() !== mount_before
			? `else`
			: `if (${slot})`;

		block.builders.mount.add_block(deindent`
			${mount_leadin} {
				${slot}.m(${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});
			}
		`);

		block.builders.intro.add_line(
			`@transition_in(${slot}, #local);`
		);

		block.builders.outro.add_line(
			`@transition_out(${slot}, #local);`
		);

		const dynamic_dependencies = Array.from(this.dependencies).filter(name => {
			if (name === '$$scope') return true;
			const variable = renderer.component.var_lookup.get(name);
			return is_dynamic(variable);
		});

		let update_conditions = dynamic_dependencies.map(name => `changed.${name}`).join(' || ');
		if (dynamic_dependencies.length > 1) update_conditions = `(${update_conditions})`;

		block.builders.update.add_block(deindent`
			if (${slot} && ${slot}.p && ${update_conditions}) {
				${slot}.p(@get_slot_changes(${slot_definition}, ctx, changed, ${get_slot_changes}), @get_slot_context(${slot_definition}, ctx, ${get_slot_context}));
			}
		`);

		block.builders.destroy.add_line(
			`if (${slot}) ${slot}.d(detaching);`
		);
	}
}
