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
	const status = block.getUniqueName(`status`);
	const select_block_type = block.getUniqueName(`select_block_type`);
	const await_block = block.getUniqueName(`await_block`);
	const await_block_type = block.getUniqueName(`await_block_type`);
	const token = block.getUniqueName(`token`);
	const await_token = block.getUniqueName(`await_token`);
	const update = block.getUniqueName(`update`);
	const handle_promise = block.getUniqueName(`handle_promise`);
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
		function ${handle_promise}(${promise}, ${params}) {
			var ${token} = ${await_token} = {};

			if (@isPromise(${promise})) {
				${promise}.then(function(${value}) {
					if (${token} !== ${await_token}) return;
					${await_block}.u();
					${await_block}.d();
					${await_block} = (${await_block_type} = ${create_then_block})(${params}, ${resolved} = ${value}, #component);
					${await_block}.c();
					${await_block}.m(${anchor}.parentNode, ${anchor});
				}, function (${error}) {
					if (${token} !== ${await_token}) return;
					${await_block}.u();
					${await_block}.d();
					${await_block} = (${await_block_type} = ${create_catch_block})(${params}, ${resolved} = ${error}, #component);
					${await_block}.c();
					${await_block}.m(${anchor}.parentNode, ${anchor});
				});

				// if we previously had a then/catch block, destroy it
				if (${await_block_type} !== ${create_pending_block}) {
					if (${await_block}) {
						${await_block}.u();
						${await_block}.d();
					}
					${await_block} = (${await_block_type} = ${create_pending_block})(${params}, ${resolved} = null, #component);
					return true;
				}
			} else {
				if (${await_block_type} !== ${create_then_block}) {
					if (${await_block}) ${await_block}.d();
					${await_block} = (${await_block_type} = ${create_then_block})(${params}, ${resolved} = promise, #component);
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
		${await_block}.m(${targetNode}, ${anchor});
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
				${await_block}.c();
				${await_block}.m(${anchor}.parentNode, ${anchor});
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