import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>items: null</button> <div>x</div> <input type="checkbox" value="1"><input type="checkbox" value="2"><input>`,

	test({ assert, target, warnings }) {
		const btn = target.querySelector('button');
		ok(btn);

		flushSync(() => btn.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>items: []</button> <div>x</div> <input type="checkbox" value="1"><input type="checkbox" value="2"><input>`
		);

		flushSync(() => btn.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>items: [0]</button> <div>x</div> <input type="checkbox" value="1"><input type="checkbox" value="2"><input>`
		);

		const input = target.querySelector('input');
		ok(input);
		input.checked = true;
		flushSync(() => input.dispatchEvent(new Event('change', { bubbles: true })));

		assert.deepEqual(warnings, [
			'Assignment to `items` property (main.svelte:9:24) will evaluate to the right-hand side, not the value of `items` following the assignment. This may result in unexpected behaviour.'
		]);
	}
});
