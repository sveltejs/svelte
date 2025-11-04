import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['server'],

	ssrHtml: '<p>yep</p>',

	async test({ assert, target, variant }) {
		if (variant === 'dom') {
			await tick();
		}

		assert.htmlEqual(target.innerHTML, '<p>yep</p>');
	}
});
