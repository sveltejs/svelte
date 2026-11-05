import { flushSync } from 'svelte';
import { assert_ok, test } from '../../test';

export default test({
	compileOptions: { dev: true },
	server_props: { browser: false },
	props: { browser: true },
	snapshot(target) {
		return Object.fromEntries(
			Array.from(target.querySelectorAll('.after, button:not(.reset)'), (node, index) => [
				index,
				node
			])
		);
	},
	test(assert, target) {
		const [reset, button] = target.querySelectorAll('button');
		assert_ok(button);
		button.click();
		assert.equal(button.textContent, 'clicked');

		assert_ok(reset);
		const after = reset.nextElementSibling;
		flushSync(() => reset.click());

		const recovered = target.querySelector('.recovered');
		assert_ok(recovered);
		assert.equal(recovered.textContent, 'recovered');
		assert.equal(recovered.nextElementSibling, after);
		assert.equal(target.querySelector('button.reset'), null);
		assert.equal(target.querySelector('button'), button);
	}
});
