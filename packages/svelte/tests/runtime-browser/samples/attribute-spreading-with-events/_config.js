import { test } from '../../assert';
import { tick } from 'svelte';

export default test({
	async test({ assert, target }) {
		await tick();

		const el = /** @type {HTMLDivElement} */ (target.querySelector('div'));
		const animation_end = new window.AnimationEvent('animationend');

		el.dispatchEvent(animation_end);

		await tick();

		assert.htmlEqual(target.innerHTML, '<div></div> <span>animation ended</span>');
	}
});
