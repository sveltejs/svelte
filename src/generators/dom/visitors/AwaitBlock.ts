import deindent from '../../../utils/deindent';
import visit from '../visit';
import { DomGenerator } from '../index';
import Block from '../Block';
import isDomNode from './shared/isDomNode';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitAwaitBlock(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) {
	const name = node.var;

	const needsAnchor = node.next ? !isDomNode(node.next, generator) : !state.parentNode || !isDomNode(node.parent, generator);
	const anchor = needsAnchor
		? block.getUniqueName(`${name}_anchor`)
		: (node.next && node.next.var) || 'null';

	const params = block.params.join(', ');

	block.contextualise(node.expression);
	const { snippet } = node.metadata;

	if (needsAnchor) {
		block.addElement(
			anchor,
			`@createComment()`,
			`@createComment()`,
			state.parentNode
		);
	}

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
	const create_pending_block = node.pending._block.name;
	const create_then_block = node.then._block.name;
	const create_catch_block = node.catch._block.name;

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
				${await_block}.m(${state.parentNode || `${anchor}.parentNode`}, ${anchor});
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
		${await_block}.l(${state.parentNodes});
	`);

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.mount.addBlock(deindent`
		${await_block}.m(${targetNode}, ${anchorNode});
	`);

	const conditions = [];
	if (node.metadata.dependencies) {
		conditions.push(
			`(${node.metadata.dependencies.map(dep => `'${dep}' in changed`).join(' || ')})`
		);
	}

	conditions.push(
		`${promise} !== (${promise} = ${snippet})`,
		`${handle_promise}(${promise}, ${params})`
	);

	if (node.pending._block.hasUpdateMethod) {
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

	[node.pending, node.then, node.catch].forEach(status => {
		status.children.forEach(child => {
			visit(generator, status._block, status._state, child, elementStack, componentStack);
		});
	});
}