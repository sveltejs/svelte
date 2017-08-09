export default {
	data: {
		x: 1
	},

	test(assert, component) {
		component.destroy();
		component.set({ x: 2 });
	}
};