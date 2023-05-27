export default {
	get props() {
		return { x: true };
	},

	test({ component }) {
		component.x = false;
	}
};
