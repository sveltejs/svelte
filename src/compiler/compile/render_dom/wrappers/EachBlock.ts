import Renderer from '../Renderer';
import Block from '../Block';
import Wrapper from './shared/Wrapper';
import create_debugging_comment from './shared/create_debugging_comment';
import EachBlock from '../../nodes/EachBlock';
import FragmentWrapper from './Fragment';
import deindent from '../../utils/deindent';
import ElseBlock from '../../nodes/ElseBlock';
import { attach_head } from '../../utils/tail';

export class ElseBlockWrapper extends Wrapper {
	node: ElseBlock;
	block: Block;
	fragment: FragmentWrapper;
	is_dynamic: boolean;

	var = null;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: ElseBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.block = block.child({
			comment: create_debugging_comment(node, this.renderer.component),
			name: this.renderer.component.get_unique_name(`create_else_block`),
			type: 'else'
		});

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			this.node.children,
			parent,
			strip_whitespace,
			next_sibling
		);

		this.is_dynamic = this.block.dependencies.size > 0;
	}
}

export default class EachBlockWrapper extends Wrapper {
	block: Block;
	node: EachBlock;
	fragment: FragmentWrapper;
	else?: ElseBlockWrapper;
	vars: {
		create_each_block: string;
		each_block_value: string;
		get_each_context: string;
		iterations: string;
		fixed_length: number;
		data_length: string;
		view_length: string;
		length: string;
	}

	context_props: string[];
	index_name: string;

	var = 'each';

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

		const { dependencies } = node.expression;
		block.add_dependencies(dependencies);

		this.block = block.child({
			comment: create_debugging_comment(this.node, this.renderer.component),
			name: renderer.component.get_unique_name('create_each_block'),
			type: 'each',
			// @ts-ignore todo: probably error
			key: node.key as string,

			bindings: new Map(block.bindings)
		});

		// TODO this seems messy
		this.block.has_animation = this.node.has_animation;

		this.index_name = this.node.index || renderer.component.get_unique_name(`${this.node.context}_index`);

		const fixed_length =
			node.expression.node.type === 'ArrayExpression' &&
			node.expression.node.elements.every(element => element.type !== 'SpreadElement')
				? node.expression.node.elements.length
				: null;

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.node.start + 2;
		while (renderer.component.source[c] !== 'e') c += 1;
		renderer.component.code.overwrite(c, c + 4, 'length');

		const each_block_value = renderer.component.get_unique_name(`${this.var}_value`);
		const iterations = block.get_unique_name(`${this.var}_blocks`);

		this.vars = {
			create_each_block: this.block.name,
			each_block_value,
			get_each_context: renderer.component.get_unique_name(`get_${this.var}_context`),
			iterations,
			length: `[✂${c}-${c+4}✂]`,

			// optimisation for array literal
			fixed_length,
			data_length: fixed_length === null ? `${each_block_value}.[✂${c}-${c+4}✂]` : fixed_length,
			view_length: fixed_length === null ? `${iterations}.b.[✂${c}-${c+4}✂]` : fixed_length
		};

		const store = 
			node.expression.node.type === 'Identifier' && 
			node.expression.node.name[0] === '$'
				? node.expression.node.name.slice(1)
				: null;

		node.contexts.forEach(prop => {
			this.block.bindings.set(prop.key.name, {
				object: this.vars.each_block_value,
				property: this.index_name,
				snippet: attach_head(`${this.vars.each_block_value}[${this.index_name}]`, prop.tail),
				store,
				tail: attach_head(`[${this.index_name}]`, prop.tail)
			});
		});

		if (this.node.index) {
			this.block.get_unique_name(this.node.index); // this prevents name collisions (#1254)
		}

