import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import AwaitBlock from '../../nodes/AwaitBlock';
import create_debugging_comment from './shared/create_debugging_comment';
import { b, x } from 'code-red';
import FragmentWrapper from './Fragment';
import PendingBlock from '../../nodes/PendingBlock';
import ThenBlock from '../../nodes/ThenBlock';
import CatchBlock from '../../nodes/CatchBlock';
import { Context } from '../../nodes/shared/Context';
import { Identifier, Literal, Node } from 'estree';

type Status = 'pending' | 'then' | 'catch';

class AwaitBlockBranch extends Wrapper {
	parent: AwaitBlockWrapper;
	node: PendingBlock | ThenBlock | CatchBlock;
	block: Block;
	fragment: FragmentWrapper;
	is_dynamic: boolean;

	var = null;
	status: Status;

	value: string;
	value_index: Literal;
	value_contexts: Context[];
	is_destructured: boolean;

	constructor(
		status: Status,
		renderer: Renderer,
		block: Block,
		parent: AwaitBlockWrapper,
		node: PendingBlock | ThenBlock | CatchBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.status = status;

		this.block = block.child({
			comment: create_debugging_comment(node, this.renderer.component),
			name: this.renderer.component.get_unique_name(`create_${status}_block`),
			type: status
		});

		this.add_context(parent.node[status + '_node'], parent.node[status + '_contexts']);

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

	add_context(node: Node | null, contexts: Context[]) {
		if (!node) return;

		if (node.type === 'Identifier') {
			this.value = node.name;
			this.renderer.add_to_context(this.value, true);
		} else {
			contexts.forEach(context => {
				this.renderer.add_to_context(context.key.name, true);
			});
			this.value = this.block.parent.get_unique_name('value').name;
			this.value_contexts = contexts;
			this.renderer.add_to_context(this.value, true);
			this.is_destructured = true;
		}
		this.value_index = this.renderer.context_lookup.get(this.value).index;
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		this.fragment.render(block, parent_node, parent_nodes);

		if (this.is_destructured) {
			this.render_destructure();
		}
	}

	render_destructure() {
		const props = this.value_contexts.map(prop => b`#ctx[${this.block.renderer.context_lookup.get(prop.key.name).index}] = ${prop.modifier(x`#ctx[${this.value_index}]`)};`);
		const get_context = this.block.renderer.component.get_unique_name(`get_${this.status}_context`);
		this.block.renderer.blocks.push(b`
			function ${get_context}(#ctx) {
				${props}
			}
		`);
		this.block.chunks.declarations.push(b`${get_context}(#ctx)`);
		if (this.block.has_update_method) {
			this.block.chunks.update.push(b`${get_context}(#ctx)`);
		}
	}
}

export default class AwaitBlockWrapper extends Wrapper {
	node: AwaitBlock;

	pending: AwaitBlockBranch;
	then: AwaitBlockBranch;
	catch: AwaitBlockBranch;

	var: Identifier = { type: 'Identifier', name: 'await_block' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: AwaitBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannot_use_innerhtml();
		this.not_static_content();

		block.add_dependencies(this.node.expression.dependencies);

		let is_dynamic = false;
		let has_intros = false;
		let has_outros = false;

		['pending', 'then', 'catch'].forEach((status: Status) => {
			const child = this.node[status];

			const branch = new AwaitBlockBranch(
				status,
				renderer,
				block,
				this,
				child,
				strip_whitespace,
				next_sibling
			);

			renderer.blocks.push(branch.block);

			if (branch.is_dynamic) {
				is_dynamic = true;
				// TODO should blocks update their own parents?
				block.add_dependencies(branch.block.dependencies);
			}

			if (branch.block.has_intros) has_intros = true;
			if (branch.block.has_outros) has_outros = true;

			this[status] = branch;
		});

		['pending', 'then', 'catch'].forEach(status => {
			this[status].block.has_update_method = is_dynamic;
			this[status].block.has_intro_method = has_intros;
			this[status].block.has_outro_method = has_outros;
		});

		if (has_outros) {
			block.add_outro();
		}
	}

	render(
		block: Block,
		parent_node: Identifier,
		parent_nodes: Identifier
	) {
		const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
		const update_mount_node = this.get_update_mount_node(anchor);

		const snippet = this.node.expression.manipulate(block);

		const info = block.get_unique_name(`info`);
		const promise = block.get_unique_name(`promise`);

		block.add_variable(promise);

		block.maintain_context = true;

		const info_props: any = x`{
			ctx: #ctx,
			current: null,
			token: null,
			pending: ${this.pending.block.name},
			then: ${this.then.block.name},
			catch: ${this.catch.block.name},
			value: ${this.then.value_index},
			error: ${this.catch.value_index},
			blocks: ${this.pending.block.has_outro_method && x`[,,,]`}
		}`;

		block.chunks.init.push(b`
			let ${info} = ${info_props};
		`);

		block.chunks.init.push(b`
			@handle_promise(${promise} = ${snippet}, ${info});
		`);

		block.chunks.create.push(b`
			${info}.block.c();
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.chunks.claim.push(b`
				${info}.block.l(${parent_nodes});
			`);
		}

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : '#anchor';

		const has_transitions = this.pending.block.has_intro_method || this.pending.block.has_outro_method;

		block.chunks.mount.push(b`
			${info}.block.m(${initial_mount_node}, ${info}.anchor = ${anchor_node});
			${info}.mount = () => ${update_mount_node};
			${info}.anchor = ${anchor};
		`);

		if (has_transitions) {
			block.chunks.intro.push(b`@transition_in(${info}.block);`);
		}

		const dependencies = this.node.expression.dynamic_dependencies();

		let update_child_context;
		if (this.then.value && this.catch.value) {
			update_child_context = b`#child_ctx[${this.then.value_index}] = #child_ctx[${this.catch.value_index}] = ${info}.resolved;`;
		} else if (this.then.value) {
			update_child_context = b`#child_ctx[${this.then.value_index}] = ${info}.resolved;`;
		} else if (this.catch.value) {
			update_child_context = b`#child_ctx[${this.catch.value_index}] = ${info}.resolved;`;
		}

		if (dependencies.length > 0) {
			const condition = x`
				${block.renderer.dirty(dependencies)} &&
				${promise} !== (${promise} = ${snippet}) &&
				@handle_promise(${promise}, ${info})`;

			block.chunks.update.push(
				b`${info}.ctx = #ctx;`
			);

			if (this.pending.block.has_update_method) {
				block.chunks.update.push(b`
					if (${condition}) {

					} else {
						const #child_ctx = #ctx.slice();
						${update_child_context}
						${info}.block.p(#child_ctx, #dirty);
					}
				`);
			} else {
				block.chunks.update.push(b`
					${condition}
				`);
			}
		} else {
			if (this.pending.block.has_update_method) {
				block.chunks.update.push(b`
					{
						const #child_ctx = #ctx.slice();
						${update_child_context}
						${info}.block.p(#child_ctx, #dirty);
					}
				`);
			}
		}

		if (this.pending.block.has_outro_method) {
			block.chunks.outro.push(b`
				for (let #i = 0; #i < 3; #i += 1) {
					const block = ${info}.blocks[#i];
					@transition_out(block);
				}
			`);
		}

		block.chunks.destroy.push(b`
			${info}.block.d(${parent_node ? null : 'detaching'});
			${info}.token = null;
			${info} = null;
		`);

		[this.pending, this.then, this.catch].forEach(branch => {
			branch.render(branch.block, null, x`#nodes` as Identifier);
		});
	}
}
