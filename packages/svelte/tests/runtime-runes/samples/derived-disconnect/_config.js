import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		let [b1, b2, b3, b4, b5] = target.querySelectorAll('button');

		b1?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 1</div>
			<div>Name: a</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b2?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 2</div>
			<div>Name: b</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b3?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 3</div>
			<div>Name: c</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b4?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 4</div>
			<div>Name: d</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b5?.click();
		flushSync();

		b5?.click();
		flushSync();

		[b1, b2, b3, b4, b5] = target.querySelectorAll('button');

		b1?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 1</div>
			<div>Name: a</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b2?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 2</div>
			<div>Name: b</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b3?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 3</div>
			<div>Name: c</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);

		b4?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<main><div>Current ID: 4</div>
			<div>Name: d</div><div><button>a</button></div><div><button>b</button></div><div><button>c</button></div><div><button>d</button></div><hr><div>
			<button>Show / Hide</button></div></main>`
		);
	}
});
