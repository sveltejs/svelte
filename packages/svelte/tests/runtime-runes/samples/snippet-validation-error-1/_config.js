import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error:
		'render_tag_invalid_argument\n' +
		'The argument to `{@render ...}` must be a snippet function, not a component or some other kind of function. ' +
		'If you want to dynamically render one snippet or another, use `$derived` and pass its result to `{@render ...}`'
});
