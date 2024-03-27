import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'server'],

	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');
		const input = target.querySelector('input');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="checkbox"><button>x:
		 6,
		 y:
		 12</button><button>x:
		 2,
		 y:
		 4</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="checkbox"><button>x:
		 6,
		 y:
		 12</button><button>x:
		 3,
		 y:
		 6</button>`
		);

		flushSync(() => {
			input?.click();
		});

		assert.htmlEqual(target.innerHTML, `<input type="checkbox">`);

		flushSync(() => {
			input?.click();
		});

		[btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="checkbox"><button>x:
		 7,
		 y:
		 14</button><button>x:
		 4,
		 y:
		 8</button>`
		);
	}
});
