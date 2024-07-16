import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error: 'You are trying to render something that is not a Svelte component'
});
