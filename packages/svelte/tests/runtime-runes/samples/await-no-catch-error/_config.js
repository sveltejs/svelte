import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const b1 = target.querySelector('button');

		let err = '';
		window.addEventListener('error', (e) => {
			e.preventDefault();
			err = e.message;
		});

		b1?.click();
		await Promise.resolve();
		flushSync();

		assert.throws(() => {
			throw err;
		}, /Test/);
	}
});
