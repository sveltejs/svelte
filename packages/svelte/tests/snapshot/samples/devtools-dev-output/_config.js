import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		experimental: {
			devtools: ['my-devtools/runtime']
		}
	}
});
