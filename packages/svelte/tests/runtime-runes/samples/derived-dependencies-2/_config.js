import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle a</button>
				<button>toggle b</button>
				false/true/true
			`
		);

		flushSync(() => btn2?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle a</button>
				<button>toggle b</button>
			`
		);

		flushSync(() => btn2?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle a</button>
				<button>toggle b</button>
				false/true/true
			`
		);
	}
});
