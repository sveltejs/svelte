import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>toggle component</button>
		<button>toggle show</button>
	`,

	test({ assert, component, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle component</button>
				<button>toggle show</button>
				<p>Foo</p>
			`
		);

		flushSync(() => btn2.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle component</button>
				<button>toggle show</button>
			`
		);
	}
});
