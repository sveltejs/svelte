import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	html: `<input type="number"><input type="number"><div>0</div><div>0</div><button>i+</button>`,
	ssrHtml: `<input type="number" value="0"><input type="number" value="0"><div>0</div><div>0</div><button>i+</button>`,

	test({ assert, target }) {
		const [input1, input2] = target.querySelectorAll('input');
		ok(input1);
		ok(input2);
		assert.equal(input1.value, '0');
		assert.equal(input2.value, '0');

		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"><input type="number"><div>0</div><div>1</div><button>i+</button>`
		);

		assert.equal(input1.value, '0');
		assert.equal(input2.value, '1');

		const event = new window.Event('input');

		input1.value = '2';
		input1.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<input type="number"><input type="number"><div>2</div><div>2</div><button>i+</button>`
		);
	}
});
