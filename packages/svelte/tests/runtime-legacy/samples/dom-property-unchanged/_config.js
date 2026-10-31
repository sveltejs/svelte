import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [a, b] = target.querySelectorAll('details');
		const button = target.querySelector('button');
		ok(button);
		assert.equal(a.open, true);
		assert.equal(b.open, false);

		// User toggles must survive unrelated updates in the grouped effect.
		a.open = false;
		b.open = true;
		b.dispatchEvent(new window.Event('toggle'));
		await tick();

		assert.equal(a.open, false);
		assert.equal(b.open, true);

		// A changed expression must still overwrite the current DOM value.
		a.open = true;
		b.open = false;
		button.click();
		await tick();

		assert.equal(a.open, false);
		assert.equal(b.open, true);

		button.click();
		await tick();

		assert.equal(a.open, false);
		assert.equal(b.open, false);
	}
});
