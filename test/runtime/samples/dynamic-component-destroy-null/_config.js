export default {
	props: {
		x: true
	},

	test({ assert, component }) {
		component.x = false;
	}
};