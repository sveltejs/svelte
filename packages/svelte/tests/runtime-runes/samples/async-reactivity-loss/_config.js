import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>a</button><button>b</button><p>pending</p>`,

	async test({ assert, target, warnings }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>a</button><button>b</button><h1>3</h1><p>3</p>');

		assert.equal(
			warnings[0],
			'Detected reactivity loss when reading `b`. This happens when state is read in an async function after an earlier `await`'
		);

		assert.equal(warnings[1].name, 'TracedAtError');

		assert.equal(warnings.length, 2);
	}
});
