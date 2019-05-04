export default {
	html: `
		<div>
			<input />
			<div class="foo"></div>
		</div>
	`,

	async test({ assert, component, target }) {
		component.value = 'foo';

		assert.htmlEqual(target.innerHTML, `
			<div>
				<input />
				<div class="foo"></div>
			</div>
		`);
	}
};
