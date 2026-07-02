import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>toggle portalKey</button> <button>toggle outletKey</button> hi',
	test({ assert, target }) {
		const [togglePortalKey, toggleOutletKey] = target.querySelectorAll('button');

		togglePortalKey.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button>'
		);

		toggleOutletKey.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button>'
		);

		toggleOutletKey.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button>'
		);

		togglePortalKey.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle portalKey</button> <button>toggle outletKey</button> hi'
		);
	}
});
