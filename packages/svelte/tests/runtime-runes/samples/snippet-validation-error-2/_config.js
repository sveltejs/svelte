import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error: 'snippet_used_as_component\nA snippet must be rendered with `{@render ...}`'
});
