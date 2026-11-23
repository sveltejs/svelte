import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [toggle, increment] = target.querySelectorAll('button');

		flushSync(() => increment.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<button>count: 1</button>
				<p>show: false</p>
			`
		);

		assert.throws(() => {
			flushSync(() => toggle.click());
		}, /NonExistent is not defined/);

		flushSync(() => increment.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<button>count: 2</button>
				<p>show: true</p>
			` // show: false would also be fine; this is more about ensuring that things continue to work _somehow_
		);
	}
});
