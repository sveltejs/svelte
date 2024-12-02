import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	<p>
		<button>set handler 1</button>
		<button>set handler 2</button>
	</p>
	<p>0</p>
	<button>click</button>
	`,

	test({ assert, target, window }) {
		const [updateButton1, updateButton2, button] = target.querySelectorAll('button');

		const event = new window.MouseEvent('click', { bubbles: true });
		let err = '';
		window.addEventListener('error', (e) => {
			e.preventDefault();
			err = e.message;
		});

		button.dispatchEvent(event);
		flushSync();
		assert.equal(err, '', err);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>
				<button>set handler 1</button>
				<button>set handler 2</button>
			</p>
			<p>0</p>
			<button>click</button>
		`
		);

		updateButton1.dispatchEvent(event);
		flushSync();
		button.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>
				<button>set handler 1</button>
				<button>set handler 2</button>
			</p>
			<p>1</p>
			<button>click</button>
		`
		);

		updateButton2.dispatchEvent(event);
		button.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>
				<button>set handler 1</button>
				<button>set handler 2</button>
			</p>
			<p>2</p>
			<button>click</button>
		`
		);
	}
});
