import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: '<button>0, 0</button>',

	test({ assert, target, window }) {
		const event = new window.MouseEvent('click', {
			clientX: 42,
			clientY: 42
		});

		const button = target.querySelector('button');
		ok(button);

		button.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>42, 42</button>');
	}
});
