import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // Render in dev mode to check that the validation error is not thrown
	},
	html: `A\nB\nC\nD`
});
