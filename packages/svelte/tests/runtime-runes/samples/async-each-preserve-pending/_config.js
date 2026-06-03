import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [add, shift] = target.querySelectorAll('button');

		add.click();
		await tick();
		add.click();
		await tick();
		add.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<p>1</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<p>1</p>
				<p>2</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<p>1</p>
				<p>2</p>
				<p>3</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<p>1</p>
				<p>2</p>
				<p>3</p>
				<p>4</p>
			`
		);
	}
});
