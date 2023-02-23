export default {
	html: `
		<button>Disable</button>
		<button slot="footer">Button</button>
		<button slot="footer">Button</button>
	`,
	async test({ assert, target, window }) {
		const [btn, btn1, btn2] = target.querySelectorAll('button');

		await btn.dispatchEvent(new window.MouseEvent('click'));

		assert.equal(btn1.disabled, true);
		assert.equal(btn2.disabled, true);
	}
};
