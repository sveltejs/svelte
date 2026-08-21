import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, logs }) {
		const files = { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] };
		// @ts-expect-error
		files.items[0].parent = files;
		assert.deepEqual(normalise_trace_logs(logs), [
			{ log: 'test (main.svelte:5:4)' },
			{ log: '$state', highlighted: true },
			{ log: 'filesState.files', highlighted: false },
			{ log: files },
			{ log: '$state', highlighted: true },
			{ log: 'filesState.files.items[0].parent.items', highlighted: false },
			{ log: files.items },
			{ log: '$state', highlighted: true },
			{ log: 'filesState.files.items[0].parent.items[0]', highlighted: false },
			{ log: files.items[0] }
		]);
	}
});
