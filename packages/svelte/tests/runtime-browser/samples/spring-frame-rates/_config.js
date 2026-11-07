import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	html: '<p>0.000</p><p>0.000</p>',
	async test({ assert, component, target, window }) {
		// Exercise the compiled bindings with real browser RAF and promise completion.
		const done = component.start();
		const values = () => [...target.querySelectorAll('p')].map((p) => Number(p.textContent));
		await new Promise((resolve) => window.requestAnimationFrame(resolve));
		await new Promise((resolve) => window.requestAnimationFrame(resolve));
		flushSync();
		assert.equal(
			values().every((n) => n > 0 && n < 100),
			true,
			JSON.stringify(values())
		);
		await done;
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>100.000</p><p>100.000</p>');
	}
});
