import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	warnings: ['<svelte:element this="input"> is self-closing and cannot have content.']
});
