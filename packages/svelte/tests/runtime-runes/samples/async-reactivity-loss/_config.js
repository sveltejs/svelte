import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// TODO reinstate this
	skip: true,

	compileOptions: {
		dev: true
	},

	html: `<button>a</button><button>b</button><button>c</button><p>pending</p>`,

	async test({ assert, target, warnings }) {
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a</button><button>b</button><button>c</button><h1>6</h1><p>6</p>'
		);

		assert.equal(
			warnings[0],
			'Detected reactivity loss when reading `b`. This happens when state is read in an async function after an earlier `await`'
		);

		assert.equal(warnings[1].name, 'traced at');

		assert.equal(warnings.length, 2);
	}
});
