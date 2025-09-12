/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	context.next({ ...context.state, fragment: node });

	// TODO this indicates whether the fragment contains an `await` expression (not inside
	// a child fragment), which is necessary for ensuring that a `SnippetBlock` creates an
	// async function in SSR. It feels like this is probably duplicative, but it's late
	// and it works, so for now I'm doing it like this
	node.metadata.is_async = node.metadata.hoisted_promises.promises.length > 0;

	if (node.metadata.hoisted_promises.promises.length > 1) {
		node.metadata.hoisted_promises.name = context.state.scope.generate('promises');
	} else {
		// if there's only one promise in this fragment, we don't need to de-waterfall it
		context.state.analysis.hoisted_promises.delete(node.metadata.hoisted_promises.promises[0]);
		node.metadata.hoisted_promises.promises.length = 0;
	}
}
