import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import AwaitBlock from '../../nodes/AwaitBlock';
import createDebuggingComment from '../../../utils/createDebuggingComment';
import deindent from '../../../utils/deindent';
import FragmentWrapper from './Fragment';
import PendingBlock from '../../nodes/PendingBlock';
import ThenBlock from '../../nodes/ThenBlock';
import CatchBlock from '../../nodes/CatchBlock';

class AwaitBlockBranch extends Wrapper {
	node: PendingBlock | ThenBlock | CatchBlock;
	block: Block;
	fragment: FragmentWrapper;
	isDynamic: boolean;

	var = null;

	constructor(
		status: string,
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: AwaitBlock,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.block = block.child({
			comment: createDebuggingComment(node, this.renderer.component),
			name: this.renderer.component.getUniqueName(`create_${status}_block`)
		});

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			this.node.children,
			parent,
			stripWhitespace,
			nextSibling
		);

		this.isDynamic = this.block.dependencies.size > 0;
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
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannotUseInnerHTML();

		block.addDependencies(this.node.expression.dynamic_dependencies);

		let isDynamic = false;
		let hasIntros = false;
		let hasOutros = false;

		['pending', 'then', 'catch'].forEach(status => {
			const child = this.node[status];

			const branch = new AwaitBlockBranch(
				status,
				renderer,
				block,
				this,
				child,
				stripWhitespace,
				nextSibling
			);

			renderer.blocks.push(branch.block);

			if (branch.isDynamic) {
				isDynamic = true;
				// TODO should blocks update their own parents?
				block.addDependencies(branch.block.dependencies);
			}

			if (branch.block.hasIntros) hasIntros = true;
			if (branch.block.hasOutros) hasOutros = true;

			this[status] = branch;
		});

		this.pending.block.hasUpdateMethod = isDynamic;
		this.then.block.hasUpdateMethod = isDynamic;
		this.catch.block.hasUpdateMethod = isDynamic;

		this.pending.block.hasIntroMethod = hasIntros;
		this.then.block.hasIntroMethod = hasIntros;
		this.catch.block.hasIntroMethod = hasIntros;

		this.pending.block.hasOutroMethod = hasOutros;
		this.then.block.hasOutroMethod = hasOutros;
		this.catch.block.hasOutroMethod = hasOutros;

		if (hasOutros) {
			block.addOutro();
		}
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);
		const updateMountNode = this.getUpdateMountNode(anchor);

		const snippet = this.node.expression.render(block);

		const info = block.getUniqueName(`info`);
		const promise = block.getUniqueName(`promise`);

		block.addVariable(promise);

		block.maintainContext = true;

		const infoProps = [
			'ctx',
			'current: null',
			this.pending.block.name && `pending: ${this.pending.block.name}`,
			this.then.block.name && `then: ${this.then.block.name}`,
			this.catch.block.name && `catch: ${this.catch.block.name}`,
			this.then.block.name && `value: '${this.node.value}'`,
			this.catch.block.name && `error: '${this.node.error}'`,
			this.pending.block.hasOutroMethod && `blocks: Array(3)`
		].filter(Boolean);

		block.builders.init.addBlock(deindent`
			let ${info} = {
				${infoProps.join(',\n')}
			};
		`);

		block.builders.init.addBlock(deindent`
			@handlePromise(${promise} = ${snippet}, ${info});
		`);

		block.builders.create.addBlock(deindent`
			${info}.block.c();
		`);

		if (parentNodes && this.renderer.options.hydratable) {
			block.builders.claim.addBlock(deindent`
				${info}.block.l(${parentNodes});
			`);
		}

		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		const hasTransitions = this.pending.block.hasIntroMethod || this.pending.block.hasOutroMethod;

		block.builders.mount.addBlock(deindent`
			${info}.block.m(${initialMountNode}, ${info}.anchor = ${anchorNode});
			${info}.mount = () => ${updateMountNode};
			${info}.anchor = ${anchor};
		`);

		if (hasTransitions) {
			block.builders.intro.addLine(`${info}.block.i();`);
		}

		const conditions = [];
		if (this.node.expression.dependencies.size > 0) {
			conditions.push(
				`(${[...this.node.expression.dependencies].map(dep => `'${dep}' in changed`).join(' || ')})`
			);
		}

		conditions.push(
			`${promise} !== (${promise} = ${snippet})`,
			`@handlePromise(${promise}, ${info})`
		);

		block.builders.update.addLine(
			`${info}.ctx = ctx;`
		);

		if (this.pending.block.hasUpdateMethod) {
			block.builders.update.addBlock(deindent`
				if (${conditions.join(' && ')}) {
					// nothing
				} else {
					${info}.block.p(changed, @assign(@assign({}, ctx), ${info}.resolved));
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				${conditions.join(' && ')}
			`);
		}

		if (this.pending.block.hasOutroMethod) {
			block.builders.outro.addBlock(deindent`
				for (let #i = 0; #i < 3; #i += 1) {
					const block = ${info}.blocks[#i];
					if (block) block.o();
				}
			`);
		}

		block.builders.destroy.addBlock(deindent`
			${info}.block.d(${parentNode ? '' : 'detach'});
			${info} = null;
		`);

		[this.pending, this.then, this.catch].forEach(branch => {
			branch.fragment.render(branch.block, null, 'nodes');
		});
	}
}