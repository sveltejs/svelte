import { b, x } from 'code-red';
import { is_head } from './is_head';
import { Identifier } from 'estree';
import { add_const_tags } from './add_const_tags';
import ConditionalBlockBranch from './ConditionalBlockBranch';
import SwitchBlock from '../../../nodes/SwitchBlock';
import Wrapper from './Wrapper';
import IfBlock from '../../../nodes/IfBlock';
import Renderer from '../../Renderer';
import Block from '../../Block';

export default class ConditionalBlockWrapper extends Wrapper {
	node: IfBlock | SwitchBlock;
	branches: ConditionalBlockBranch[];
	needs_update = false;

	var: Identifier = { type: 'Identifier', name: 'if_block' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: IfBlock | SwitchBlock
	) {
		super(renderer, block, parent, node);

		this.cannot_use_innerhtml();
		this.not_static_content();

		this.branches = [];
	}

	render(
		block: Block,
		parent_node: Identifier,
		parent_nodes: Identifier
	) {
		const name = this.var;

		const needs_anchor = this.next ? !this.next.is_dom_node() : !parent_node || !this.parent.is_dom_node();
		const anchor = needs_anchor
			? block.get_unique_name(`${this.var.name}_anchor`)
			: (this.next && this.next.var) || 'null';

		const has_else = !(this.branches[this.branches.length - 1].condition);
		const if_exists_condition = has_else ? null : name;

		const dynamic = this.branches[0].block.has_update_method; // can use [0] as proxy for all, since they necessarily have the same value
		const has_intros = this.branches[0].block.has_intro_method;
		const has_outros = this.branches[0].block.has_outro_method;
		const has_transitions = has_intros || has_outros;

		this.branches.forEach(branch => {
			if (branch.get_ctx_name) {
				this.renderer.blocks.push(b`
				function ${branch.get_ctx_name}(#ctx) {
					const child_ctx = #ctx.slice();
					${add_const_tags(block, branch.node.const_tags, 'child_ctx')}
					return child_ctx;
				}
				`);
			}
		});

		const vars = { name, anchor, if_exists_condition, has_else, has_transitions };

		const detaching = parent_node && !is_head(parent_node) ? null : 'detaching';

		if (this.node.type === 'IfBlock' && this.node.else) {
			this.branches.forEach(branch => {
				if (branch.snippet) block.add_variable(branch.condition);
			});

			if (has_outros) {
				this.render_compound_with_outros(block, parent_node, parent_nodes, dynamic, vars, detaching);

				block.chunks.outro.push(b`@transition_out(${name});`);
			} else {
				this.render_compound(block, parent_node, parent_nodes, dynamic, vars, detaching);
			}
		} else {
			this.render_simple(block, parent_node, parent_nodes, dynamic, vars, detaching);

			if (has_outros) {
				block.chunks.outro.push(b`@transition_out(${name});`);
			}
		}

		if (if_exists_condition) {
			block.chunks.create.push(b`if (${if_exists_condition}) ${name}.c();`);
		} else {
			block.chunks.create.push(b`${name}.c();`);
		}

		if (parent_nodes && this.renderer.options.hydratable) {
			if (if_exists_condition) {
				block.chunks.claim.push(
					b`if (${if_exists_condition}) ${name}.l(${parent_nodes});`
				);
			} else {
				block.chunks.claim.push(
					b`${name}.l(${parent_nodes});`
				);
			}
		}

		if (has_intros || has_outros) {
			block.chunks.intro.push(b`@transition_in(${name});`);
		}

		if (needs_anchor) {
			block.add_element(
				anchor as Identifier,
				x`@empty()`,
				parent_nodes && x`@empty()`,
				parent_node
			);
		}

		this.branches.forEach(branch => {
			branch.fragment.render(branch.block, null, x`#nodes` as unknown as Identifier);
		});
	}

