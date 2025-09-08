import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, resolve] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>0</button>
			<button>shift</button>
		`
		);

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
			<button>shift</button>
		`
		);

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<button>shift</button>
			<p>loading...</p>
		`
		);

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<button>shift</button>
			<p>2</p>
		`
		);

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<button>shift</button>
			<p>2</p>
		`
		);

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>3</button>
			<button>shift</button>
			<p>3</p>
		`
		);
	}
});
