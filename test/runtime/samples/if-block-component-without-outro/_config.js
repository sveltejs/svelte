export default {
	skipIntroByDefault: true,
	nestedTransitions: true,

	data: {
		foo: true,
	},

	html: '<div>A wild component appears</div>',

	test(assert, component, target) {
		component.set({ foo: false });
		assert.htmlEqual(target.innerHTML, '');
	},
};
