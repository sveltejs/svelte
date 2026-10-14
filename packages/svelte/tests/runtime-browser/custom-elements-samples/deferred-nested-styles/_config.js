import { assert_ok, test } from '../../assert';

const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<my-app></my-app>';

		// wait for the initial mount, the `onMount` reveal and the deferred re-render
		await tick();
		await tick();
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('my-app');
		const p = el.shadowRoot.querySelector('p');
		assert_ok(p);

		// The child's scoped styles must be injected into the shadow root, not `document.head`
		assert_ok(el.shadowRoot.querySelector('style'));
		assert.equal(getComputedStyle(p).color, 'rgb(255, 0, 0)');
	}
});