	render_compound(
		block: Block,
		parent_node: Identifier,
		_parent_nodes: Identifier,
		dynamic,
		{ name, anchor, has_else, if_exists_condition, has_transitions },
		detaching
	) {
		const select_block_type = this.renderer.component.get_unique_name('select_block_type');
		const current_block_type = block.get_unique_name('current_block_type');
		const need_select_block_ctx = this.branches.some(branch => branch.get_ctx_name);
		const select_block_ctx = need_select_block_ctx ? block.get_unique_name('select_block_ctx') : null;
		const if_ctx = select_block_ctx ? x`${select_block_ctx}(#ctx, ${current_block_type})` : x`#ctx`;

		const get_block = has_else
			? x`${current_block_type}(${if_ctx})`
			: x`${current_block_type} && ${current_block_type}(${if_ctx})`;

		if (this.needs_update) {
			block.chunks.init.push(b`
				function ${select_block_type}(#ctx, #dirty) {
					${this.branches.map(({ dependencies, condition, snippet }) => {
						return b`${snippet && dependencies.length > 0 ? b`if (${block.renderer.dirty(dependencies)}) ${condition} = null;` : null}`;
					})}
					${this.branches.map(({ condition, snippet, block }) => condition
						? b`
								${snippet && b`if (${condition} == null) ${condition} = !!${snippet}`}
								if (${condition}) return ${block.name};`
						: b`return ${block.name};`
					)}
				}
			`);
		} else {
			block.chunks.init.push(b`
				function ${select_block_type}(#ctx, #dirty) {
					${this.branches.map(({ condition, snippet, block }) => condition
				? b`if (${snippet || condition}) return ${block.name};`
				: b`return ${block.name};`)}
				}
			`);
		}

		if (need_select_block_ctx) {
			// if all branches needs create a context
			if (this.branches.every(branch => branch.get_ctx_name)) {
				block.chunks.init.push(b`
					function ${select_block_ctx}(#ctx, #type) {
						${this.branches.map(({ condition, get_ctx_name, block }) => {
							return condition
								? b`if (#type === ${block.name}) return ${get_ctx_name}(#ctx);`
								: b`return ${get_ctx_name}(#ctx);`;
						}).filter(Boolean)}
					}
				`);
			} else {
				// when not all branches need to create a new context,
				// this code is simpler
				block.chunks.init.push(b`
					function ${select_block_ctx}(#ctx, #type) {
						${this.branches.map(({ get_ctx_name, block }) => {
							return get_ctx_name
								? b`if (#type === ${block.name}) return ${get_ctx_name}(#ctx);`
								: null;
						}).filter(Boolean)}
						return #ctx;
					}
				`);
			}
		}

		block.chunks.init.push(b`
			let ${current_block_type} = ${select_block_type}(#ctx, ${this.renderer.get_initial_dirty()});
			let ${name} = ${get_block};
		`);

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : '#anchor';

		if (if_exists_condition) {
			block.chunks.mount.push(
				b`if (${if_exists_condition}) ${name}.m(${initial_mount_node}, ${anchor_node});`
			);
		} else {
			block.chunks.mount.push(
				b`${name}.m(${initial_mount_node}, ${anchor_node});`
			);
		}

		if (this.needs_update) {
			const update_mount_node = this.get_update_mount_node(anchor);

			const change_block = b`
				${if_exists_condition ? b`if (${if_exists_condition}) ${name}.d(1)` : b`${name}.d(1)`};
				${name} = ${get_block};
				if (${name}) {
					${name}.c();
					${has_transitions && b`@transition_in(${name}, 1);`}
					${name}.m(${update_mount_node}, ${anchor});
				}
			`;

			if (dynamic) {
				block.chunks.update.push(b`
					if (${current_block_type} === (${current_block_type} = ${select_block_type}(#ctx, #dirty)) && ${name}) {
						${name}.p(${if_ctx}, #dirty);
					} else {
						${change_block}
					}
				`);
			} else {
				block.chunks.update.push(b`
					if (${current_block_type} !== (${current_block_type} = ${select_block_type}(#ctx, #dirty))) {
						${change_block}
					}
				`);
			}
		} else if (dynamic) {
			if (if_exists_condition) {
				block.chunks.update.push(b`if (${if_exists_condition}) ${name}.p(${if_ctx}, #dirty);`);
			} else {
				block.chunks.update.push(b`${name}.p(${if_ctx}, #dirty);`);
			}
		}

		if (if_exists_condition) {
			block.chunks.destroy.push(b`
				if (${if_exists_condition}) {
					${name}.d(${detaching});
				}
			`);
		} else {
			block.chunks.destroy.push(b`
				${name}.d(${detaching});
			`);
		}
	}

	// if any of the siblings have outros, we need to keep references to the blocks
	// (TODO does this only apply to bidi transitions?)
	render_compound_with_outros(
		block: Block,
		parent_node: Identifier,
		_parent_nodes: Identifier,
		dynamic,
		{ name, anchor, has_else, has_transitions, if_exists_condition },
		detaching
	) {
		const select_block_type = this.renderer.component.get_unique_name('select_block_type');
		const current_block_type_index = block.get_unique_name('current_block_type_index');
		const previous_block_index = block.get_unique_name('previous_block_index');
		const if_block_creators = block.get_unique_name('if_block_creators');
		const if_blocks = block.get_unique_name('if_blocks');
		const need_select_block_ctx = this.branches.some(branch => branch.get_ctx_name);
		const select_block_ctx = need_select_block_ctx ? block.get_unique_name('select_block_ctx') : null;
		const if_ctx = select_block_ctx ? x`${select_block_ctx}(#ctx, ${current_block_type_index})` : x`#ctx`;

		const if_current_block_type_index = has_else
			? nodes => nodes
			: nodes => b`if (~${current_block_type_index}) { ${nodes} }`;

		block.add_variable(current_block_type_index);
		block.add_variable(name);

		block.chunks.init.push(b`
			const ${if_block_creators} = [
				${this.branches.map(branch => branch.block.name)}
			];

			const ${if_blocks} = [];

			${this.needs_update
				? b`
					function ${select_block_type}(#ctx, #dirty) {
						${this.branches.map(({ dependencies, condition, snippet }) => {
							return b`${snippet && dependencies.length > 0 ? b`if (${block.renderer.dirty(dependencies)}) ${condition} = null;` : null}`;
						})}
						${this.branches.map(({ condition, snippet }, i) => condition
							? b`
								${snippet && b`if (${condition} == null) ${condition} = !!${snippet}`}
								if (${condition}) return ${i};`
							: b`return ${i};`)}
								${!has_else && b`return -1;`}
							}
						`
				: b`
					function ${select_block_type}(#ctx, #dirty) {
						${this.branches.map(({ condition, snippet }, i) => condition
							? b`if (${snippet || condition}) return ${i};`
							: b`return ${i};`)}
						${!has_else && b`return -1;`}
					}
				`}
		`);

		if (need_select_block_ctx) {
			// if all branches needs create a context
			if (this.branches.every(branch => branch.get_ctx_name)) {
				block.chunks.init.push(b`
					function ${select_block_ctx}(#ctx, #index) {
						${this.branches.map(({ condition, get_ctx_name }, i) => {
							return condition
								? b`if (#index === ${i}) return ${get_ctx_name}(#ctx);`
								: b`return ${get_ctx_name}(#ctx);`;
						}).filter(Boolean)}
					}
				`);
			} else {
				// when not all branches need to create a new context,
				// this code is simpler
				block.chunks.init.push(b`
					function ${select_block_ctx}(#ctx, #index) {
						${this.branches.map(({ get_ctx_name }, i) => {
							return get_ctx_name
								? b`if (#index === ${i}) return ${get_ctx_name}(#ctx);`
								: null;
						}).filter(Boolean)}
						return #ctx;
					}
				`);
			}
		}

		if (has_else) {
			block.chunks.init.push(b`
				${current_block_type_index} = ${select_block_type}(#ctx, ${this.renderer.get_initial_dirty()});
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](${if_ctx});
			`);
		} else {
			block.chunks.init.push(b`
				if (~(${current_block_type_index} = ${select_block_type}(#ctx, ${this.renderer.get_initial_dirty()}))) {
					${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](${if_ctx});
				}
			`);
		}

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : '#anchor';

		block.chunks.mount.push(
			if_current_block_type_index(
				b`${if_blocks}[${current_block_type_index}].m(${initial_mount_node}, ${anchor_node});`
			)
		);

		if (this.needs_update) {
			const update_mount_node = this.get_update_mount_node(anchor);

			const destroy_old_block = b`
				@group_outros();
				@transition_out(${if_blocks}[${previous_block_index}], 1, 1, () => {
					${if_blocks}[${previous_block_index}] = null;
				});
				@check_outros();
			`;

			const create_new_block = b`
				${name} = ${if_blocks}[${current_block_type_index}];
				if (!${name}) {
					${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](${if_ctx});
					${name}.c();
				} else {
					${dynamic && b`${name}.p(${if_ctx}, #dirty);`}
				}
				${has_transitions && b`@transition_in(${name}, 1);`}
				${name}.m(${update_mount_node}, ${anchor});
			`;

			const change_block = has_else
				? b`
					${destroy_old_block}

					${create_new_block}
				`
				: b`
					if (${name}) {
						${destroy_old_block}
					}

					if (~${current_block_type_index}) {
						${create_new_block}
					} else {
						${name} = null;
					}
				`;

			block.chunks.update.push(b`
				let ${previous_block_index} = ${current_block_type_index};
				${current_block_type_index} = ${select_block_type}(#ctx, #dirty);
			`);

			if (dynamic) {
				block.chunks.update.push(b`
					if (${current_block_type_index} === ${previous_block_index}) {
						${if_current_block_type_index(b`${if_blocks}[${current_block_type_index}].p(${if_ctx}, #dirty);`)}
					} else {
						${change_block}
					}
				`);
			} else {
				block.chunks.update.push(b`
					if (${current_block_type_index} !== ${previous_block_index}) {
						${change_block}
					}
				`);
			}
		} else if (dynamic) {
			if (if_exists_condition) {
				block.chunks.update.push(b`if (${if_exists_condition}) ${name}.p(${if_ctx}, #dirty);`);
			} else {
				block.chunks.update.push(b`${name}.p(${if_ctx}, #dirty);`);
			}
		}

		block.chunks.destroy.push(
			if_current_block_type_index(b`${if_blocks}[${current_block_type_index}].d(${detaching});`)
		);
	}

	render_simple(
		block: Block,
		parent_node: Identifier,
		_parent_nodes: Identifier,
		dynamic,
		{ name, anchor, if_exists_condition, has_transitions },
		detaching
	) {
		const branch = this.branches[0];
		const if_ctx = branch.get_ctx_name ? x`${branch.get_ctx_name}(#ctx)` : x`#ctx`;

		if (branch.snippet) block.add_variable(branch.condition, branch.snippet);

		block.chunks.init.push(b`
			let ${name} = ${branch.condition} && ${branch.block.name}(${if_ctx});
		`);

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : '#anchor';

		block.chunks.mount.push(
			b`if (${name}) ${name}.m(${initial_mount_node}, ${anchor_node});`
		);

		if (branch.dependencies.length > 0) {
			const update_mount_node = this.get_update_mount_node(anchor);

			const enter = b`
				if (${name}) {
					${dynamic && b`${name}.p(${if_ctx}, #dirty);`}
					${has_transitions &&
						b`if (${block.renderer.dirty(branch.dependencies)}) {
									@transition_in(${name}, 1);
								}`
						}
				} else {
					${name} = ${branch.block.name}(${if_ctx});
					${name}.c();
					${has_transitions && b`@transition_in(${name}, 1);`}
					${name}.m(${update_mount_node}, ${anchor});
				}
			`;

			if (branch.snippet) {
				block.chunks.update.push(b`if (${block.renderer.dirty(branch.dependencies)}) ${branch.condition} = ${branch.snippet}`);
			}

			// no `p()` here — we don't want to update outroing nodes,
			// as that will typically result in glitching
			if (branch.block.has_outro_method) {
				block.chunks.update.push(b`
					if (${branch.condition}) {
						${enter}
					} else if (${name}) {
						@group_outros();
						@transition_out(${name}, 1, 1, () => {
							${name} = null;
						});
						@check_outros();
					}
				`);
			} else {
				block.chunks.update.push(b`
					if (${branch.condition}) {
						${enter}
					} else if (${name}) {
						${name}.d(1);
						${name} = null;
					}
				`);
			}
		} else if (dynamic) {
			block.chunks.update.push(b`
				if (${branch.condition}) ${name}.p(${if_ctx}, #dirty);
			`);
		}

		if (if_exists_condition) {
			block.chunks.destroy.push(b`
				if (${if_exists_condition}) ${name}.d(${detaching});
			`);
		} else {
			block.chunks.destroy.push(b`
				${name}.d(${detaching});
			`);
		}
	}
}
