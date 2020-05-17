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
			type: 'else',
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
	};

	context_props: Array<Node | Node[]>;
	index_name: Identifier;
	updates: Array<Node | Node[]> = [];
	dependencies: Set<string>;

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

		this.node.contexts.forEach((context) => {
			renderer.add_to_context(context.key.name, true);
		});

		this.block = block.child({
			comment: create_debugging_comment(this.node, this.renderer.component),
			name: renderer.component.get_unique_name('create_each_block'),
			type: 'each',
			// @ts-ignore todo: probably error
			key: node.key as string,
			bindings: new Map(block.bindings),
		});

		// TODO this seems messy
		this.block.has_animation = this.node.has_animation;

		this.index_name = this.node.index
			? { type: 'Identifier', name: this.node.index }
			: renderer.component.get_unique_name(`${this.node.context}_index`);

		this.vars = {
			create_each_block: this.block.name,
			each_block_value: renderer.component.get_unique_name(`${this.var.name}_value`),
			get_each_context: renderer.component.get_unique_name(`get_${this.var.name}_context`),
			iterations: block.get_unique_name(`${this.var.name}_blocks`),
		};

		renderer.add_to_context(this.vars.each_block_value.name, true);
		renderer.add_to_context(this.index_name.name, true);

		const store =
			node.expression.node.type === 'Identifier' && node.expression.node.name[0] === '$'
				? node.expression.node.name.slice(1)
				: null;

		node.contexts.forEach((prop) => {
			this.block.bindings.set(prop.key.name, {
				object: this.vars.each_block_value,
				property: this.index_name,
				modifier: prop.modifier,
				snippet: prop.modifier(x`${this.vars.each_block_value}[${this.index_name}]` as Node),
				store,
				tail: prop.modifier(x`[${this.index_name}]` as Node),
			});
		});

		if (this.node.index) {
			this.block.get_unique_name(this.node.index); // this prevents name collisions (#1254)
		}

		renderer.blocks.push(this.block);

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, this, strip_whitespace, next_sibling);

		if (this.node.else) {
			this.else = new ElseBlockWrapper(renderer, block, this, this.node.else, strip_whitespace, next_sibling);

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
		const __DEV__ = this.renderer.options.dev;
		const { each_block_value, iterations: each_block } = this.vars;
		const { renderer } = this;
		const { component } = renderer;

		const needs_anchor = this.next ? !this.next.is_dom_node() : !parent_node || !this.parent.is_dom_node();

		this.context_props = this.node.contexts.map(
			(prop) => b`child_ctx[${renderer.context_lookup.get(prop.key.name).index}] = ${prop.modifier(x`list[i]`)};`
		);

		if (this.node.has_binding)
			this.context_props.push(b`child_ctx[${renderer.context_lookup.get(each_block_value.name).index}] = list;`);
		if (this.node.has_binding || this.node.index)
			this.context_props.push(b`child_ctx[${renderer.context_lookup.get(this.index_name.name).index}] = i;`);

		const snippet = this.node.expression.manipulate(block);

		block.chunks.init.push(b`let ${each_block_value} = ${snippet};`);
		if (__DEV__) {
			block.chunks.init.push(b`@is_array_like_dev(${each_block_value});`);
		}

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
		const update_mount_node: Identifier = this.get_update_mount_node(update_anchor_node as Identifier);

		const args = {
			block,
			parent_node,
			parent_nodes,
			snippet,
			initial_anchor_node,
			initial_mount_node,
			update_anchor_node,
			update_mount_node,
		};

		const all_dependencies = new Set(this.block.dependencies); // TODO should be dynamic deps only
		this.node.expression.dynamic_dependencies().forEach((dependency: string) => {
			all_dependencies.add(dependency);
		});
		this.dependencies = all_dependencies;

		if (this.node.key) {
			this.render_keyed(args);
		} else {
			this.render_unkeyed(args);
		}

		if (this.block.has_intro_method || this.block.has_outro_method) {
			block.chunks.intro.push(for_loop(each_block, (item) => b`@transition_in(${item});`));
		}

		if (needs_anchor) {
			block.add_element(update_anchor_node as Identifier, x`@empty()`, parent_nodes && x`@empty()`, parent_node);
		}

		if (this.else) {
			const each_block_else = component.get_unique_name(`${this.var.name}_else`);

			// TODO neaten this up... will end up with an empty line in the block
			block.chunks.init.push(
				b`let ${each_block_else} = null;`,
				b`if (!${each_block_value}.length) {
					  ${each_block_else} = ${this.else.block.name}(#ctx);
				  }`
			);

			block.chunks.create.push(b`
				if (${each_block_else}) {
					${each_block_else}.c();
				}`);

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
			const no_each_else = x`!${each_block_value}.length`;
			const update_else = b`${each_block_else}.p(#ctx, #dirty);`;
			const destroy_else = b`${each_block_else}.d(1);${each_block_else} = null;`;
			const create_else = b`
								${each_block_else} = ${this.else.block.name}(#ctx);
								${each_block_else}.c();
								${each_block_else}.m(${update_mount_node}, ${update_anchor_node});`;

			this.updates.push(
				$if({
					if: each_block_else,
					true: $if({
						if: this.else.is_dynamic && no_each_else,
						true: update_else,
						false: destroy_else,
					}),
					false: $if({
						if: no_each_else,
						true: create_else,
					}),
				})
			);

			block.chunks.destroy.push(b`
				if (${each_block_else}){ 
					${each_block_else}.d(${parent_node ? '' : 'detaching'});
				}
			`);
		}

		this.updates = this.updates.filter(Boolean);
		if (this.updates.length) {
			block.chunks.update.push(b`
				if (${block.renderer.dirty(Array.from(all_dependencies))}) {
					${this.updates}
				}
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
		update_mount_node,
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
		this.block.maintain_context = true;

		const __DEV__ = this.renderer.options.dev;
		const {
			create_each_block,
			iterations: each_block,
			each_block_value,
			get_each_context: each_context_getter,
		} = this.vars;

		const for_each_block = (fn) => for_loop(each_block, fn);

		const key_getter = block.get_unique_name('get_key');
		const lookup = block.get_unique_name(`${this.var.name}_lookup`);

		block.add_variable(each_block, x`[]`);
		block.add_variable(lookup, x`new @_Map()`);

		if (this.fragment.nodes[0].is_dom_node()) this.block.first = this.fragment.nodes[0].var;
		else
			this.block.add_element(
				(this.block.first = this.block.get_unique_name('first')),
				x`@empty()`,
				parent_nodes && x`@empty()`,
				null
			);

		const validate_each_keys =
			__DEV__ && b`@check_duplicate_keys_dev(#ctx, ${each_block_value}, ${each_context_getter}, ${key_getter});`;

		const validate_each_argument = __DEV__ && b`@is_array_like_dev(${each_block_value});`;

		block.chunks.init.push(
			b`const ${key_getter} = (#ctx) => ${this.node.key.manipulate(block)};`,
			validate_each_keys,
			for_loop(
				each_block_value,
				(_, index) => b`
						const #child_ctx = ${each_context_getter}(#ctx, ${each_block_value}, ${index});
						const #key = ${key_getter}(#child_ctx);	
						${lookup}.set(#key, (${each_block}[${index}] = ${create_each_block}(#key, #child_ctx)));`
			)
		);

		block.chunks.create.push(for_each_block((block) => b`${block}.c();`));
		if (parent_nodes && this.renderer.options.hydratable)
			block.chunks.claim.push(for_each_block((block) => b`${block}.l(${parent_nodes});`));
		block.chunks.mount.push(for_each_block((block) => b`${block}.m(${initial_mount_node}, ${initial_anchor_node});`));

		const dynamic = this.block.has_update_method;
		const has_animation = this.node.has_animation || null;
		const { has_outros } = this.block;

		if (this.dependencies.size) {
			const transition_state = bit_state([dynamic, has_animation, has_outros]);
			const update_keyed_each = (transition_out) =>
				b`${each_block} = @update_keyed_each(${each_block}, #dirty, #ctx, ${transition_state}, ${key_getter}, ${each_block_value}, ${lookup}, ${update_mount_node}, ${create_each_block}, ${update_anchor_node}, ${each_context_getter}, ${transition_out});`;
			const measure_animations = has_animation && b`${for_each_block((block) => b`${block}.r();`)}`;

			this.updates.push(
				b`const ${each_block_value} = ${snippet};`,
				validate_each_keys,
				validate_each_argument,
				measure_animations,
				this.block.group_transition_out((transition_out) => update_keyed_each(transition_out)),
				has_animation && for_each_block((block) => b`${block}.a();`)
			);
		}

		if (has_outros) block.chunks.outro.push(for_each_block((block) => b`@transition_out(${block});`));

		block.chunks.destroy.push(for_each_block((block) => b`${block}.d(${parent_node ? null : 'detaching'});`));
	}

	render_unkeyed({
		block,
		parent_nodes,
		snippet,
		initial_anchor_node,
		initial_mount_node,
		update_anchor_node,
		update_mount_node,
	}: {
		block: Block;
		parent_nodes: Identifier;
		snippet: Node;
		initial_anchor_node: Identifier;
		initial_mount_node: Identifier;
		update_anchor_node: Identifier;
		update_mount_node: Identifier;
	}) {
		const __DEV__ = this.renderer.options.dev;
		const {
			create_each_block,
			iterations: each_block,
			each_block_value,
			get_each_context: each_context_getter,
		} = this.vars;
		const for_each_block = (fn, opts?) => for_loop(each_block, fn, opts);

		block.chunks.init.push(
			b`let ${each_block} = [];`,
			for_loop(
				each_block_value,
				(_, index) =>
					b`${each_block}[${index}] = ${create_each_block}(${each_context_getter}(#ctx, ${each_block_value}, ${index}));`
			)
		);

		block.chunks.create.push(for_each_block((block) => b`${block}.c();`));
		if (parent_nodes && this.renderer.options.hydratable)
			block.chunks.claim.push(for_each_block((block) => b`${block}.l(${parent_nodes});`));
		block.chunks.mount.push(for_each_block((block) => b`${block}.m(${initial_mount_node}, ${initial_anchor_node});`));

		if (this.dependencies.size) {
			const has_transitions = !!(this.block.has_intro_method || this.block.has_outro_method);
			const { has_update_method } = this.block;

			const start = has_update_method ? 0 : x`old_length`;

			// We declare `i` as block scoped here, as the `remove_old_blocks` code
			// may rely on continuing where this iteration stopped.
			this.updates.push(b`
				${!has_update_method && b`const old_length = ${each_block}.length;`}
				${each_block_value} = ${snippet};
				${__DEV__ && b`@is_array_like_dev(${each_block_value});`}
				let i = ${start};
				let #block;
				${for_loop(
					each_block_value,
					(_) => b`
					#block = ${each_block}[i]
					const #child_ctx = ${each_context_getter}(#ctx, ${each_block_value}, i);
					${$if({
						if: (has_update_method || has_transitions) && x`#block`,
						true: b`
							${has_update_method && b`#block.p(#child_ctx, #dirty);`}
							${has_transitions && b`@transition_in(#block, 1);`}
						`,
						false: b`
							#block = ${each_block}[i] = ${create_each_block}(#child_ctx);
							#block.c();
							${has_transitions && b`@transition_in(#block, 1);`}
							#block.m(${update_mount_node}, ${update_anchor_node});
						`,
					})}`,
					{ i: null }
				)}
				${this.block.group_transition_out((transition_out) =>
					for_each_block(
						(block) =>
							transition_out ? b`${transition_out}(${block}, () => { ${block} = null; });` : b`${block}.d(1);`,
						{
							i: has_update_method && !transition_out ? null : x`i = ${each_block_value}.length`,
							length: has_update_method || transition_out ? x`${each_block}.length` : x`old_length`,
						}
					)
				)}
				${each_block}.length = ${each_block_value}.length;
			`);
		}

		if (this.block.has_outros) {
			block.chunks.outro.push(b`
				${each_block} = ${each_block}.filter(@_Boolean);
				${for_each_block((block) => b`@transition_out(${block})`)}`);
		}

		block.chunks.destroy.push(b`@destroy_each(${each_block}, detaching);`);
	}
}
const bit_state = (arr) => arr.reduce((state, bool, index) => (bool ? (state |= 1 << index) : state), 0);

const for_loop = <T>(
	arr: T,
	callback: (item: Node, index: string, array: T) => Node[],
	{ length = x`${arr}.length`, i = undefined } = {}
) =>
	i !== undefined
		? b`for (${i}; i < ${length}; i++) { ${callback(x`${arr}[i]`, `i`, arr)} }`
		: b`for (let i = 0; i < ${length}; i++) { ${callback(x`${arr}[i]`, `i`, arr)} }`;

const $if = ({ if: condition, true: success, false: failure = null }) => {
	if (condition) {
		if (success) {
			if (failure) {
				return b`if(${condition}){ ${success} } else { ${failure} }`;
			} else {
				return b`if(${condition}){ ${success} }`;
			}
		} else if (failure) {
			return b`if(!${condition}){ ${success} }`;
		}
	} else {
		if (failure) {
			return failure;
		}
	}
	throw new Error('Error in if_else');
};
