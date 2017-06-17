export default {
	solo: true,
	
	data: {
		values: [1, 2, 3, 4]
	},

	test(assert, component) {
		component.set({ values: [2, 3] });
	}
};
