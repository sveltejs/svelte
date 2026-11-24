import { test } from '../../test-dom.test';
import { containers } from './_renderer';

/**
 * @param {any} node
 * @param {any[]} [result]
 */
function empty_text_nodes(node, result = []) {
	if (node.type === 'text' && node.value === '') result.push(node);
	for (const child of node.children ?? []) empty_text_nodes(child, result);
	return result;
}

export default test({
	// the crossing is represented in the host tree by a node the runtime created...
	html: '<custom></custom>',
	test({ assert, target, serialize }) {
		const [custom] = target.children;
		assert.deepEqual(
			custom.children.map((/** @type {any} */ n) => n.type),
			['comment', 'comment']
		);
		assert.deepEqual(empty_text_nodes(target), []);

		// ...and the guest content is rendered into the container, between two markers
		const container = containers.at(-1);
		assert.equal(serialize(container), '<b>child</b>');
		assert.deepEqual(empty_text_nodes(container), []);
	}
});
