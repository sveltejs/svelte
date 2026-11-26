import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [open, close, increment] = target.querySelectorAll('button');

		open.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>0</button>
				<div>open (width: 42)</div>
			`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>1</button>
				<div>open (width: 42)</div>
			`
		);

		close.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>1</button>
				<div>closed</div>
			`
		);
	}
});
