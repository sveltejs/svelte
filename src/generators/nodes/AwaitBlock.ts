import deindent from '../../utils/deindent';
import Node from './shared/Node';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import createDebuggingComment from '../../utils/createDebuggingComment';

export default class AwaitBlock extends Node {
	value: string;
	error: string;
	expression: Node;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName('await_block');
		block.addDependencies(this.metadata.dependencies);

		let dynamic = false;

		[
			['pending', null],
			['then', this.value],
			['catch', this.error]
		].forEach(([status, arg]) => {
			const child = this[status];

			child.block = block.child({
				comment: createDebuggingComment(child, this.generator),
				name: this.generator.getUniqueName(`create_${status}_block`),
				contexts: new Map(block.contexts),
				contextTypes: new Map(block.contextTypes)
			});

			if (arg) {
				child.block.context = arg;
				child.block.contexts.set(arg, arg); // TODO should be using getUniqueName
				child.block.contextTypes.set(arg, status);
			}

			child.initChildren(child.block, stripWhitespace, nextSibling);
			this.generator.blocks.push(child.block);

			if (child.block.dependencies.size > 0) {
				dynamic = true;
				block.addDependencies(child.block.dependencies);
			}
		});

		this.pending.block.hasUpdateMethod = dynamic;
		this.then.block.hasUpdateMethod = dynamic;
		this.catch.block.hasUpdateMethod = dynamic;
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const name = this.var;

		const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);
		const updateMountNode = this.getUpdateMountNode(anchor);

		block.contextualise(this.expression);
		const { snippet } = this.metadata;

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

		// the `#component.root.set({})` below is just a cheap way to flush
		// any oncreate handlers. We could have a dedicated `flush()` method
		// but it's probably not worth it

		block.builders.init.addBlock(deindent`
			function ${replace_await_block}(${token}, type, state) {
				if (${token} !== ${await_token}) return;

				var ${old_block} = ${await_block};
				${await_block} = type && (${await_block_type} = type)(#component, state);

				if (${old_block}) {
					${old_block}.u();
					${old_block}.d();
					${await_block}.c();
					${await_block}.m(${updateMountNode}, ${anchor});

					#component.root.set({});
				}
			}

			function ${handle_promise}(${promise}, state) {
				var ${token} = ${await_token} = {};

				if (@isPromise(${promise})) {
					${promise}.then(function(${value}) {
						${this.then.block.context ? deindent`
							var state = #component.get();
							${resolved} = { ${this.then.block.context}: ${value} };
							${replace_await_block}(${token}, ${create_then_block}, @assign({}, state, ${resolved}));
						` : deindent`
							${replace_await_block}(${token}, null, null);
						`}
					}, function (${error}) {
						${this.catch.block.context ? deindent`
							var state = #component.get();
							${resolved} = { ${this.catch.block.context}: ${error} };
							${replace_await_block}(${token}, ${create_catch_block}, @assign({}, state, ${resolved}));
						` : deindent`
							${replace_await_block}(${token}, null, null);
						`}
					});

					// if we previously had a then/catch block, destroy it
					if (${await_block_type} !== ${create_pending_block}) {
						${replace_await_block}(${token}, ${create_pending_block}, state);
						return true;
					}
				} else {
					${resolved} = { ${this.then.block.context}: ${promise} };
					if (${await_block_type} !== ${create_then_block}) {
						${replace_await_block}(${token}, ${create_then_block}, @assign({}, state, ${resolved}));
						return true;
					}
				}
			}

			${handle_promise}(${promise} = ${snippet}, state);
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
		if (this.metadata.dependencies) {
			conditions.push(
				`(${this.metadata.dependencies.map(dep => `'${dep}' in changed`).join(' || ')})`
			);
		}

		conditions.push(
			`${promise} !== (${promise} = ${snippet})`,
			`${handle_promise}(${promise}, state)`
		);

		if (this.pending.block.hasUpdateMethod) {
			block.builders.update.addBlock(deindent`
				if (${conditions.join(' && ')}) {
					// nothing
				} else {
					${await_block}.p(changed, @assign({}, state, ${resolved}));
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
}