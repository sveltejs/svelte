import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import AwaitBlock from '../../nodes/AwaitBlock';
import create_debugging_comment from './shared/create_debugging_comment';
import deindent from '../../utils/deindent';
import FragmentWrapper from './Fragment';
import PendingBlock from '../../nodes/PendingBlock';
import ThenBlock from '../../nodes/ThenBlock';
import CatchBlock from '../../nodes/CatchBlock';

class AwaitBlockBranch extends Wrapper {
	node: PendingBlock | ThenBlock | CatchBlock;
	block: Block;
	fragment: FragmentWrapper;
	is_dynamic: boolean;

	var = null;

	constructor(
		status: string,
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: AwaitBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.block = block.child({
			comment: create_debugging_comment(node, this.renderer.component),
			name: this.renderer.component.get_unique_name(`create_${status}_block`)
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

export default class AwaitBlockWrapper extends Wrapper {
	node: AwaitBlock;

	pending: AwaitBlockBranch;
	then: AwaitBlockBranch;
	catch: AwaitBlockBranch;

	var = 'await_block';

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

		block.add_dependencies(this.node.expression.dependencies);

		let is_dynamic = false;
		let has_intros = false;
		let has_outros = false;

		['pending', 'then', 'catch'].forEach(status => {
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

		this.pending.block.has_update_method = is_dynamic;
		this.then.block.has_update_method = is_dynamic;
		this.catch.block.has_update_method = is_dynamic;

		this.pending.block.has_intro_method = has_intros;
		this.then.block.has_intro_method = has_intros;
		this.catch.block.has_intro_method = has_intros;

		this.pending.block.has_outro_method = has_outros;
		this.then.block.has_outro_method = has_outros;
		this.catch.block.has_outro_method = has_outros;

		if (has_outros) {
			block.add_outro();
		}
	}

	render(
		block: Block,
		parent_node: string,
		parent_nodes: string
	) {
		const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
		const update_mount_node = this.get_update_mount_node(anchor);

		const snippet = this.node.expression.render(block);

		const info = block.get_unique_name(`info`);
		const promise = block.get_unique_name(`promise`);

		block.add_variable(promise);

		block.maintain_context = true;

		const info_props = [
			'ctx',
			'current: null',
			'token: null',
			this.pending.block.name && `pending: ${this.pending.block.name}`,
			this.then.block.name && `then: ${this.then.block.name}`,
			this.catch.block.name && `catch: ${this.catch.block.name}`,
			this.then.block.name && `value: '${this.node.value}'`,
			this.catch.block.name && `error: '${this.node.error}'`,
			this.pending.block.has_outro_method && `blocks: [,,,]`
		].filter(Boolean);

		block.builders.init.add_block(deindent`
			let ${info} = {
				${info_props.join(',\n')}
			};
		`);

		block.builders.init.add_block(deindent`
			@handle_promise(${promise} = ${snippet}, ${info});
		`);

		block.builders.create.add_block(deindent`
			${info}.block.c();
		`);

		if (parent_nodes && this.renderer.options.hydratable) {
			block.builders.claim.add_block(deindent`
				${info}.block.l(${parent_nodes});
			`);
		}

		const initial_mount_node = parent_node || '#target';
		const anchor_node = parent_node ? 'null' : 'anchor';

		const has_transitions = this.pending.block.has_intro_method || this.pending.block.has_outro_method;

		block.builders.mount.add_block(deindent`
			${info}.block.m(${initial_mount_node}, ${info}.anchor = ${anchor_node});
			${info}.mount = () => ${update_mount_node};
			${info}.anchor = ${anchor};
		`);

		if (has_transitions) {
			block.builders.intro.add_line(`@transition_in(${info}.block);`);
		}

		const conditions = [];
		const dependencies = this.node.expression.dynamic_dependencies();

		if (dependencies.length > 0) {
			conditions.push(
				`(${dependencies.map(dep => `'${dep}' in changed`).join(' || ')})`
			);

			conditions.push(
				`${promise} !== (${promise} = ${snippet})`,
				`@handle_promise(${promise}, ${info})`
			);

			block.builders.update.add_line(
				`${info}.ctx = ctx;`
			);

			if (this.pending.block.has_update_method) {
				block.builders.update.add_block(deindent`
					if (${conditions.join(' && ')}) {
						// nothing
					} else {
						${info}.block.p(changed, @assign(@assign({}, ctx), ${info}.resolved));
					}
				`);
			} else {
				block.builders.update.add_block(deindent`
					${conditions.join(' && ')}
				`);
			}
		} else {
			if (this.pending.block.has_update_method) {
				block.builders.update.add_block(deindent`
					${info}.block.p(changed, @assign(@assign({}, ctx), ${info}.resolved));
				`);
			}
		}

		if (this.pending.block.has_outro_method) {
			block.builders.outro.add_block(deindent`
				for (let #i = 0; #i < 3; #i += 1) {
					const block = ${info}.blocks[#i];
					@transition_out(block);
				}
			`);
		}

		block.builders.destroy.add_block(deindent`
			${info}.block.d(${parent_node ? '' : 'detaching'});
			${info}.token = null;
			${info} = null;
		`);

		[this.pending, this.then, this.catch].forEach(branch => {
			branch.fragment.render(branch.block, null, 'nodes');
		});
	}
}
