import { flushSync } from 'svelte';

import { test } from '../../test';

export default test({
	async test({ assert, component, target, window }) {
		const [in1, in2] = target.querySelectorAll('input');

		flushSync(() => in1.focus());
		assert.equal(window.document.activeElement, in1);
		assert.equal(component.a, true);
		assert.equal(component.b, false);

		flushSync(() => in2.focus());
		assert.equal(window.document.activeElement, in2);
		assert.equal(component.a, false);
		assert.equal(component.b, true);
	}
});
