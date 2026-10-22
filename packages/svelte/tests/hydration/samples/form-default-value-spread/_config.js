import { assert } from 'vitest';
import { test } from '../../test';

export default test({
	// Check the browser's parsed values both before and after hydration. The client may
	// change default attributes/text content while preserving the current values.
	snapshot(target) {
		const textareas = [...target.querySelectorAll('textarea')];
		const inputs = [...target.querySelectorAll('input')];
		assert.deepEqual(
			textareas.map((node) => node.value),
			Array(5).fill('\n<hello & goodbye>')
		);
		assert.deepEqual(
			inputs.map((node) => node.checked),
			[true, true, false]
		);
		assert.equal(target.querySelector('[defaultvalue], [defaultchecked], textarea[value]'), null);
		return Object.fromEntries([...textareas, ...inputs].map((node, i) => [i, node]));
	}
});
