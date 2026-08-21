import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const [button1, button2, button3] = target.querySelectorAll('button');
		ok(button1);

		flushSync(() => button1.click());
		assert.htmlEqual(button1.innerHTML, `items: []`);

		flushSync(() => button1.click());
		assert.htmlEqual(button1.innerHTML, `items: [0]`);

		const input = target.querySelector('input');
		ok(input);
		input.checked = true;
		flushSync(() => input.dispatchEvent(new Event('change', { bubbles: true })));

		flushSync(() => button2.click());
		flushSync(() => button3.click());

		assert.deepEqual(warnings, [
			'Assignment to `items` property (main.svelte:17:24) will evaluate to the right-hand side, not the value of `items` following the assignment. This may result in unexpected behaviour.'
		]);
	}
});
