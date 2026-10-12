import { tick } from 'svelte';
import { test } from '../../test';

/** @type {Array<() => void>} */
const resolvers = [];

export default test({
	transformError: (error) => new Promise((resolve) => resolvers.push(() => resolve(error))),

	async test({ assert, target, logs }) {
		const [error, toggle, reset, destroy] = target.querySelectorAll('button');
		const paragraph = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));

		error.click();
		await tick();
		resolvers.shift()?.();
		await tick();
		assert.htmlEqual(paragraph.innerHTML, 'boom');

		// A retained reset is inert after its boundary has been destroyed
		toggle.click();
		await tick();
		reset.click();
		await tick();
		assert.htmlEqual(paragraph.innerHTML, 'boom');

		// Resolving an error transform cannot resume a destroyed boundary
		toggle.click();
		await tick();
		error.click();
		await tick();
		toggle.click();
		await tick();
		resolvers.shift()?.();
		await tick();
		assert.htmlEqual(paragraph.innerHTML, 'boom');

		// A failed snippet's reset is also inert while the boundary is being destroyed
		toggle.click();
		await tick();
		error.click();
		await tick();
		resolvers.shift()?.();
		await tick();
		destroy.click();
		await tick();
		assert.htmlEqual(paragraph.innerHTML, 'boom,boom');
		assert.deepEqual(logs, ['render', 'render', 'render']);
	}
});
