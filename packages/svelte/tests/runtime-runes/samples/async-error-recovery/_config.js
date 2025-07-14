import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>clicks: 0</button>
		<p>pending...</p>
	`,

	compileOptions: {
		// this tests some behaviour that was broken in dev
		dev: true
	},

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 0</button>
				<p>0</p>
			`
		);

		let [button] = target.querySelectorAll('button');
		let [p] = target.querySelectorAll('p');

		button.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 1</button>
				<p>1</p>
			`
		);

		button.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 2</button>
				<p>2</p>
			`
		);

		button.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 3</button>
				<button>retry</button>
			`
		);

		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		await tick();

		button2.click();
		await tick();

		[p] = target.querySelectorAll('p');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 4</button>
				<p>4</p>
			`
		);

		button1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 5</button>
				<p>5</p>
			`
		);
	}
});
