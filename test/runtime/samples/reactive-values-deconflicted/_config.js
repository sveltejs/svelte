export default {
	html: '<span>waiting</span>',

	test({ assert, component, target }) {
		component.x = 'ready';
		assert.htmlEqual(
			target.innerHTML,
			`
			<span>ready</span>
		`
		);
	}
};
