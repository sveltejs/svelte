import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import EachBlock from '../../nodes/EachBlock';
import IfBlock from '../../nodes/IfBlock';
import create_debugging_comment from './shared/create_debugging_comment';
import ElseBlock from '../../nodes/ElseBlock';
import FragmentWrapper from './Fragment';
import deindent from '../../utils/deindent';

function is_else_if(node: ElseBlock) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

class IfBlockBranch extends Wrapper {
	block: Block;
	fragment: FragmentWrapper;
	condition: string;
	is_dynamic: boolean;

	var = null;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: IfBlockWrapper,
		node: IfBlock | ElseBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.condition = (node as IfBlock).expression && (node as IfBlock).expression.render(block);

		this.block = block.child({
			comment: create_debugging_comment(node, parent.renderer.component),
			name: parent.renderer.component.get_unique_name(
				(node as IfBlock).expression ? `create_if_block` : `create_else_block`
			)
		});

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, parent, strip_whitespace, next_sibling);

		this.is_dynamic = this.block.dependencies.size > 0;
	}
}

export default class IfBlockWrapper extends Wrapper {
	node: IfBlock;
	branches: IfBlockBranch[];

	var = 'if_block';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: EachBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannot_use_innerhtml();

		this.branches = [];

		const blocks: Block[] = [];
		let is_dynamic = false;
		let has_intros = false;
		let has_outros = false;

		const create_branches = (node: IfBlock) => {
			const branch = new IfBlockBranch(
				renderer,
				block,
				this,
				node,
				strip_whitespace,
				next_sibling
			);

			this.branches.push(branch);

			blocks.push(branch.block);
			block.add_dependencies(node.expression.dependencies);

			if (branch.block.dependencies.size > 0) {
				is_dynamic = true;
				block.add_dependencies(branch.block.dependencies);
			}

			if (branch.block.has_intros) has_intros = true;
			if (branch.block.has_outros) has_outros = true;

			if (is_else_if(node.else)) {
				create_branches(node.else.children[0] as IfBlock);
			} else if (node.else) {
				const branch = new IfBlockBranch(
					renderer,
					block,
					this,
					node.else,
					strip_whitespace,
					next_sibling
				);

				this.branches.push(branch);

				blocks.push(branch.block);

				if (branch.block.dependencies.size > 0) {
					is_dynamic = true;
					block.add_dependencies(branch.block.dependencies);
				}

				if (branch.block.has_intros) has_intros = true;
				if (branch.block.has_outros) has_outros = true;
			}
		};

		create_branches(this.node);

		blocks.forEach(block => {
			block.has_update_method = is_dynamic;
			block.has_intro_method = has_intros;
			block.has_outro_method = has_outros;
		});

