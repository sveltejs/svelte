export default {
	props: {
		x: 1
	},

	test({ assert, component }) {
		component.$destroy();
		component.x = 2;
	}
};
