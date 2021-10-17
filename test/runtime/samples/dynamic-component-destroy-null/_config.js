export default {
	props: {
		x: true
	},

	test({ component }) {
		component.x = false;
	}
};