		renderer.blocks.push(this.block);

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, this, strip_whitespace, next_sibling);

		if (this.node.else) {
			this.else = new ElseBlockWrapper(
				renderer,
				block,
				this,
				this.node.else,
				strip_whitespace,
				next_sibling
			);

			renderer.blocks.push(this.else.block);

			if (this.else.is_dynamic) {
				this.block.add_dependencies(this.else.block.dependencies);
			}
		}

		block.add_dependencies(this.block.dependencies);

		if (this.block.has_outros || (this.else && this.else.block.has_outros)) {
			block.add_outro();
		}
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		if (this.fragment.nodes.length === 0) return;

		const { renderer } = this;

		const needs_anchor = this.next
			? !this.next.is_dom_node() :
			!parent_node || !this.parent.is_dom_node();

		this.context_props = this.node.contexts.map(prop => `child_ctx.${prop.key.name} = ${attach_head('list[i]', prop.tail)};`);

		if (this.node.has_binding) this.context_props.push(`child_ctx.${this.vars.each_block_value} = list;`);
		if (this.node.has_binding || this.node.index) this.context_props.push(`child_ctx.${this.index_name} = i;`);

		const snippet = this.node.expression.render(block);

		renderer.blocks.push(deindent`
			function ${this.vars.get_each_context}(ctx, list, i) {
				const child_ctx = @_Object.create(ctx);
				${this.context_props}
				return child_ctx;
			}
		`);

		const initial_anchor_node = parent_node ? 'null' : 'anchor';
		const initial_mount_node = parent_node || '#target';
		const update_anchor_node = needs_anchor
			? block.get_unique_name(`${this.var}_anchor`)
			: (this.next && this.next.var) || 'null';
		const update_mount_node = this.get_update_mount_node(update_anchor_node);

		block.builders.init.add_line(`let ${this.vars.each_block_value} = ${snippet};`);

		const { iterations } = this.vars
		block.builders.init.add_block(deindent`
			let ${iterations} = @init_each_block(
				ctx,
				${this.vars.get_each_context},
				ctx => ${snippet},
				${this.node.key ? `ctx => ${this.node.key.render()}` : 'null'},
				${this.vars.create_each_block},
				${this.else ? this.else.block.name : 'null'}
			);
		`)

		const args = {
			block,
			parent_node,
			parent_nodes,
			snippet,
			update_anchor_node,
			update_mount_node
		};

		if (this.node.key) {
			this.render_keyed(args);
		} else {
			this.render_unkeyed(args);
		}

		block.builders.create.add_block(deindent`
			@create_each_blocks(${iterations});
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.builders.claim.add_block(deindent`
				@claim_each_blocks(${iterations}, ${parent_nodes});
			`);
		}

		block.builders.mount.add_block(deindent`
			@mount_each_blocks(${iterations}, ${initial_mount_node}, ${initial_anchor_node});
		`);

		if (this.block.has_intro_method || this.block.has_outro_method) {
			block.builders.intro.add_block(deindent`
				for (let #i = 0; #i < ${this.vars.data_length}; #i += 1) {
					@transition_in(${iterations}.b[#i]);
				}
			`);
		}

		if (needs_anchor) {
			block.add_element(
				update_anchor_node,
				`@empty()`,
				parent_nodes && `@empty()`,
				parent_node
			);
		}

		if (this.else) {
			const each_block_else = `${iterations}.e`;

			if (this.else.block.has_update_method) {
				block.builders.update.add_block(deindent`
					if (!${this.vars.data_length} && ${each_block_else}) {
						${each_block_else}.p(changed, ctx);
					} else if (!${this.vars.data_length}) {
						${each_block_else} = ${this.else.block.name}(ctx);
						${each_block_else}.c();
						${each_block_else}.m(${update_mount_node}, ${update_anchor_node});
					} else if (${each_block_else}) {
						${each_block_else}.d(1);
						${each_block_else} = null;
					}
				`);
			} else {
				block.builders.update.add_block(deindent`
					if (${this.vars.data_length}) {
						if (${each_block_else}) {
							${each_block_else}.d(1);
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else.block.name}(ctx);
						${each_block_else}.c();
						${each_block_else}.m(${update_mount_node}, ${update_anchor_node});
					}
				`);
			}
		}

		this.fragment.render(this.block, null, 'nodes');

		if (this.else) {
			this.else.fragment.render(this.else.block, null, 'nodes');
		}
	}

	render_keyed({
		block,
		parent_node,
		parent_nodes,
		snippet,
		update_anchor_node,
		update_mount_node
	}: {
		block: Block;
		parent_node: string;
		parent_nodes: string;
		snippet: string;
		update_anchor_node: string;
		update_mount_node: string;
	}) {
		const {
			iterations,
			view_length
		} = this.vars;

		if (this.fragment.nodes[0].is_dom_node()) {
			this.block.first = this.fragment.nodes[0].var;
		} else {
			this.block.first = this.block.get_unique_name('first');
			this.block.add_element(
				this.block.first,
				`@empty()`,
				parent_nodes && `@empty()`,
				null
			);
		}

		const dynamic = this.block.has_update_method;

		const destroy = this.node.has_animation
			? (this.block.has_outros
				? `@fix_and_outro_and_destroy_block`
				: `@fix_and_destroy_block`)
			: this.block.has_outros
				? `@outro_and_destroy_block`
				: `@destroy_block`;

		block.builders.update.add_block(deindent`
			const ${this.vars.each_block_value} = ${snippet};

			${this.block.has_outros && `@group_outros();`}
			${this.node.has_animation && `for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}.b[#i].r();`}
			@update_keyed_each(
				${iterations},
				changed,
				${dynamic ? '1' : '0'},
				ctx,
				${update_mount_node},
				${destroy},
				${update_anchor_node}
			);
			${this.node.has_animation && `for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}.b[#i].a();`}
			${this.block.has_outros && `@check_outros();`}
		`);

		if (this.block.has_outros) {
			block.builders.outro.add_block(deindent`
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					@transition_out(${iterations}.b[#i]);
				}
			`);
		}

		block.builders.destroy.add_block(deindent`
			@destroy_each_blocks(${iterations}, ${parent_node ? '' : 'detaching'});
		`);
	}

	render_unkeyed({
		block,
		snippet,
		update_anchor_node,
		update_mount_node
	}: {
		block: Block;
		snippet: string;
		update_anchor_node: string;
		update_mount_node: string;
	}) {
		const {
			create_each_block,
			length,
			iterations,
			fixed_length,
			view_length
		} = this.vars;

		const all_dependencies = new Set(this.block.dependencies);
		const { dependencies } = this.node.expression;
		dependencies.forEach((dependency: string) => {
			all_dependencies.add(dependency);
		});

		const condition = Array.from(all_dependencies)
			.map(dependency => `changed.${dependency}`)
			.join(' || ');

		const has_transitions = !!(this.block.has_intro_method || this.block.has_outro_method);

		if (condition !== '') {
			const for_loop_body = this.block.has_update_method
				? deindent`
					if (${iterations}.b[#i]) {
						${iterations}.b[#i].p(changed, child_ctx);
						${has_transitions && `@transition_in(${this.vars.iterations}.b[#i], 1);`}
					} else {
						${iterations}.b[#i] = ${create_each_block}(child_ctx);
						${iterations}.b[#i].c();
						${has_transitions && `@transition_in(${this.vars.iterations}.b[#i], 1);`}
						${iterations}.b[#i].m(${update_mount_node}, ${update_anchor_node});
					}
				`
				: has_transitions
					? deindent`
						if (${iterations}.b[#i]) {
							@transition_in(${this.vars.iterations}.b[#i], 1);
						} else {
							${iterations}.b[#i] = ${create_each_block}(child_ctx);
							${iterations}.b[#i].c();
							@transition_in(${this.vars.iterations}.b[#i], 1);
							${iterations}.b[#i].m(${update_mount_node}, ${update_anchor_node});
						}
					`
					: deindent`
						if (!${iterations}.b[#i]) {
							${iterations}.b[#i] = ${create_each_block}(child_ctx);
							${iterations}.b[#i].c();
							${iterations}.b[#i].m(${update_mount_node}, ${update_anchor_node});
						}
					`;

			const start = this.block.has_update_method ? '0' : `#old_length`;

			let remove_old_blocks;

			if (this.block.has_outros) {
				const out = block.get_unique_name('out');

				block.builders.init.add_block(deindent`
					const ${out} = i => @transition_out(${iterations}.b[i], 1, 1, () => {
						${iterations}.b[i] = null;
					});
				`);
				remove_old_blocks = deindent`
					@group_outros();
					for (#i = ${this.vars.each_block_value}.${length}; #i < ${view_length}; #i += 1) {
						${out}(#i);
					}
					@check_outros();
				`;
			} else {
				remove_old_blocks = deindent`
					for (${this.block.has_update_method ? `` : `#i = ${this.vars.each_block_value}.${length}`}; #i < ${this.block.has_update_method ? view_length : '#old_length'}; #i += 1) {
						${iterations}.b[#i].d(1);
					}
					${!fixed_length && `${view_length} = ${this.vars.each_block_value}.${length};`}
				`;
			}

			// We declare `i` as block scoped here, as the `remove_old_blocks` code
			// may rely on continuing where this iteration stopped.
			const update = deindent`
				${!this.block.has_update_method && `const #old_length = ${this.vars.each_block_value}.length;`}
				${this.vars.each_block_value} = ${snippet};

				let #i;
				for (#i = ${start}; #i < ${this.vars.each_block_value}.${length}; #i += 1) {
					const child_ctx = ${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i);

					${for_loop_body}
				}

				${remove_old_blocks}
			`;

			block.builders.update.add_block(deindent`
				if (${condition}) {
					${update}
				}
			`);
		}

		if (this.block.has_outros) {
			block.builders.outro.add_block(deindent`
				${iterations}.b = ${iterations}.b.filter(@_Boolean);
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					@transition_out(${iterations}.b[#i]);
				}
			`);
		}

		block.builders.destroy.add_block(`@destroy_each_blocks(${iterations}, detaching);`);
	}
}
