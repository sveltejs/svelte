import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// TODO reinstate
	skip: true,

	compileOptions: {
		dev: true
	},

	html: `<button>a</button><button>b</button><p>pending</p>`,

	async test({ assert, target, warnings }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>a</button><button>b</button><h1>3</h1>');

		assert.equal(
			warnings[0],
			'Detected reactivity loss when reading `values[1]`. This happens when state is read in an async function after an earlier `await`'
		);

		assert.equal(warnings[1].name, 'traced at');

		assert.equal(warnings.length, 2);
	}
});
