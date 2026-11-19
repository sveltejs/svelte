import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

const item = (/** @type {number} */ x, /** @type {number} */ value) =>
	`<s>${x}|${value}</s><custom-root><b>item ${x}</b></custom-root>`;

export default test({
	// based on `runtime-runes/samples/async-each-item-skipped-stale`: the second item is removed
	// by one batch but still needed by another pending batch, so it's moved into an offscreen
	// fragment (including its crossing's host node) and moved back when that batch commits
	target: 'dom',
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, serialize_dom }) {
		const html = () =>
			serialize_dom(target).replace(/\s+/g, ' ').trim().split('</button>').pop()?.trim();

		await tick();
		const [skip, readd, resolve_earlier, resolve_all] = target.querySelectorAll('button');
		assert.equal(html(), `${item(0, 0)}${item(1, 1)}`);
		const [, second] = target.querySelectorAll('custom-root');

		// the second item is skipped by this batch...
		skip.click();
		await tick();
		// ...and needed again by a later batch
		readd.click();
		await tick();

		// the earlier batch commits first, so the second item goes offscreen
		resolve_earlier.click();
		await tick();
		assert.equal(html(), item(3, 6));
		assert.equal(connections.open, 2);

		for (let i = 0; i < 5; i++) {
			await tick();
			resolve_all.click();
		}
		await tick();
		assert.equal(html(), `${item(5, 10)}${item(1, 2)}`);

		// the second item (including the crossing's host node) was moved back, not recreated
		assert.equal(target.querySelectorAll('custom-root')[1], second);
		assert.equal(connections.open, 2);
	}
});
