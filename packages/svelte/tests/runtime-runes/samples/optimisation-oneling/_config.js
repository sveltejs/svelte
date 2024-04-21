import { ok, test } from '../../test';
import { flushSync, tick } from 'svelte';

export default test({
	html: `
		<button>Show</button>
		<button>0</button>
		<div><span>0</span></div>
	`,
	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			<button>1</button>
			<div></div>
			`
		);

		// able to remount the component
		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			<button>2</button>
			<div><span>2</span></div>
			`
		);

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			<button>3</button>
			<div></div>
			`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			<button>3</button>
			<div></div>
			`
		);

		btn2 = target.querySelectorAll('button')[1];

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Show</button>
			<button>4</button>
			<div><span>4</span></div>
			`
		);
	}
});
