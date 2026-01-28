import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: '<button>10</button>',

	test({ assert, target, window }) {
		const event = new window.MouseEvent('click');

		const button = target.querySelector('button');
		ok(button);

		button.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>11</button>');
	}
});
