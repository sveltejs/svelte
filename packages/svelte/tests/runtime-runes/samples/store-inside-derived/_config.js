import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test: ({ assert, target }) => {
		const [loading, increment] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>$value: 0</div>
				<div>valueFromStore.current: 0</div>
				<div>valueDerivedCurrent: 0</div>
				<button>Loading</button>
				<button>Increment</button>
			`
		);

		loading.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<div>$value: Loading...</div>
				<div>valueFromStore.current: Loading...</div>
				<div>valueDerivedCurrent: Loading...</div>
				<button>Loading</button>
				<button>Increment</button>
			`
		);

		increment.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<div>$value: 1</div>
				<div>valueFromStore.current: 1</div>
				<div>valueDerivedCurrent: 1</div>
				<button>Loading</button>
				<button>Increment</button>
			`
		);
	}
});
