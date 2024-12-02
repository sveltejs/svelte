import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>bar</button>',

	async test({ assert, target, window }) {
		const [button] = target.querySelectorAll('button');

		const event = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>foo</button>');

		button.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>bar</button>');

		button.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>foo</button>');
	}
});
