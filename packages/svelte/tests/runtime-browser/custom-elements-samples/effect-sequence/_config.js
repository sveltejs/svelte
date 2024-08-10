import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		let changed = false;

		target.innerHTML = '<div id="root"><child-element></child-element></div>';
		const root = target.querySelector('#root');

		// Let the custom-elements load
		await tick();

		// Add `change` listener
		root.addEventListener('change', () => {
			changed = true;
		});

		// Let $effect flush
		await tick();

		// the `change` event should have been captured
		assert.equal(changed, true);
	}
});
