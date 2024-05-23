import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: '<button>false 0</button>',

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const click = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(click);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>true 1</button>');

		button.dispatchEvent(click);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>false 1</button>');

		button.dispatchEvent(click);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>true 2</button>');
	}
});
