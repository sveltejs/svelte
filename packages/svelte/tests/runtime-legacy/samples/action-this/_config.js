import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const click = new window.MouseEvent('click');

		assert.htmlEqual(target.innerHTML, '<button>1</button>');
		button.dispatchEvent(click);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>2</button>');
	}
});
