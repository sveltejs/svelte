import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		await component.promise;
		await Promise.resolve();
		const span = target.querySelector('span');
		ok(span);
		assert.equal(span.textContent, 'a');

		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		const change = new window.Event('change');

		options[1].selected = true;
		select.dispatchEvent(change);
		flushSync();

		assert.equal(span.textContent, 'b');
	}
});
