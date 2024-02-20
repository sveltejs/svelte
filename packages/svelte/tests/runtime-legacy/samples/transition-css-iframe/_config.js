import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		const frame = /** @type {HTMLIFrameElement} */ (target.querySelector('iframe'));
		await tick();

		component.visible = true;
		const div = frame.contentDocument?.querySelector('div');
		ok(div);

		raf.tick(25);

		component.visible = false;

		raf.tick(26);
		// The exact number doesn't matter here, this test is about ensuring that transitions work in iframes
		assert.equal(Number(div.style.opacity).toFixed(4), '0.8333');
	}
});
