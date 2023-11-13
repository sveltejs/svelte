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

	async test({ assert, target, window }) {
		const [updateButton1, updateButton2, button] = target.querySelectorAll('button');

		const event = new window.MouseEvent('click', { bubbles: true });
		let err = '';
		window.addEventListener('error', (e) => {
			e.preventDefault();
			err = e.message;
		});

		await button.dispatchEvent(event);
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

		await updateButton1.dispatchEvent(event);
		await button.dispatchEvent(event);
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

		await updateButton2.dispatchEvent(event);
		await button.dispatchEvent(event);
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
