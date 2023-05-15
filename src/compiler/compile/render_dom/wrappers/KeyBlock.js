import Wrapper from './shared/Wrapper.js';
import create_debugging_comment from './shared/create_debugging_comment.js';
import FragmentWrapper from './Fragment.js';
import { b, x } from 'code-red';

/** @extends Wrapper<import('../../nodes/KeyBlock.js').default> */
export default class KeyBlockWrapper extends Wrapper {
	/** @type {import('./Fragment.js').default} */
	fragment;

	/** @type {import('../Block.js').default} */
	block;

	/** @type {string[]} */
	dependencies;

	/** @type {import('estree').Identifier} */
	var = { type: 'Identifier', name: 'key_block' };

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/KeyBlock.js').default} node
	 * @param {boolean} strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} next_sibling
	 */
	constructor(renderer, block, parent, node, strip_whitespace, next_sibling) {
		super(renderer, block, parent, node);
		this.dependencies = node.expression.dynamic_dependencies();
		if (this.dependencies.length) {
			block = block.child({
				comment: create_debugging_comment(node, renderer.component),
				name: renderer.component.get_unique_name('create_key_block'),
				type: 'key'
			});
			block.add_dependencies(node.expression.dependencies);
			renderer.blocks.push(block);
		}
		this.block = block;
		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			node.children,
			this,
			strip_whitespace,
			next_sibling
		);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		if (this.dependencies.length === 0) {
			this.render_static_key(block, parent_node, parent_nodes);
		} else {
			this.render_dynamic_key(block, parent_node, parent_nodes);
		}
	}

	/**
	 * @param {import('../Block.js').default} _block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render_static_key(_block, parent_node, parent_nodes) {
		this.fragment.render(this.block, parent_node, parent_nodes);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render_dynamic_key(block, parent_node, parent_nodes) {
		this.fragment.render(
			this.block,
			null,
			/** @type {unknown} */ /** @type {import('estree').Identifier} */ (x`#nodes`)
		);
		const has_transitions = !!(this.block.has_intro_method || this.block.has_outro_method);
		const dynamic = this.block.has_update_method;
		const previous_key = block.get_unique_name('previous_key');
		const snippet = this.node.expression.manipulate(block);
		block.add_variable(previous_key, snippet);
		const not_equal = this.renderer.component.component_options.immutable
			? x`@not_equal`
			: x`@safe_not_equal`;
		const condition = x`${this.renderer.dirty(
			this.dependencies
		)} && ${not_equal}(${previous_key}, ${previous_key} = ${snippet})`;
		block.chunks.init.push(b`
			let ${this.var} = ${this.block.name}(#ctx);
		`);
		block.chunks.create.push(b`${this.var}.c();`);
		if (this.renderer.options.hydratable) {
			block.chunks.claim.push(b`${this.var}.l(${parent_nodes});`);
		}
		block.chunks.mount.push(
			b`${this.var}.m(${parent_node || '#target'}, ${parent_node ? 'null' : '#anchor'});`
		);
		const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
		const body = b`
			${
				has_transitions
					? b`
						@group_outros();
						@transition_out(${this.var}, 1, 1, @noop);
						@check_outros();
					`
					: b`${this.var}.d(1);`
			}
			${this.var} = ${this.block.name}(#ctx);
			${this.var}.c();
			${has_transitions && b`@transition_in(${this.var}, 1)`}
			${this.var}.m(${this.get_update_mount_node(anchor)}, ${anchor});
		`;
		if (dynamic) {
			block.chunks.update.push(b`
				if (${condition}) {
					${body}
				} else {
					${this.var}.p(#ctx, #dirty);
				}
			`);
		} else {
			block.chunks.update.push(b`
				if (${condition}) {
					${body}
				}
			`);
		}
		if (has_transitions) {
			block.chunks.intro.push(b`@transition_in(${this.var})`);
			block.chunks.outro.push(b`@transition_out(${this.var})`);
		}
		block.chunks.destroy.push(b`${this.var}.d(detaching)`);
	}
}
