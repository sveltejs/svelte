import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>switch to d2</button>
		<button>resolve d1</button>
		<button>resolve d2</button>
		<p>pending</p>
	`,

	async test({ assert, target, errors }) {
		const [toggle, resolve1, resolve2] = target.querySelectorAll('button');

		toggle.click();
		resolve1.click();
		resolve2.click();

		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>switch to d2</button>
				<button>resolve d1</button>
				<button>resolve d2</button>
				<p>two</p>
			`
		);

		assert.deepEqual(errors, []);
	}
});
