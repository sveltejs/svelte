export default {
	html: `
		<div>7</div>
	`,
	async test({ component, target, assert }) {
		component.a = 5;

		assert.htmlEqual(target.innerHTML, `
			<div>9</div>
		`);
	}
};
