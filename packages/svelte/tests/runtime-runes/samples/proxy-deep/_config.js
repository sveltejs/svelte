import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>1</button>
		<button>double</button>
	`,

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>2</button>
				<button>double</button>
			`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>4</button>
				<button>double</button>
			`
		);

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>5</button>
				<button>double</button>
			`
		);
	}
});
