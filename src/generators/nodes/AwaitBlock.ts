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

			const context = block.getUniqueName(arg || '_');
			const contexts = new Map(block.contexts);
			contexts.set(arg, context);

			child.block = block.child({
				comment: createDebuggingComment(child, this.generator),
				name: this.generator.getUniqueName(`create_${status}_block`),
				params: block.params.concat(context),
				context,
				contexts
			});

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

		const anchor = this.getOrCreateAnchor(block, parentNode);

		const params = block.params.join(', ');

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

		block.builders.init.addBlock(deindent`
			function ${replace_await_block}(${token}, type, ${value}, ${params}) {
				if (${token} !== ${await_token}) return;

				var ${old_block} = ${await_block};
				${await_block} = (${await_block_type} = type)(${params}, ${resolved} = ${value}, #component);

				if (${old_block}) {
					${old_block}.u();
					${old_block}.d();
					${await_block}.c();
					${await_block}.m(${parentNode || `${anchor}.parentNode`}, ${anchor});
				}
			}

			function ${handle_promise}(${promise}, ${params}) {
				var ${token} = ${await_token} = {};

				if (@isPromise(${promise})) {
					${promise}.then(function(${value}) {
						${replace_await_block}(${token}, ${create_then_block}, ${value}, ${params});
					}, function (${error}) {
						${replace_await_block}(${token}, ${create_catch_block}, ${error}, ${params});
					});

					// if we previously had a then/catch block, destroy it
					if (${await_block_type} !== ${create_pending_block}) {
						${replace_await_block}(${token}, ${create_pending_block}, null, ${params});
						return true;
					}
				} else {
					${resolved} = ${promise};
					if (${await_block_type} !== ${create_then_block}) {
						${replace_await_block}(${token}, ${create_then_block}, ${resolved}, ${params});
						return true;
					}
				}
			}

			${handle_promise}(${promise} = ${snippet}, ${params});
		`);

		block.builders.create.addBlock(deindent`
			${await_block}.c();
		`);

		block.builders.claim.addBlock(deindent`
			${await_block}.l(${parentNodes});
		`);

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
			`${handle_promise}(${promise}, ${params})`
		);

		if (this.pending.block.hasUpdateMethod) {
			block.builders.update.addBlock(deindent`
				if (${conditions.join(' && ')}) {
					// nothing
				} else {
					${await_block}.p(changed, ${params}, ${resolved});
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