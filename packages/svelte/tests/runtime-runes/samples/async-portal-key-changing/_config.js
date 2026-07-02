import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [togglePortalKey, toggleOutletKey, shift, pop] = target.querySelectorAll('button');

		togglePortalKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ab'
		);

		toggleOutletKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ab'
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> bb hi'
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ba'
		);

		togglePortalKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ba'
		);

		toggleOutletKey.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ba'
		);

		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> bb hi'
		);

		pop.click();
		await tick();
		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> <button>shift</button> <button>pop</button> ab'
		);
	}
});
