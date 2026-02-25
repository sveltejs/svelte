import { tick } from 'svelte';
import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>a</button><button>b</button><p>pending</p>`,

	async test({ assert, target, warnings }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>a</button><button>b</button><h1>3</h1>');

		assert.deepEqual(normalise_trace_logs(warnings), [
			{
				log: 'Detected reactivity loss when reading `values.length`. This happens when state is read in an async function after an earlier `await`'
			}
		]);
	}
});
