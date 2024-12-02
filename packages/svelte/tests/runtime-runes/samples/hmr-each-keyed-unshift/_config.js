import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>unshift</button>`,

	compileOptions: {
		dev: true,
		hmr: true
	},

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>unshift</button>
				<p>child</p>
			`
		);

		flushSync(() => btn?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>unshift</button>
				<p>child</p>
				<p>child</p>
			`
		);
	}
});
