export default {
	nestedTransitions: true,

	props: {
		x: true,
		things: ['a', 'b']
	},

	test(assert, component, target, window, raf) {
		component.set({ x: false });
		assert.htmlEqual(target.innerHTML, '');
	},
};