		renderer.blocks.push(...blocks);
	}

	render(
		block: Block,
		parent_node: string,
		parent_nodes: string
	) {
		const name = this.var;

		const needs_anchor = this.next ? !this.next.is_dom_node() : !parent_node || !this.parent.is_dom_node();
		const anchor = needs_anchor
			? block.get_unique_name(`${name}_anchor`)
			: (this.next && this.next.var) || 'null';

		const has_else = !(this.branches[this.branches.length - 1].condition);
		const if_name = has_else ? '' : `if (${name}) `;

		const dynamic = this.branches[0].block.has_update_method; // can use [0] as proxy for all, since they necessarily have the same value
		const has_intros = this.branches[0].block.has_intro_method;
		const has_outros = this.branches[0].block.has_outro_method;
		const has_transitions = has_intros || has_outros;

		const vars = { name, anchor, if_name, has_else, has_transitions };

		const detaching = (parent_node && parent_node !== '@document.head') ? '' : 'detaching';

		if (this.node.else) {
			if (has_outros) {
				this.render_compound_with_outros(block, parent_node, parent_nodes, dynamic, vars, detaching);

				block.builders.outro.add_line(`if (${name}) ${name}.o();`);
			} else {
				this.render_compound(block, parent_node, parent_nodes, dynamic, vars, detaching);
			}
		} else {
			this.render_simple(block, parent_node, parent_nodes, dynamic, vars, detaching);

			if (has_outros) {
				block.builders.outro.add_line(`if (${name}) ${name}.o();`);
			}
		}

		block.builders.create.add_line(`${if_name}${name}.c();`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.builders.claim.add_line(
				`${if_name}${name}.l(${parent_nodes});`
			);
		}

		if (has_intros || has_outros) {
			block.builders.intro.add_line(`if (${name}) ${name}.i();`);
		}

		if (needs_anchor) {
			block.add_element(
				anchor,
				`@empty()`,
				parent_nodes && `@empty()`,
				parent_node
			);
		}

		this.branches.forEach(branch => {
			branch.fragment.render(branch.block, null, 'nodes');
		});
	}

	render_compound(
		block: Block,
		parent_node: string,
		_parent_nodes: string,
		dynamic,
		{ name, anchor, has_else, if_name, has_transitions },
		detaching
	) {
		const select_block_type = this.renderer.component.get_unique_name(`select_block_type`);
		const current_block_type = block.get_unique_name(`current_block_type`);
		const current_block_type_and = has_else ? '' : `${current_block_type} && `;

		/* eslint-disable @typescript-eslint/indent,indent */
		block.builders.init.add_block(deindent`
			function ${select_block_type}(ctx) {
				${this.branches
					.map(({ condition, block }) => `${condition ? `if (${condition}) ` : ''}return ${block.name};`)
					.join('\n')}
			}
		`);
		/* eslint-enable @typescript-eslint/indent,indent */

		block.builders.init.add_block(deindent`
			var ${current_block_type} = ${select_block_type}(ctx);
			var ${name} = ${current_block_type_and}${current_block_type}(ctx);
		`);

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : 'anchor';
		block.builders.mount.add_line(
			`${if_name}${name}.m(${initial_mount_node}, ${anchor_node});`
		);

		const update_mount_node = this.get_update_mount_node(anchor);

		const change_block = deindent`
			${if_name}${name}.d(1);
			${name} = ${current_block_type_and}${current_block_type}(ctx);
			if (${name}) {
				${name}.c();
				${has_transitions && `${name}.i(1);`}
				${name}.m(${update_mount_node}, ${anchor});
			}
		`;

		if (dynamic) {
			block.builders.update.add_block(deindent`
				if (${current_block_type} === (${current_block_type} = ${select_block_type}(ctx)) && ${name}) {
					${name}.p(changed, ctx);
				} else {
					${change_block}
				}
			`);
		} else {
			block.builders.update.add_block(deindent`
				if (${current_block_type} !== (${current_block_type} = ${select_block_type}(ctx))) {
					${change_block}
				}
			`);
		}

		block.builders.destroy.add_line(`${if_name}${name}.d(${detaching});`);
	}

	// if any of the siblings have outros, we need to keep references to the blocks
	// (TODO does this only apply to bidi transitions?)
	render_compound_with_outros(
		block: Block,
		parent_node: string,
		_parent_nodes: string,
		dynamic,
		{ name, anchor, has_else, has_transitions },
		detaching
	) {
		const select_block_type = this.renderer.component.get_unique_name(`select_block_type`);
		const current_block_type_index = block.get_unique_name(`current_block_type_index`);
		const previous_block_index = block.get_unique_name(`previous_block_index`);
		const if_block_creators = block.get_unique_name(`if_block_creators`);
		const if_blocks = block.get_unique_name(`if_blocks`);

		const if_current_block_type_index = has_else
			? ''
			: `if (~${current_block_type_index}) `;

		block.add_variable(current_block_type_index);
		block.add_variable(name);

		/* eslint-disable @typescript-eslint/indent,indent */
		block.builders.init.add_block(deindent`
			var ${if_block_creators} = [
				${this.branches.map(branch => branch.block.name).join(',\n')}
			];

			var ${if_blocks} = [];

			function ${select_block_type}(ctx) {
				${this.branches
					.map(({ condition }, i) => `${condition ? `if (${condition}) ` : ''}return ${i};`)
					.join('\n')}
				${!has_else && `return -1;`}
			}
		`);
		/* eslint-enable @typescript-eslint/indent,indent */

		if (has_else) {
			block.builders.init.add_block(deindent`
				${current_block_type_index} = ${select_block_type}(ctx);
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](ctx);
			`);
		} else {
			block.builders.init.add_block(deindent`
				if (~(${current_block_type_index} = ${select_block_type}(ctx))) {
					${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](ctx);
				}
			`);
		}

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : 'anchor';

		block.builders.mount.add_line(
			`${if_current_block_type_index}${if_blocks}[${current_block_type_index}].m(${initial_mount_node}, ${anchor_node});`
		);

		const update_mount_node = this.get_update_mount_node(anchor);

		const destroy_old_block = deindent`
			@group_outros();
			@on_outro(() => {
				${if_blocks}[${previous_block_index}].d(1);
				${if_blocks}[${previous_block_index}] = null;
			});
			${name}.o(1);
			@check_outros();
		`;

		const create_new_block = deindent`
			${name} = ${if_blocks}[${current_block_type_index}];
			if (!${name}) {
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](ctx);
				${name}.c();
			}
			${has_transitions && `${name}.i(1);`}
			${name}.m(${update_mount_node}, ${anchor});
		`;

		const change_block = has_else
			? deindent`
				${destroy_old_block}

				${create_new_block}
			`
			: deindent`
				if (${name}) {
					${destroy_old_block}
				}

				if (~${current_block_type_index}) {
					${create_new_block}
				} else {
					${name} = null;
				}
			`;

		if (dynamic) {
			block.builders.update.add_block(deindent`
				var ${previous_block_index} = ${current_block_type_index};
				${current_block_type_index} = ${select_block_type}(ctx);
				if (${current_block_type_index} === ${previous_block_index}) {
					${if_current_block_type_index}${if_blocks}[${current_block_type_index}].p(changed, ctx);
				} else {
					${change_block}
				}
			`);
		} else {
			block.builders.update.add_block(deindent`
				var ${previous_block_index} = ${current_block_type_index};
				${current_block_type_index} = ${select_block_type}(ctx);
				if (${current_block_type_index} !== ${previous_block_index}) {
					${change_block}
				}
			`);
		}

		block.builders.destroy.add_line(deindent`
			${if_current_block_type_index}${if_blocks}[${current_block_type_index}].d(${detaching});
		`);
	}

	render_simple(
		block: Block,
		parent_node: string,
		_parent_nodes: string,
		dynamic,
		{ name, anchor, if_name, has_transitions },
		detaching
	) {
		const branch = this.branches[0];

		block.builders.init.add_block(deindent`
			var ${name} = (${branch.condition}) && ${branch.block.name}(ctx);
		`);

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : 'anchor';

		block.builders.mount.add_line(
			`if (${name}) ${name}.m(${initial_mount_node}, ${anchor_node});`
		);

		const update_mount_node = this.get_update_mount_node(anchor);

		const enter = dynamic
			? deindent`
				if (${name}) {
					${name}.p(changed, ctx);
					${has_transitions && `${name}.i(1);`}
				} else {
					${name} = ${branch.block.name}(ctx);
					${name}.c();
					${has_transitions && `${name}.i(1);`}
					${name}.m(${update_mount_node}, ${anchor});
				}
			`
			: deindent`
				if (!${name}) {
					${name} = ${branch.block.name}(ctx);
					${name}.c();
					${has_transitions && `${name}.i(1);`}
					${name}.m(${update_mount_node}, ${anchor});
				${has_transitions && `} else {
					${name}.i(1);`}
				}
			`;

		// no `p()` here — we don't want to update outroing nodes,
		// as that will typically result in glitching
		const exit = branch.block.has_outro_method
			? deindent`
				@group_outros();
				@on_outro(() => {
					${name}.d(1);
					${name} = null;
				});

				${name}.o(1);
				@check_outros();
			`
			: deindent`
				${name}.d(1);
				${name} = null;
			`;

		block.builders.update.add_block(deindent`
			if (${branch.condition}) {
				${enter}
			} else if (${name}) {
				${exit}
			}
		`);

		block.builders.destroy.add_line(`${if_name}${name}.d(${detaching});`);
	}
}
