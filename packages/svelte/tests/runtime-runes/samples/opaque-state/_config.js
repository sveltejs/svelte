import { flushSync } from 'svelte';
import { test } from '../../test';
import { assert_ok } from '../../../suite';

export default test({
	html: `<button>+</button><button>invalidate</button><div>0</div><div>0</div><input>`,
	ssrHtml: `<button>+</button><button>invalidate</button><div>0</div><div>0</div><input value="0">`,

	test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');
		const input = target.querySelector('input');
		assert_ok(input);

		b1?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>+</button><button>invalidate</button><div>0</div><div>0</div><input>`
		);
		assert.equal(input.value, '0');

		b2?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>+</button><button>invalidate</button><div>1</div><div>1</div><input>`
		);
		assert.equal(input.value, '1');

		input.value = '2';
		input.dispatchEvent(new window.Event('input'));
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>+</button><button>invalidate</button><div>1</div><div>1</div><input>`
		);
	}
});
