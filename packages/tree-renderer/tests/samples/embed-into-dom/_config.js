import { flushSync } from 'svelte';
import { dom_html, serialize } from '../../platform';
import { connections } from '../../renderer';
import { test } from '../../suite';

export default test({
	// tree content inside the DOM is rendered into a platform root, shown as `<tree-root>`
	target: 'dom',
	html: '<section><tree-root></tree-root></section>',
	test({ assert, instance, target }) {
		const container = /** @type {any} */ (target.querySelector('tree-root')).platform;
		assert.equal(serialize(container), '<label>from the tree</label>');
		assert.equal(connections.open, 1);

		instance.toggle();
		flushSync();
		assert.equal(dom_html(target), '<section></section>');
		assert.deepEqual(container.children, []);
		assert.equal(connections.open, 0);
	}
});
