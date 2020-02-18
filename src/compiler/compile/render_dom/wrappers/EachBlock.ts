import Renderer from '../Renderer';
import Block from '../Block';
import Wrapper from './shared/Wrapper';
import create_debugging_comment from './shared/create_debugging_comment';
import EachBlock from '../../nodes/EachBlock';
import FragmentWrapper from './Fragment';
import { b, x } from 'code-red';
import ElseBlock from '../../nodes/ElseBlock';
import { Identifier, Node } from 'estree';

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
		create_each_block: Identifier;
		each_block_value: Identifier;
		get_each_context: Identifier;
		iterations: Identifier;
		fixed_length: number;
		data_length: string;
		view_length: string;
	}

	context_props: Array<Node | Node[]>;
	index_name: Identifier;

	var: Identifier = { type: 'Identifier', name: 'each' };

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
		this.not_static_content();

		const { dependencies } = node.expression;
		block.add_dependencies(dependencies);

		this.node.contexts.forEach(context => {
			renderer.add_to_context(context.key.name, true);
		});

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

		this.index_name = this.node.index
			? { type: 'Identifier', name: this.node.index }
			: renderer.component.get_unique_name(`${this.node.context}_index`);

		const fixed_length =
			node.expression.node.type === 'ArrayExpression' &&
			node.expression.node.elements.every(element => element.type !== 'SpreadElement')
				? node.expression.node.elements.length
				: null;

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.node.start + 2;
		while (renderer.component.source[c] !== 'e') c += 1;
		const start = renderer.component.locate(c);
		const end = { line: start.line, column: start.column + 4 };
		const length = {
			type: 'Identifier',
			name: 'length',
			loc: { start, end }
		};

		const each_block_value = renderer.component.get_unique_name(`${this.var.name}_value`);
		const iterations = block.get_unique_name(`${this.var.name}_blocks`);

		renderer.add_to_context(each_block_value.name, true);
		renderer.add_to_context(this.index_name.name, true);

		this.vars = {
			create_each_block: this.block.name,
			each_block_value,
			get_each_context: renderer.component.get_unique_name(`get_${this.var.name}_context`),
			iterations,

			// optimisation for array literal
			fixed_length,
			data_length: fixed_length === null ? x`${each_block_value}.${length}` : fixed_length,
			view_length: fixed_length === null ? x`${iterations}.length` : fixed_length
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
				modifier: prop.modifier,
				snippet: prop.modifier(x`${this.vars.each_block_value}[${this.index_name}]` as Node),
				store,
				tail: prop.modifier(x`[${this.index_name}]` as Node)
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

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		if (this.fragment.nodes.length === 0) return;

		const { renderer } = this;
		const { component } = renderer;

		const needs_anchor = this.next
			? !this.next.is_dom_node() :
			!parent_node || !this.parent.is_dom_node();

		this.context_props = this.node.contexts.map(prop => b`child_ctx[${renderer.context_lookup.get(prop.key.name).index}] = ${prop.modifier(x`list[i]`)};`);

		if (this.node.has_binding) this.context_props.push(b`child_ctx[${renderer.context_lookup.get(this.vars.each_block_value.name).index}] = list;`);
		if (this.node.has_binding || this.node.index) this.context_props.push(b`child_ctx[${renderer.context_lookup.get(this.index_name.name).index}] = i;`);

		const snippet = this.node.expression.manipulate(block);

		block.chunks.init.push(b`let ${this.vars.each_block_value} = ${snippet};`);
		if (this.renderer.options.dev) {
			block.chunks.init.push(b`@validate_each_argument(${this.vars.each_block_value});`);
		}

		// TODO which is better — Object.create(array) or array.slice()?
		renderer.blocks.push(b`
			function ${this.vars.get_each_context}(#ctx, list, i) {
				const child_ctx = #ctx.slice();
				${this.context_props}
				return child_ctx;
			}
		`);

		const initial_anchor_node: Identifier = { type: 'Identifier', name: parent_node ? 'null' : 'anchor' };
		const initial_mount_node: Identifier = parent_node || { type: 'Identifier', name: '#target' };
		const update_anchor_node = needs_anchor
			? block.get_unique_name(`${this.var.name}_anchor`)
			: (this.next && this.next.var) || { type: 'Identifier', name: 'null' };
		const update_mount_node: Identifier = this.get_update_mount_node((update_anchor_node as Identifier));

		const args = {
			block,
			parent_node,
			parent_nodes,
			snippet,
			initial_anchor_node,
			initial_mount_node,
			update_anchor_node,
			update_mount_node
		};

		if (this.node.key) {
			this.render_keyed(args);
		} else {
			this.render_unkeyed(args);
		}

		if (this.block.has_intro_method || this.block.has_outro_method) {
			block.chunks.intro.push(b`
				for (let #i = 0; #i < ${this.vars.data_length}; #i += 1) {
					@transition_in(${this.vars.iterations}[#i]);
				}
			`);
		}

		if (needs_anchor) {
			block.add_element(
				update_anchor_node as Identifier,
				x`@empty()`,
				parent_nodes && x`@empty()`,
				parent_node
			);
		}

		if (this.else) {
			const each_block_else = component.get_unique_name(`${this.var.name}_else`);

			block.chunks.init.push(b`let ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.chunks.init.push(b`
				if (!${this.vars.data_length}) {
					${each_block_else} = ${this.else.block.name}(#ctx);
				}
			`);

			block.chunks.create.push(b`
				if (${each_block_else}) {
					${each_block_else}.c();
				}
			`);

			if (this.renderer.options.hydratable) {
				block.chunks.claim.push(b`
					if (${each_block_else}) {
						${each_block_else}.l(${parent_nodes});
					}
				`);
			}

			block.chunks.mount.push(b`
				if (${each_block_else}) {
					${each_block_else}.m(${initial_mount_node}, ${initial_anchor_node});
				}
			`);

			if (this.else.block.has_update_method) {
				block.chunks.update.push(b`
					if (!${this.vars.data_length} && ${each_block_else}) {
						${each_block_else}.p(#ctx, #dirty);
					} else if (!${this.vars.data_length}) {
						${each_block_else} = ${this.else.block.name}(#ctx);
						${each_block_else}.c();
						${each_block_else}.m(${update_mount_node}, ${update_anchor_node});
					} else if (${each_block_else}) {
						${each_block_else}.d(1);
						${each_block_else} = null;
					}
				`);
			} else {
				block.chunks.update.push(b`
					if (${this.vars.data_length}) {
						if (${each_block_else}) {
							${each_block_else}.d(1);
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else.block.name}(#ctx);
						${each_block_else}.c();
						${each_block_else}.m(${update_mount_node}, ${update_anchor_node});
					}
				`);
			}

			block.chunks.destroy.push(b`
				if (${each_block_else}) ${each_block_else}.d(${parent_node ? '' : 'detaching'});
			`);
		}

		this.fragment.render(this.block, null, x`#nodes` as Identifier);

		if (this.else) {
			this.else.fragment.render(this.else.block, null, x`#nodes` as Identifier);
		}
	}

	render_keyed({
		block,
		parent_node,
		parent_nodes,
		snippet,
		initial_anchor_node,
		initial_mount_node,
		update_anchor_node,
		update_mount_node
	}: {
		block: Block;
		parent_node: Identifier;
		parent_nodes: Identifier;
		snippet: Node;
		initial_anchor_node: Identifier;
		initial_mount_node: Identifier;
		update_anchor_node: Identifier;
		update_mount_node: Identifier;
	}) {
		const {
			create_each_block,
			iterations,
			data_length,
			view_length
		} = this.vars;

		const get_key = block.get_unique_name('get_key');
		const lookup = block.get_unique_name(`${this.var.name}_lookup`);

		block.add_variable(iterations, x`[]`);
		block.add_variable(lookup, x`new @_Map()`);

		if (this.fragment.nodes[0].is_dom_node()) {
			this.block.first = this.fragment.nodes[0].var;
		} else {
			this.block.first = this.block.get_unique_name('first');
			this.block.add_element(
				this.block.first,
				x`@empty()`,
				parent_nodes && x`@empty()`,
				null
			);
		}

		block.chunks.init.push(b`
			const ${get_key} = #ctx => ${this.node.key.manipulate(block)};

			${this.renderer.options.dev && b`@validate_each_keys(#ctx, ${this.vars.each_block_value}, ${this.vars.get_each_context}, ${get_key});`}
			for (let #i = 0; #i < ${data_length}; #i += 1) {
				let child_ctx = ${this.vars.get_each_context}(#ctx, ${this.vars.each_block_value}, #i);
				let key = ${get_key}(child_ctx);
				${lookup}.set(key, ${iterations}[#i] = ${create_each_block}(key, child_ctx));
			}
		`);

		block.chunks.create.push(b`
			for (let #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].c();
			}
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.chunks.claim.push(b`
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					${iterations}[#i].l(${parent_nodes});
				}
			`);
		}

		block.chunks.mount.push(b`
			for (let #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].m(${initial_mount_node}, ${initial_anchor_node});
			}
		`);

		const dynamic = this.block.has_update_method;

		const destroy = this.node.has_animation
			? (this.block.has_outros
				? `@fix_and_outro_and_destroy_block`
				: `@fix_and_destroy_block`)
			: this.block.has_outros
				? `@outro_and_destroy_block`
				: `@destroy_block`;

		const all_dependencies = new Set(this.block.dependencies); // TODO should be dynamic deps only
		this.node.expression.dynamic_dependencies().forEach((dependency: string) => {
			all_dependencies.add(dependency);
		});

		if (all_dependencies.size) {
			block.chunks.update.push(b`
				if (${block.renderer.dirty(Array.from(all_dependencies))}) {
					const ${this.vars.each_block_value} = ${snippet};
					${this.renderer.options.dev && b`@validate_each_argument(${this.vars.each_block_value});`}

					${this.block.has_outros && b`@group_outros();`}
					${this.node.has_animation && b`for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].r();`}
					${this.renderer.options.dev && b`@validate_each_keys(#ctx, ${this.vars.each_block_value}, ${this.vars.get_each_context}, ${get_key});`}
					${iterations} = @update_keyed_each(${iterations}, #dirty, ${get_key}, ${dynamic ? 1 : 0}, #ctx, ${this.vars.each_block_value}, ${lookup}, ${update_mount_node}, ${destroy}, ${create_each_block}, ${update_anchor_node}, ${this.vars.get_each_context});
					${this.node.has_animation && b`for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].a();`}
					${this.block.has_outros && b`@check_outros();`}
				}
			`);
		}

		if (this.block.has_outros) {
			block.chunks.outro.push(b`
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					@transition_out(${iterations}[#i]);
				}
			`);
		}

		block.chunks.destroy.push(b`
			for (let #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].d(${parent_node ? null : 'detaching'});
			}
		`);
	}

	render_unkeyed({
		block,
		parent_nodes,
		snippet,
		initial_anchor_node,
		initial_mount_node,
		update_anchor_node,
		update_mount_node
	}: {
		block: Block;
		parent_nodes: Identifier;
		snippet: Node;
		initial_anchor_node: Identifier;
		initial_mount_node: Identifier;
		update_anchor_node: Identifier;
		update_mount_node: Identifier;
	}) {
		const {
			create_each_block,
			iterations,
			fixed_length,
			data_length,
			view_length
		} = this.vars;

		block.chunks.init.push(b`
			let ${iterations} = [];

			for (let #i = 0; #i < ${data_length}; #i += 1) {
				${iterations}[#i] = ${create_each_block}(${this.vars.get_each_context}(#ctx, ${this.vars.each_block_value}, #i));
			}
		`);

		block.chunks.create.push(b`
			for (let #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].c();
			}
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.chunks.claim.push(b`
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					${iterations}[#i].l(${parent_nodes});
				}
			`);
		}

		block.chunks.mount.push(b`
			for (let #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].m(${initial_mount_node}, ${initial_anchor_node});
			}
		`);

		const all_dependencies = new Set(this.block.dependencies); // TODO should be dynamic deps only
		this.node.expression.dynamic_dependencies().forEach((dependency: string) => {
			all_dependencies.add(dependency);
		});

		if (all_dependencies.size) {
			const has_transitions = !!(this.block.has_intro_method || this.block.has_outro_method);

			const for_loop_body = this.block.has_update_method
				? b`
					if (${iterations}[#i]) {
						${iterations}[#i].p(child_ctx, #dirty);
						${has_transitions && b`@transition_in(${this.vars.iterations}[#i], 1);`}
					} else {
						${iterations}[#i] = ${create_each_block}(child_ctx);
						${iterations}[#i].c();
						${has_transitions && b`@transition_in(${this.vars.iterations}[#i], 1);`}
						${iterations}[#i].m(${update_mount_node}, ${update_anchor_node});
					}
				`
				: has_transitions
					? b`
						if (${iterations}[#i]) {
							@transition_in(${this.vars.iterations}[#i], 1);
						} else {
							${iterations}[#i] = ${create_each_block}(child_ctx);
							${iterations}[#i].c();
							@transition_in(${this.vars.iterations}[#i], 1);
							${iterations}[#i].m(${update_mount_node}, ${update_anchor_node});
						}
					`
					: b`
						if (!${iterations}[#i]) {
							${iterations}[#i] = ${create_each_block}(child_ctx);
							${iterations}[#i].c();
							${iterations}[#i].m(${update_mount_node}, ${update_anchor_node});
						}
					`;

			const start = this.block.has_update_method ? 0 : `#old_length`;

			let remove_old_blocks;

			if (this.block.has_outros) {
				const out = block.get_unique_name('out');

				block.chunks.init.push(b`
					const ${out} = i => @transition_out(${iterations}[i], 1, 1, () => {
						${iterations}[i] = null;
					});
				`);
				remove_old_blocks = b`
					@group_outros();
					for (#i = ${data_length}; #i < ${view_length}; #i += 1) {
						${out}(#i);
					}
					@check_outros();
				`;
			} else {
				remove_old_blocks = b`
					for (${this.block.has_update_method ? null : x`#i = ${data_length}`}; #i < ${this.block.has_update_method ? view_length : '#old_length'}; #i += 1) {
						${iterations}[#i].d(1);
					}
					${!fixed_length && b`${view_length} = ${data_length};`}
				`;
			}

			// We declare `i` as block scoped here, as the `remove_old_blocks` code
			// may rely on continuing where this iteration stopped.
			const update = b`
				${!this.block.has_update_method && b`const #old_length = ${this.vars.each_block_value}.length;`}
				${this.vars.each_block_value} = ${snippet};
				${this.renderer.options.dev && b`@validate_each_argument(${this.vars.each_block_value});`}

				let #i;
				for (#i = ${start}; #i < ${data_length}; #i += 1) {
					const child_ctx = ${this.vars.get_each_context}(#ctx, ${this.vars.each_block_value}, #i);

					${for_loop_body}
				}

				${remove_old_blocks}
			`;

			block.chunks.update.push(b`
				if (${block.renderer.dirty(Array.from(all_dependencies))}) {
					${update}
				}
			`);
		}

		if (this.block.has_outros) {
			block.chunks.outro.push(b`
				${iterations} = ${iterations}.filter(@_Boolean);
				for (let #i = 0; #i < ${view_length}; #i += 1) {
					@transition_out(${iterations}[#i]);
				}
			`);
		}

		block.chunks.destroy.push(b`@destroy_each(${iterations}, detaching);`);
	}
}
