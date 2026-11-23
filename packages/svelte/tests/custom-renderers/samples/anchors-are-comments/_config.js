import { flushSync } from 'svelte';
import { test } from '../../test';

/**
 * Collects the empty text nodes in a tree. Anchors created by the runtime must be comments
 * when using a custom renderer, so that every text node is content the template produced
 * @param {any} node
 * @param {any[]} [result]
 */
function empty_text_nodes(node, result = []) {
	if (node.type === 'text' && node.value === '') result.push(node);
	for (const child of node.children ?? []) empty_text_nodes(child, result);
	return result;
}

export default test({
	html: '<button>update</button> <ul><li>1</li><li>2</li></ul> <section><span>inside</span></section> <div><p>visible</p></div>',
	test({ assert, target, serialize, dispatch_event }) {
		assert.deepEqual(empty_text_nodes(target), []);

		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		dispatch_event(button, 'click');
		flushSync();

		assert.equal(
			serialize(target),
			'<button>update</button> <ul><li>1</li><li>2</li><li>3</li></ul> <article><span>inside</span></article> <div><p>hidden</p></div>'
		);
		assert.deepEqual(empty_text_nodes(target), []);
	}
});
