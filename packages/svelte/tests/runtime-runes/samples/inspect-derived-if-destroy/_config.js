import { normalise_inspect_logs } from '../../../helpers';
import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, errors, logs }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(target.innerHTML, '<button>clear</button>');
		assert.equal(errors.length, 0);
		assert.deepEqual(normalise_inspect_logs(logs), [[{ id: 1 }, { id: 2 }]]);
	}
});
