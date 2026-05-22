import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['server'],

	ssrHtml: '<p>yep</p>',

	async test({ assert, target, variant, warnings }) {
		if (variant === 'dom') {
			await tick();
		}

		assert.htmlEqual(target.innerHTML, '<p>yep</p>');

		assert.deepEqual(warnings, []); // TODO not quite sure why this isn't populated yet
	}
});
