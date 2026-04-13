import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, errors }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(target.innerHTML, '<button>clear</button>');

		assert.equal(errors.length, 0);
	}
});
