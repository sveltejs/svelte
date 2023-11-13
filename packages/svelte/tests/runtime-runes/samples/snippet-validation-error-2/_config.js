import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error: 'A snippet must be rendered with `{@render ...}`'
});
