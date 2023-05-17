export default {
	get props() {
		return { x: 11 };
	},

	html: `
		before-if-after
	`,

	test({ assert, component, target }) {
		component.x = 4;
		assert.htmlEqual(
			target.innerHTML,
			`
			before-elseif-after
		`
		);

		component.x = 6;
		assert.htmlEqual(
			target.innerHTML,
			`
			before-else-after
		`
		);
	}
};
