import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Slot from '../../nodes/Slot';
import FragmentWrapper from './Fragment';
import { b, p, x } from 'code-red';
import { sanitize } from '../../../utils/names';
import add_to_set from '../../utils/add_to_set';
import get_slot_data from '../../utils/get_slot_data';
import { is_reserved_keyword } from '../../utils/reserved_keywords';
import Expression from '../../nodes/shared/Expression';
import is_dynamic from './shared/is_dynamic';
import { Identifier, ObjectExpression } from 'estree';
import create_debugging_comment from './shared/create_debugging_comment';

export default class SlotWrapper extends Wrapper {
	node: Slot;
	fragment: FragmentWrapper;
	fallback: Block | null = null;

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
		this.not_static_content();

		if (this.node.children.length) {
			this.fallback = block.child({
				comment: create_debugging_comment(this.node.children[0], this.renderer.component),
				name: this.renderer.component.get_unique_name(`fallback_block`),
				type: 'fallback'
			});
			renderer.blocks.push(this.fallback);
		}

		this.fragment = new FragmentWrapper(
			renderer,
			this.fallback,
			node.children,
			this,
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

		let get_slot_changes_fn;
		let get_slot_context_fn;

		if (this.node.values.size > 0) {
			get_slot_changes_fn = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_changes`);
			get_slot_context_fn = renderer.component.get_unique_name(`get_${sanitize(slot_name)}_slot_context`);

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

				const dynamic_dependencies = Array.from(attribute.dependencies).filter((name) => this.is_dependency_dynamic(name));

				if (dynamic_dependencies.length > 0) {
					changes.properties.push(p`${attribute.name}: ${renderer.dirty(dynamic_dependencies)}`);
				}
			});

			renderer.blocks.push(b`
				const ${get_slot_changes_fn} = #dirty => ${changes};
				const ${get_slot_context_fn} = #ctx => ${get_slot_data(this.node.values, block)};
			`);
		} else {
			get_slot_changes_fn = 'null';
			get_slot_context_fn = 'null';
		}

		let has_fallback = !!this.fallback;
		if (this.fallback) {
			this.fragment.render(this.fallback, null, x`#nodes` as Identifier);
			has_fallback = this.fallback.has_content();
			if (!has_fallback) {
				renderer.remove_block(this.fallback);
			}
		}

		const slot = block.get_unique_name(`${sanitize(slot_name)}_slot`);
		const slot_definition = block.get_unique_name(`${sanitize(slot_name)}_slot_template`);
		const slot_or_fallback = has_fallback ? block.get_unique_name(`${sanitize(slot_name)}_slot_or_fallback`) : slot;

		block.chunks.init.push(b`
			const ${slot_definition} = ${renderer.reference('$$slots')}.${slot_name};
			const ${slot} = @create_slot(${slot_definition}, #ctx, ${renderer.reference('$$scope')}, ${get_slot_context_fn});
			${has_fallback ? b`const ${slot_or_fallback} = ${slot} || ${this.fallback.name}(#ctx);` : null}
		`);

		block.chunks.create.push(
			b`if (${slot_or_fallback}) ${slot_or_fallback}.c();`
		);

		if (renderer.options.hydratable) {
			block.chunks.claim.push(
				b`if (${slot_or_fallback}) ${slot_or_fallback}.l(${parent_nodes});`
			);
		}

		block.chunks.mount.push(b`
			if (${slot_or_fallback}) {
				${slot_or_fallback}.m(${parent_node || '#target'}, ${parent_node ? 'null' : '#anchor'});
			}
		`);

		block.chunks.intro.push(
			b`@transition_in(${slot_or_fallback}, #local);`
		);

		block.chunks.outro.push(
			b`@transition_out(${slot_or_fallback}, #local);`
		);

		const dynamic_dependencies = Array.from(this.dependencies).filter((name) => this.is_dependency_dynamic(name));

		const fallback_dynamic_dependencies = has_fallback
			? Array.from(this.fallback.dependencies).filter((name) => this.is_dependency_dynamic(name))
			: [];

		const slot_update = b`
			if (${slot}.p && ${renderer.dirty(dynamic_dependencies)}) {
				@update_slot(${slot}, ${slot_definition}, #ctx, ${renderer.reference('$$scope')}, #dirty, ${get_slot_changes_fn}, ${get_slot_context_fn});
			}
		`;
		const fallback_update = has_fallback && fallback_dynamic_dependencies.length > 0 && b`
			if (${slot_or_fallback} && ${slot_or_fallback}.p && ${renderer.dirty(fallback_dynamic_dependencies)}) {
				${slot_or_fallback}.p(#ctx, #dirty);
			}
		`;

		if (fallback_update) {
			block.chunks.update.push(b`
				if (${slot}) {
					${slot_update}
				} else {
					${fallback_update}
				}
			`);
		} else {
			block.chunks.update.push(b`
				if (${slot}) {
					${slot_update}
				}
			`);
		}

		block.chunks.destroy.push(
			b`if (${slot_or_fallback}) ${slot_or_fallback}.d(detaching);`
		);
	}

	is_dependency_dynamic(name: string) {
		if (name === '$$scope') return true;
		if (this.node.scope.is_let(name)) return true;
		if (is_reserved_keyword(name)) return true;
		const variable = this.renderer.component.var_lookup.get(name);
		return is_dynamic(variable);
	}
}
