export default {
	data: {
		x: 1,
		y: false,
	},

	html: `
		<span>1</span>
	`,

	nestedTransitions: true,

	test(assert, component, target) {
		component.set({ x: 2 });
		assert.htmlEqual(target.innerHTML, `
			<span>2</span>
		`);
	},
};
