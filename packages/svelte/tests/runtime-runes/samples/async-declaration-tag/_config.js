import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [top, change] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>name</button>
			<button>change name</button>
			<p>Hello name</p>
			<div><span>nested Hi name</span></div>
		`
		);

		top.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>other</button>
			<button>change name</button>
			<p>Hello name</p>
			<div><span>nested Hi name</span></div>
		`
		);

		change.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>other</button>
			<button>change name</button>
			<p>Hello other</p>
			<div><span>nested Hi other</span></div>
		`
		);
	}
});
