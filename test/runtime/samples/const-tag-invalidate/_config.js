export default {
	html: `
		<div>[Y] A <button>Toggle</button></div>
		<div>[N] B <button>Toggle</button></div>
		<div>[N] C <button>Toggle</button></div>
	`,
	async test({ target, assert, window }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');
		await btn1.dispatchEvent(new window.MouseEvent('click'));
		await btn2.dispatchEvent(new window.MouseEvent('click'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>[N] A <button>Toggle</button></div>
			<div>[Y] B <button>Toggle</button></div>
			<div>[N] C <button>Toggle</button></div>
		`
		);

		await btn2.dispatchEvent(new window.MouseEvent('click'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>[N] A <button>Toggle</button></div>
			<div>[N] B <button>Toggle</button></div>
			<div>[N] C <button>Toggle</button></div>
		`
		);

		await btn3.dispatchEvent(new window.MouseEvent('click'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>[N] A <button>Toggle</button></div>
			<div>[N] B <button>Toggle</button></div>
			<div>[Y] C <button>Toggle</button></div>
		`
		);
	}
};
