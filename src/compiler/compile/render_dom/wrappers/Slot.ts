import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import FragmentWrapper from './Fragment';
import { b, p, x } from 'code-red';
import { sanitize } from '../../../utils/names';
import add_to_set from '../../utils/add_to_set';
import get_slot_data from '../../utils/get_slot_data';
import Expression from '../../nodes/shared/Expression';
import is_dynamic from './shared/is_dynamic';
import { Identifier, ObjectExpression } from 'estree';
import { changed } from './shared/changed';

export default class SlotWrapper extends Wrapper {
	node: Slot;
	fragment: FragmentWrapper;

	var: Identifier = { type: 'Identifier', name: 'slot' };
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
		parent_node: Identifier,
		parent_nodes: Identifier
	) {
		const { renderer } = this;

		const { slot_name } = this.node;

		let get_slot_changes;
		let get_slot_context;

		if (this.node.values.size > 0) {
			get_slot_changes = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_changes`);
			get_slot_context = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_context`);

			const context = get_slot_data(this.node.values);
			const changes = x`{}` as ObjectExpression;

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
					if (this.node.scope.is_let(name)) return true;
					const variable = renderer.component.var_lookup.get(name);
					return is_dynamic(variable);
				});

				if (dynamic_dependencies.length > 0) {
					const expression = dynamic_dependencies
						.map(name => ({ type: 'Identifier', name } as any))
						.reduce((lhs, rhs) => x`${lhs} || ${rhs}`);

					changes.properties.push(p`${attribute.name}: ${expression}`);
				}
			});

			const arg = dependencies.size > 0 && {
				type: 'ObjectPattern',
				properties: Array.from(dependencies).map(name => p`${name}`)
			};

			renderer.blocks.push(b`
				const ${get_slot_changes} = (${arg}) => (${changes});
				const ${get_slot_context} = (${arg}) => (${context});
			`);
		} else {
			get_slot_changes = 'null';
			get_slot_context = 'null';
		}

		const slot = block.get_unique_name(`${sanitize(slot_name)}_slot`);
		const slot_definition = block.get_unique_name(`${sanitize(slot_name)}_slot_template`);

		block.chunks.init.push(b`
			const ${slot_definition} = #ctx.$$slots.${slot_name};
			const ${slot} = @create_slot(${slot_definition}, #ctx, ${get_slot_context});
		`);

		// TODO this is a dreadful hack! Should probably make this nicer
		const { create, claim, hydrate, mount, update, destroy } = block.chunks;

		block.chunks.create = [];
		block.chunks.claim = [];
		block.chunks.hydrate = [];
		block.chunks.mount = [];
		block.chunks.update = [];
		block.chunks.destroy = [];

		const listeners = block.event_listeners;
		block.event_listeners = [];
		this.fragment.render(block, parent_node, parent_nodes);
		block.render_listeners(`_${slot.name}`);
		block.event_listeners = listeners;

		if (block.chunks.create.length) create.push(b`if (!${slot}) { ${block.chunks.create} }`);
		if (block.chunks.claim.length) claim.push(b`if (!${slot}) { ${block.chunks.claim} }`);
		if (block.chunks.hydrate.length) hydrate.push(b`if (!${slot}) { ${block.chunks.hydrate} }`);
		if (block.chunks.mount.length) mount.push(b`if (!${slot}) { ${block.chunks.mount} }`);
		if (block.chunks.update.length) update.push(b`if (!${slot}) { ${block.chunks.update} }`);
		if (block.chunks.destroy.length) destroy.push(b`if (!${slot}) { ${block.chunks.destroy} }`);

		block.chunks.create = create;
		block.chunks.claim = claim;
		block.chunks.hydrate = hydrate;
		block.chunks.mount = mount;
		block.chunks.update = update;
		block.chunks.destroy = destroy;

		block.chunks.create.push(
			b`if (${slot}) ${slot}.c();`
		);

		if (renderer.options.hydratable) {
			block.chunks.claim.push(
				b`if (${slot}) ${slot}.l(${parent_nodes});`
			);
		}

		block.chunks.mount.push(b`
			if (${slot}) {
				${slot}.m(${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});
			}
		`);

		block.chunks.intro.push(
			b`@transition_in(${slot}, #local);`
		);

		block.chunks.outro.push(
			b`@transition_out(${slot}, #local);`
		);

		const dynamic_dependencies = Array.from(this.dependencies).filter(name => {
			if (name === '$$scope') return true;
			if (this.node.scope.is_let(name)) return true;
			const variable = renderer.component.var_lookup.get(name);
			return is_dynamic(variable);
		});

		block.chunks.update.push(b`
			if (${slot} && ${slot}.p && ${changed(dynamic_dependencies)}) {
				${slot}.p(
					@get_slot_changes(${slot_definition}, #ctx, #changed, ${get_slot_changes}),
					@get_slot_context(${slot_definition}, #ctx, ${get_slot_context})
				);
			}
		`);

		block.chunks.destroy.push(
			b`if (${slot}) ${slot}.d(detaching);`
		);
	}
}
