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
		assert.equal(div.style.opacity, '0.16666');
	}
});
