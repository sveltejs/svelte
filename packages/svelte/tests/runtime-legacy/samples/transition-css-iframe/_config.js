import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		const frame = /** @type {HTMLIFrameElement} */ (target.querySelector('iframe'));
		await tick();
		await tick(); // TODO investigate why this second tick is necessary. without it, `Foo.svelte` initializes with `visible = true`, incorrectly

		component.visible = true;
		const div = frame.contentDocument?.querySelector('div');
		ok(div);

		raf.tick(25);

		component.visible = false;

		raf.tick(25);
		assert.equal(div.style.opacity, '0.25');

		raf.tick(35);
		assert.equal(div.style.opacity, '0.15');
	}
});
