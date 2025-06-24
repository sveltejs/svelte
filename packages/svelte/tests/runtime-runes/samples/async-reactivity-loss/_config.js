import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>a</button><button>b</button><p>pending</p>`,

	async test({ assert, target, warnings }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>a</button><button>b</button><h1>3</h1>');

		assert.deepEqual(warnings, ['Detected reactivity loss']);
	}
});
