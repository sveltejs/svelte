import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [togglePortalKey, toggleOutletKey, shift, pop, commit] =
			target.querySelectorAll('button');

		togglePortalKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> ab'
		);

		toggleOutletKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> ab'
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> bb hi'
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> bb hi'
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> ba'
		);

		toggleOutletKey.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> ba'
		);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> <button>commit</button> bb hi'
		);
	}
});
