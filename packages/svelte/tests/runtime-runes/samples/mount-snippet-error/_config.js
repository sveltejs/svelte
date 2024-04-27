import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, target }) {
		const div = target.querySelector('div');
		assert.htmlEqual(div?.innerHTML || '', '');
	},
	runtime_error: 'snippet_used_as_component\nA snippet must be rendered with `{@render ...}`'
});
