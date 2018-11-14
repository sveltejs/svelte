export default {
	props: {
		x: true
	},

	nestedTransitions: true,

	test(assert, component) {
		component.set({
			x: false
		});
	}
};