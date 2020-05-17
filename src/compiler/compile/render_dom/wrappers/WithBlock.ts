import Renderer from '../Renderer';
import Block from '../Block';
import Wrapper from './shared/Wrapper';
import create_debugging_comment from './shared/create_debugging_comment';
import FragmentWrapper from './Fragment';
import { b, x } from 'code-red';
import WithBlock from '../../nodes/WithBlock';
import { Node, Identifier } from 'estree';

export default class WithBlockWrapper extends Wrapper {
	block: Block;
	node: WithBlock;
	fragment: FragmentWrapper;
	vars: {
		create_with_block: Identifier;
		with_block_value: Identifier;
		with_block: Identifier;
		get_with_context: Identifier;
	}

	dependencies: Set<string>;

	var: Identifier = { type: 'Identifier', name: 'with' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: WithBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();
		this.not_static_content();

		block.add_dependencies(node.expression.dependencies);

		this.node.contexts.forEach(context => {
			renderer.add_to_context(context.key.name, true);
		});

		this.block = block.child({
			comment: create_debugging_comment(this.node, this.renderer.component),
			name: renderer.component.get_unique_name('create_with_block'),
			type: 'with',
			// @ts-ignore todo: probably error
			key: node.key as string,

			bindings: new Map(block.bindings)
		});

		const with_block_value = renderer.component.get_unique_name(`${this.var.name}_value`);
		renderer.add_to_context(with_block_value.name, true);

		this.vars = {
			create_with_block: this.block.name,
			with_block_value,
			with_block: block.get_unique_name(`${this.var.name}_block`),
			get_with_context: renderer.component.get_unique_name(`get_${this.var.name}_context`),
		};

		const store =
			node.expression.node.type === 'Identifier' &&
			node.expression.node.name[0] === '$'
				? node.expression.node.name.slice(1)
				: null;

		node.contexts.forEach(prop => {
			this.block.bindings.set(prop.key.name, {
				object: with_block_value,
				modifier: prop.modifier,
				snippet: prop.modifier(x`${with_block_value}` as Node),
				store
			});
		});

		renderer.blocks.push(this.block);

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, this, strip_whitespace, next_sibling);

		block.add_dependencies(this.block.dependencies);
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		if (this.fragment.nodes.length === 0) return;

		const { renderer } = this;
		const {
			create_with_block,
			with_block,
			with_block_value,
			get_with_context
		} = this.vars;

		const needs_anchor = this.next
			? !this.next.is_dom_node() :
			!parent_node || !this.parent.is_dom_node();

		const context_props = this.node.contexts.map(prop => b`child_ctx[${renderer.context_lookup.get(prop.key.name).index}] = ${prop.modifier(x`value`)};`);
		if (this.node.has_binding) context_props.push(b`child_ctx[${renderer.context_lookup.get(with_block_value.name).index}] = value;`);

		const snippet = this.node.expression.manipulate(block);
		block.chunks.init.push(b`let ${with_block_value} = ${snippet};`);

		renderer.blocks.push(b`
			function ${get_with_context}(#ctx, value) {
				const child_ctx = #ctx.slice();
				${context_props}
				return child_ctx;
			}
		`);

		const initial_anchor_node: Identifier = { type: 'Identifier', name: parent_node ? 'null' : '#anchor' };
		const initial_mount_node: Identifier = parent_node || { type: 'Identifier', name: '#target' };
		const update_anchor_node = needs_anchor
			? block.get_unique_name(`${this.var.name}_anchor`)
			: (this.next && this.next.var) || { type: 'Identifier', name: 'null' };
		const update_mount_node: Identifier = this.get_update_mount_node((update_anchor_node as Identifier));

		const all_dependencies = new Set(this.block.dependencies); // TODO should be dynamic deps only
		this.node.expression.dynamic_dependencies().forEach((dependency: string) => {
			all_dependencies.add(dependency);
		});
		this.dependencies = all_dependencies;

		block.chunks.init.push(b`
			let ${with_block} = ${create_with_block}(${get_with_context}(#ctx, ${with_block_value}));
		`);

		block.chunks.create.push(b`
			${with_block}.c();
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.chunks.claim.push(b`
				${with_block}.l(${parent_nodes});
			`);
		}

		block.chunks.mount.push(b`
			${with_block}.m(${initial_mount_node}, ${initial_anchor_node});
		`);

		if (this.dependencies.size) {
			const update = this.block.has_update_method
				? b`
					if (${with_block}) {
						${with_block}.p(child_ctx, #dirty);
					} else {
						${with_block} = ${create_with_block}(child_ctx);
						${with_block}.c();
						${with_block}.m(${update_mount_node}, ${update_anchor_node});
					}`
				: b`
					if (!${with_block}) {
						${with_block} = ${create_with_block}(child_ctx);
						${with_block}.c();
						${with_block}.m(${update_mount_node}, ${update_anchor_node});
					}`;
			block.chunks.update.push(b`
				if (${block.renderer.dirty(Array.from(all_dependencies))}) {
					${with_block_value} = ${snippet};
					const child_ctx = ${get_with_context}(#ctx, ${with_block_value});
					${update}
				}
			`);
		}

		block.chunks.destroy.push(b`${with_block}.d(detaching);`);

		if (needs_anchor) {
			block.add_element(
				update_anchor_node as Identifier,
				x`@empty()`,
				parent_nodes && x`@empty()`,
				parent_node
			);
		}

		this.fragment.render(this.block, null, x`#nodes` as Identifier);
	}
}
