export default {
	html: `
		<div>
			<p>foo</p>
		</div>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const click = new window.MouseEvent('click');

		await div.dispatchEvent(click);

		assert.htmlEqual(target.innerHTML, `
			<div>
				<p>foo</p>
			</div>
		`);
	}
};
