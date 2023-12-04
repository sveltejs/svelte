import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	get props() {
		return { tag: 'br' };
	},
	html: '<br>',
	warnings: ['<svelte:element this="br"> is self-closing and cannot have content.']
});
