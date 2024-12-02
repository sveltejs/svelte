import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		let changed = false;

		target.innerHTML = '<child-element></child-element>';

		await tick(); // wait for element to upgrade

		target.addEventListener('change', () => {
			changed = true;
		});

		await tick(); // wait for effect

		assert.equal(changed, true);
	}
});
