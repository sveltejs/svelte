import Wrapper from './shared/Wrapper.js';
import FragmentWrapper from './Fragment.js';
import { b, p, x } from 'code-red';
import { sanitize } from '../../../utils/names.js';
import add_to_set from '../../utils/add_to_set.js';
import get_slot_data from '../../utils/get_slot_data.js';
import { is_reserved_keyword } from '../../utils/reserved_keywords.js';
import is_dynamic from './shared/is_dynamic.js';
import create_debugging_comment from './shared/create_debugging_comment.js';

/** @extends Wrapper<import('../../nodes/Slot.js').default> */
export default class SlotWrapper extends Wrapper {
	/** @type {import('./Fragment.js').default} */
	fragment;

	/** @type {import('../Block.js').default | null} */
	fallback = null;

	/** @type {import('../Block.js').default} */
	slot_block;

	/** @type {import('estree').Identifier} */
	var = { type: 'Identifier', name: 'slot' };

	/** @type {Set<string>} */
	dependencies = new Set(['$$scope']);

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Slot.js').default} node
	 * @param {boolean} strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} next_sibling
	 */
	constructor(renderer, block, parent, node, strip_whitespace, next_sibling) {
		super(renderer, block, parent, node);
		if (this.node.children.length) {
			this.fallback = block.child({
				comment: create_debugging_comment(this.node.children[0], this.renderer.component),
				name: this.renderer.component.get_unique_name('fallback_block'),
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
		this.node.values.forEach((attribute) => {
			add_to_set(this.dependencies, attribute.dependencies);
		});
		block.add_dependencies(this.dependencies);
		// we have to do this, just in case
		block.add_intro();
		block.add_outro();
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		const { renderer } = this;
		const { slot_name } = this.node;
		if (this.slot_block) {
			block = this.slot_block;
		}

		/** @type {import('estree').Identifier | 'null'} */
		let get_slot_changes_fn;

		/** @type {import('estree').Identifier | undefined} */
		let get_slot_spread_changes_fn;

		/** @type {import('estree').Identifier | 'null'} */
		let get_slot_context_fn;
		if (this.node.values.size > 0) {
			get_slot_changes_fn = renderer.component.get_unique_name(
				`get_${sanitize(slot_name)}_slot_changes`
			);
			get_slot_context_fn = renderer.component.get_unique_name(
				`get_${sanitize(slot_name)}_slot_context`
			);
			const changes = /** @type {import('estree').ObjectExpression} */ (x`{}`);
			const spread_dynamic_dependencies = new Set();
			this.node.values.forEach((attribute) => {
				if (attribute.type === 'Spread') {
					add_to_set(
						spread_dynamic_dependencies,
						Array.from(attribute.dependencies).filter((name) => this.is_dependency_dynamic(name))
					);
				} else {
					const dynamic_dependencies = Array.from(attribute.dependencies).filter((name) =>
						this.is_dependency_dynamic(name)
					);
					if (dynamic_dependencies.length > 0) {
						changes.properties.push(p`${attribute.name}: ${renderer.dirty(dynamic_dependencies)}`);
					}
				}
			});
			renderer.blocks.push(b`
				const ${get_slot_changes_fn} = #dirty => ${changes};
				const ${get_slot_context_fn} = #ctx => ${get_slot_data(this.node.values, block)};
			`);
			if (spread_dynamic_dependencies.size) {
				get_slot_spread_changes_fn = renderer.component.get_unique_name(
					`get_${sanitize(slot_name)}_slot_spread_changes`
				);
				renderer.blocks.push(b`
					const ${get_slot_spread_changes_fn} = #dirty => ${renderer.dirty(
					Array.from(spread_dynamic_dependencies)
				)};
				`);
			}
		} else {
			get_slot_changes_fn = 'null';
			get_slot_context_fn = 'null';
		}
		let has_fallback = !!this.fallback;
		if (this.fallback) {
			this.fragment.render(
				this.fallback,
				null,
				/** @type {import('estree').Identifier} */ (x`#nodes`)
			);
			has_fallback = this.fallback.has_content();
			if (!has_fallback) {
				renderer.remove_block(this.fallback);
			}
		}
		const slot = block.get_unique_name(`${sanitize(slot_name)}_slot`);
		const slot_definition = block.get_unique_name(`${sanitize(slot_name)}_slot_template`);
		const slot_or_fallback = has_fallback
			? block.get_unique_name(`${sanitize(slot_name)}_slot_or_fallback`)
			: slot;
		block.chunks.init.push(b`
			const ${slot_definition} = ${renderer.reference('#slots')}.${slot_name};
			const ${slot} = @create_slot(${slot_definition}, #ctx, ${renderer.reference(
			'$$scope'
		)}, ${get_slot_context_fn});
			${has_fallback ? b`const ${slot_or_fallback} = ${slot} || ${this.fallback.name}(#ctx);` : null}
		`);
		block.chunks.create.push(b`if (${slot_or_fallback}) ${slot_or_fallback}.c();`);
		if (renderer.options.hydratable) {
			block.chunks.claim.push(b`if (${slot_or_fallback}) ${slot_or_fallback}.l(${parent_nodes});`);
		}
		block.chunks.mount.push(b`
			if (${slot_or_fallback}) {
				${slot_or_fallback}.m(${parent_node || '#target'}, ${parent_node ? 'null' : '#anchor'});
			}
		`);
		block.chunks.intro.push(b`@transition_in(${slot_or_fallback}, #local);`);
		block.chunks.outro.push(b`@transition_out(${slot_or_fallback}, #local);`);
		const dynamic_dependencies = Array.from(this.dependencies).filter((name) =>
			this.is_dependency_dynamic(name)
		);
		const fallback_dynamic_dependencies = has_fallback
			? Array.from(this.fallback.dependencies).filter((name) => this.is_dependency_dynamic(name))
			: [];
		let condition = renderer.dirty(dynamic_dependencies);
		if (block.has_outros) {
			condition = x`!#current || ${condition}`;
		}
		// conditions to treat everything as dirty
		const all_dirty_conditions = [
			get_slot_spread_changes_fn ? x`${get_slot_spread_changes_fn}(#dirty)` : null,
			block.has_outros ? x`!#current` : null
		].filter(Boolean);
		const all_dirty_condition = all_dirty_conditions.length
			? all_dirty_conditions.reduce((condition1, condition2) => x`${condition1} || ${condition2}`)
			: null;

		/** @type {import('estree').Node[]} */
		let slot_update;
		if (all_dirty_condition) {
			const dirty = x`${all_dirty_condition} ? @get_all_dirty_from_scope(${renderer.reference(
				'$$scope'
			)}) : @get_slot_changes(${slot_definition}, ${renderer.reference(
				'$$scope'
			)}, #dirty, ${get_slot_changes_fn})`;
			slot_update = b`
				if (${slot}.p && ${condition}) {
					@update_slot_base(${slot}, ${slot_definition}, #ctx, ${renderer.reference(
				'$$scope'
			)}, ${dirty}, ${get_slot_context_fn});
				}
			`;
		} else {
			slot_update = b`
				if (${slot}.p && ${condition}) {
					@update_slot(${slot}, ${slot_definition}, #ctx, ${renderer.reference(
				'$$scope'
			)}, #dirty, ${get_slot_changes_fn}, ${get_slot_context_fn});
				}
			`;
		}
		let fallback_condition = renderer.dirty(fallback_dynamic_dependencies);
		let fallback_dirty = x`#dirty`;
		if (block.has_outros) {
			fallback_condition = x`!#current || ${fallback_condition}`;
			fallback_dirty = x`!#current ? ${renderer.get_initial_dirty()} : ${fallback_dirty}`;
		}
		const fallback_update =
			has_fallback &&
			fallback_dynamic_dependencies.length > 0 &&
			b`
			if (${slot_or_fallback} && ${slot_or_fallback}.p && ${fallback_condition}) {
				${slot_or_fallback}.p(#ctx, ${fallback_dirty});
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
		block.chunks.destroy.push(b`if (${slot_or_fallback}) ${slot_or_fallback}.d(detaching);`);
	}

	/** @param {string} name */
	is_dependency_dynamic(name) {
		if (name === '$$scope') return true;
		if (this.node.scope.is_let(name)) return true;
		if (is_reserved_keyword(name)) return true;
		const variable = this.renderer.component.var_lookup.get(name);
		return is_dynamic(variable);
	}
}
