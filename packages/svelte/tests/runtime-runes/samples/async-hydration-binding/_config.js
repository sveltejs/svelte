import { test } from '../../test';

// Tests that renderer.subsume (which is used when bindings are present) works correctly
export default test({
	mode: ['hydrate'],
	html: '<div data-resolved="true">test</div>',
	async test({ assert, warnings }) {
		assert.deepEqual(warnings, []);
	}
});
