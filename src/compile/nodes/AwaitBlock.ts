import deindent from '../../utils/deindent';
import Node from './shared/Node';
import Block from '../dom/Block';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import createDebuggingComment from '../../utils/createDebuggingComment';
import Expression from './shared/Expression';
import { SsrTarget } from '../ssr';

export default class AwaitBlock extends Node {
	expression: Expression;
	value: string;
	error: string;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.expression = new Expression(compiler, this, scope, info.expression);
		const deps = this.expression.dependencies;

		this.value = info.value;
		this.error = info.error;

		this.pending = new PendingBlock(compiler, this, scope, info.pending);
		this.then = new ThenBlock(compiler, this, scope.add(this.value, deps), info.then);
		this.catch = new CatchBlock(compiler, this, scope.add(this.error, deps), info.catch);
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName('await_block');
		block.addDependencies(this.expression.dependencies);

		let isDynamic = false;

		['pending', 'then', 'catch'].forEach(status => {
			const child = this[status];

			child.block = block.child({
				comment: createDebuggingComment(child, this.compiler),
				name: this.compiler.getUniqueName(`create_${status}_block`)
			});

			child.initChildren(child.block, stripWhitespace, nextSibling);
			this.compiler.target.blocks.push(child.block);

			if (child.block.dependencies.size > 0) {
				isDynamic = true;
				block.addDependencies(child.block.dependencies);
			}
		});

		this.pending.block.hasUpdateMethod = isDynamic;
		this.then.block.hasUpdateMethod = isDynamic;
		this.catch.block.hasUpdateMethod = isDynamic;
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const name = this.var;

		const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);
		const updateMountNode = this.getUpdateMountNode(anchor);

		const { snippet } = this.expression;

		const promise = block.getUniqueName(`promise`);
		const resolved = block.getUniqueName(`resolved`);
		const await_block = block.getUniqueName(`await_block`);
		const await_block_type = block.getUniqueName(`await_block_type`);
		const token = block.getUniqueName(`token`);
		const await_token = block.getUniqueName(`await_token`);
		const handle_promise = block.getUniqueName(`handle_promise`);
		const replace_await_block = block.getUniqueName(`replace_await_block`);
		const old_block = block.getUniqueName(`old_block`);
		const value = block.getUniqueName(`value`);
		const error = block.getUniqueName(`error`);
		const create_pending_block = this.pending.block.name;
		const create_then_block = this.then.block.name;
		const create_catch_block = this.catch.block.name;

		block.addVariable(await_block);
		block.addVariable(await_block_type);
		block.addVariable(await_token);
		block.addVariable(promise);
		block.addVariable(resolved);

		block.maintainContext = true;

		// the `#component.root.set({})` below is just a cheap way to flush
		// any oncreate handlers. We could have a dedicated `flush()` method
		// but it's probably not worth it

		block.builders.init.addBlock(deindent`
			function ${replace_await_block}(${token}, type, ctx) {
				if (${token} !== ${await_token}) return;

				var ${old_block} = ${await_block};
				${await_block} = type && (${await_block_type} = type)(#component, ctx);

				if (${old_block}) {
					${old_block}.u();
					${old_block}.d();
					${await_block}.c();
					${await_block}.m(${updateMountNode}, ${anchor});

					#component.root.set({});
				}
			}

			function ${handle_promise}(${promise}) {
				var ${token} = ${await_token} = {};

				if (@isPromise(${promise})) {
					${promise}.then(function(${value}) {
						${this.value ? deindent`
							${resolved} = { ${this.value}: ${value} };
							${replace_await_block}(${token}, ${create_then_block}, @assign(@assign({}, ctx), ${resolved}));
						` : deindent`
							${replace_await_block}(${token}, null, null);
						`}
					}, function (${error}) {
						${this.error ? deindent`
							${resolved} = { ${this.error}: ${error} };
							${replace_await_block}(${token}, ${create_catch_block}, @assign(@assign({}, ctx), ${resolved}));
						` : deindent`
							${replace_await_block}(${token}, null, null);
						`}
					});

					// if we previously had a then/catch block, destroy it
					if (${await_block_type} !== ${create_pending_block}) {
						${replace_await_block}(${token}, ${create_pending_block}, ctx);
						return true;
					}
				} else {
					${resolved} = { ${this.value}: ${promise} };
					if (${await_block_type} !== ${create_then_block}) {
						${replace_await_block}(${token}, ${create_then_block}, @assign(@assign({}, ctx), ${resolved}));
						return true;
					}
				}
			}

			${handle_promise}(${promise} = ${snippet});
		`);

		block.builders.create.addBlock(deindent`
			${await_block}.c();
		`);

		if (parentNodes) {
			block.builders.claim.addBlock(deindent`
				${await_block}.l(${parentNodes});
			`);
		}

		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.mount.addBlock(deindent`
			${await_block}.m(${initialMountNode}, ${anchorNode});
		`);

		const conditions = [];
		if (this.expression.dependencies.size > 0) {
			conditions.push(
				`(${[...this.expression.dependencies].map(dep => `'${dep}' in changed`).join(' || ')})`
			);
		}

		conditions.push(
			`${promise} !== (${promise} = ${snippet})`,
			`${handle_promise}(${promise}, ctx)`
		);

		if (this.pending.block.hasUpdateMethod) {
			block.builders.update.addBlock(deindent`
				if (${conditions.join(' && ')}) {
					// nothing
				} else {
					${await_block}.p(changed, @assign(@assign({}, ctx), ${resolved}));
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				if (${conditions.join(' && ')}) {
					${await_block}.c();
					${await_block}.m(${anchor}.parentNode, ${anchor});
				}
			`);
		}

		block.builders.unmount.addBlock(deindent`
			${await_block}.u();
		`);

		block.builders.destroy.addBlock(deindent`
			${await_token} = null;
			${await_block}.d();
		`);

		[this.pending, this.then, this.catch].forEach(status => {
			status.children.forEach(child => {
				child.build(status.block, null,'nodes');
			});
		});
	}

	ssr() {
		const target: SsrTarget = <SsrTarget>this.compiler.target;
		const { snippet } = this.expression;

		target.append('${(function(__value) { if(@isPromise(__value)) return `');

		this.pending.children.forEach((child: Node) => {
			child.ssr();
		});

		target.append('`; return function(ctx) { return `');

		this.then.children.forEach((child: Node) => {
			child.ssr();
		});

		target.append(`\`;}(Object.assign({}, ctx, { ${this.value}: __value }));}(${snippet})) }`);
	}
}
