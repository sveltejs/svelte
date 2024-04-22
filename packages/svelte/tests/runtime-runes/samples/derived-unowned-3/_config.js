import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Activate</button><button>Toggle</button>\nneighba\nneighba`
		);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Activate</button><button>Toggle</button>\nzeeba\nzeeba`
		);
	}
});
