import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	html: '<input>',
	warnings: ['`<svelte:element this="input">` is a void element — it cannot have content']
});
