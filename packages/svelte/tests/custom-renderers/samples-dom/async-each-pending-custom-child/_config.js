import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

const buttons = '<button>add</button> <button>shift</button>';
const item = (/** @type {number} */ n) => `<p>${n}</p> <custom-root><b>item ${n}</b></custom-root>`;

export default test({
	// based on `runtime-runes/samples/async-each-preserve-pending`: items created by pending
	// batches are rendered offscreen (including their crossings) and inserted when those
	// batches commit. See `async-each-skipped-custom-child` for items moved offscreen
	target: 'dom',
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, serialize_dom }) {
		const html = () => serialize_dom(target).replace(/\s+/g, ' ').trim();

		await tick();
		const [add, shift] = target.querySelectorAll('button');

		add.click();
		await tick();
		add.click();
		await tick();
		add.click();
		await tick();
		assert.equal(html(), `${buttons} ${item(1)}`);
		// items 2-4 already exist offscreen, along with their crossings
		assert.equal(connections.open, 4);

		const first = target.querySelector('custom-root');

		shift.click();
		await tick();
		assert.equal(html(), `${buttons} ${item(1)}${item(2)}`);

		shift.click();
		await tick();
		assert.equal(html(), `${buttons} ${item(1)}${item(2)}${item(3)}`);

		shift.click();
		await tick();
		assert.equal(html(), `${buttons} ${item(1)}${item(2)}${item(3)}${item(4)}`);

		// the offscreen items' crossings were inserted, not recreated
		assert.equal(connections.open, 4);
		assert.equal(target.querySelector('custom-root'), first);
	}
});
